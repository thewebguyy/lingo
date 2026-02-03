import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { reformatContent } from '../services/aiService';
import { getDb } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const syncWorker = new Worker('sync-content', async (job: Job) => {
    const { content, platforms, targetDialect } = job.data;
    const results: Record<string, string> = {};

    console.log(`Processing job ${job.id} for content: ${content.substring(0, 50)}...`);

    for (const platform of platforms) {
        try {
            console.log(`Reformatting for ${platform}...`);
            const reformatted = await reformatContent(content, platform, targetDialect);

            if (reformatted) {
                results[platform] = reformatted;
                console.log(`[${platform}] Draft Generated: ${reformatted.substring(0, 100)}...`);
            }

            // Update job progress
            await job.updateProgress({ [platform]: 'completed' });
        } catch (error) {
            console.error(`Error processing ${platform}:`, error);
            results[platform] = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    // Final persistence
    try {
        const db = await getDb();
        await db.run(
            `INSERT OR REPLACE INTO jobs (id, user_id, content, platforms, dialect, results, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [job.id, job.data.userId, content, JSON.stringify(platforms), targetDialect, JSON.stringify(results), 'completed']
        );
    } catch (dbError) {
        console.error('Failed to store job in DB:', dbError);
    }

    return { status: 'success', results };
}, { connection });

console.log('Sync Worker started...');
