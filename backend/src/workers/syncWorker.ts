import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { reformatContent } from '../services/aiService';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const syncWorker = new Worker('sync-content', async (job) => {
    const { content, platforms, targetDialect } = job.data;

    console.log(`Processing job ${job.id} for content: ${content.substring(0, 50)}...`);

    for (const platform of platforms) {
        try {
            console.log(`Reformatting for ${platform}...`);
            const reformatted = await reformatContent(content, platform, targetDialect);

            // In a real app, we would call the platform's API here.
            // For MVP, we'll log it as a "Shadow-Draft".
            console.log(`[${platform}] Draft Generated: ${reformatted?.substring(0, 100)}...`);

            // Update job progress or store result
            await job.updateProgress({ [platform]: 'completed' });
        } catch (error) {
            console.error(`Error processing ${platform}:`, error);
        }
    }

    return { status: 'success' };
}, { connection });

console.log('Sync Worker started...');
