import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { reformatContent } from '../services/aiService';
import { db } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const syncWorker = new Worker('sync-content', async (job: Job) => {
    const { content, platforms, targetDialect, userId } = job.data;
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
        } catch (error: any) {
            console.error(`Error processing ${platform}:`, error);
            results[platform] = `Error: ${error.message || String(error)}`;
            await job.updateProgress({ [platform]: 'failed', error: error.message });
        }
    }

    // Final persistence
    try {
        await db.saveJob({
            id: job.id!,
            userId,
            content,
            platforms,
            dialect: targetDialect,
            results,
            status: 'completed'
        });
    } catch (dbError) {
        console.error('Failed to store job in DB:', dbError);
    }

    return { status: 'success', results };
}, { connection });

console.log('Sync Worker started...');
