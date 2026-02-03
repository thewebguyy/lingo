import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { syncQueue } from './queues/syncQueue';
import { db } from './db';
import { postToLinkedIn } from './services/linkedinService';

dotenv.config();

// Validate environment variables
const REQUIRED_ENV_VARS = ['OPENAI_API_KEY'];
for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
        console.error(`Error: Missing required environment variable ${envVar}`);
        process.exit(1);
    }
}

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Validation Schemas
const SyncSchema = z.object({
    content: z.string().min(1, "Content cannot be empty").max(10000, "Content too long"),
    platforms: z.array(z.string()).min(1, "Select at least one platform"),
    targetDialect: z.string().optional(),
    userId: z.string().optional()
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Lingo Backend' });
});

app.post('/api/sync', async (req: Request, res: Response) => {
    try {
        const validated = SyncSchema.parse(req.body);
        const { content, platforms, targetDialect, userId } = validated;

        const job = await syncQueue.add('sync-content', {
            content,
            platforms,
            targetDialect,
            userId: userId || 'anonymous',
        });

        res.json({ jobId: job.id, message: 'Sync job queued' });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues[0].message });
        }
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/sync/:jobId', async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const job = await syncQueue.getJob(jobId);

    if (!job) {
        // Fallback to SQLite/PG if job is out of Redis
        try {
            const storedJob = await db.getJob(jobId);
            if (storedJob) {
                return res.json({
                    jobId,
                    state: storedJob.status,
                    results: storedJob.results,
                    progress: 100
                });
            }
        } catch (e) {
            console.error('DB fetch error:', e);
        }
        return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    const returnvalue = job.returnvalue;

    res.json({
        jobId,
        state,
        progress,
        results: returnvalue?.results || null,
        error: returnvalue?.error || null
    });
});

app.get('/api/history/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const history = await db.getUserHistory(userId, 10);
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/feedback', async (req: Request, res: Response) => {
    const { jobId, platform, rating } = req.body;
    try {
        await db.saveFeedback(jobId, platform, rating);
        res.json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/post/linkedin', postToLinkedIn);

app.listen(port, () => {
    console.log(`Lingo Backend listening at http://localhost:${port}`);
});
