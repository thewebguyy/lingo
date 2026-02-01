import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncQueue } from './queues/syncQueue';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Lingo Backend' });
});

app.post('/api/sync', async (req, res) => {
    const { content, platforms, targetDialect } = req.body;

    if (!content || !platforms) {
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

app.listen(port, () => {
    console.log(`Lingo Backend listening at http://localhost:${port}`);
});
