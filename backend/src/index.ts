import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncQueue } from './queues/syncQueue';

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

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Lingo Backend' });
});

app.post('/api/sync', async (req: Request, res: Response) => {
    const { content, platforms, targetDialect } = req.body;

    if (!content || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({ error: 'Missing content or platforms' });
    }

    const job = await syncQueue.add('sync-content', {
        content,
        platforms,
        targetDialect,
        userId: 'anonymous', // For MVP
    });

    res.json({ jobId: job.id, message: 'Sync job queued' });
});

app.get('/api/sync/:jobId', async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const job = await syncQueue.getJob(jobId);

    if (!job) {
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

app.listen(port, () => {
    console.log(`Lingo Backend listening at http://localhost:${port}`);
});
