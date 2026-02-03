import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Unified Database Interface
export interface LingoDB {
    saveJob(job: any): Promise<void>;
    getJob(id: string): Promise<any>;
    getUserHistory(userId: string, limit: number): Promise<any[]>;
    saveFeedback(jobId: string, platform: string, rating: number): Promise<void>;
}

// SQLite Implementation (for Local/Persistence fallback)
class SQLiteDB implements LingoDB {
    private db: Database | null = null;

    async init() {
        if (this.db) return;
        this.db = await open({
            filename: path.join(__dirname, '../lingo.db'),
            driver: sqlite3.Database
        });

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                content TEXT,
                platforms TEXT,
                dialect TEXT,
                results TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT,
                platform TEXT,
                rating INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async saveJob(job: any) {
        await this.init();
        await this.db!.run(
            `INSERT OR REPLACE INTO jobs (id, user_id, content, platforms, dialect, results, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [job.id, job.userId, job.content, JSON.stringify(job.platforms), job.dialect, JSON.stringify(job.results), job.status]
        );
    }

    async getJob(id: string) {
        await this.init();
        const job = await this.db!.get(`SELECT * FROM jobs WHERE id = ?`, [id]);
        if (job) {
            job.platforms = JSON.parse(job.platforms);
            job.results = JSON.parse(job.results);
        }
        return job;
    }

    async getUserHistory(userId: string, limit: number = 10) {
        await this.init();
        const rows = await this.db!.all(`SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`, [userId, limit]);
        return rows.map(row => ({
            ...row,
            platforms: JSON.parse(row.platforms),
            results: JSON.parse(row.results)
        }));
    }

    async saveFeedback(jobId: string, platform: string, rating: number) {
        await this.init();
        await this.db!.run(
            `INSERT INTO feedback (job_id, platform, rating) VALUES (?, ?, ?)`,
            [jobId, platform, rating]
        );
    }
}

// PostgreSQL Implementation (for Production/Supabase)
class PostgresDB implements LingoDB {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    async init() {
        // Tables should be created via migrations in real prod, but for MVP:
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                content TEXT,
                platforms JSONB,
                dialect TEXT,
                results JSONB,
                status TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS feedback (
                id SERIAL PRIMARY KEY,
                job_id TEXT,
                platform TEXT,
                rating INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async saveJob(job: any) {
        await this.pool.query(
            `INSERT INTO jobs (id, user_id, content, platforms, dialect, results, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET results = $6, status = $7`,
            [job.id, job.userId, job.content, JSON.stringify(job.platforms), job.dialect, JSON.stringify(job.results), job.status]
        );
    }

    async getJob(id: string) {
        const res = await this.pool.query(`SELECT * FROM jobs WHERE id = $1`, [id]);
        return res.rows[0] || null;
    }

    async getUserHistory(userId: string, limit: number = 10) {
        const res = await this.pool.query(`SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`, [userId, limit]);
        return res.rows;
    }

    async saveFeedback(jobId: string, platform: string, rating: number) {
        await this.pool.query(
            `INSERT INTO feedback (job_id, platform, rating) VALUES ($1, $2, $3)`,
            [jobId, platform, rating]
        );
    }
}

export const db: LingoDB = process.env.DATABASE_URL ? new PostgresDB() : new SQLiteDB();
