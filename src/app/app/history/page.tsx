"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Twitter,
    Linkedin,
    Video,
    Zap,
    Calendar,
    ChevronRight,
    Loader2
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const PLATFORMS = [
    { id: "X", name: "X", icon: Twitter, color: "bg-[#000000]" },
    { id: "LinkedIn", name: "LinkedIn", icon: Linkedin, color: "bg-[#0077b5]" },
    { id: "TikTok", name: "TikTok", icon: Video, color: "bg-[#ff0050]" },
];

export default function HistoryPage() {
    const { userId, isLoaded } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !userId) return;

        const fetchHistory = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/history/${userId}`);
                if (!response.ok) throw new Error("Failed to fetch history");
                const data = await response.json();
                setHistory(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userId, isLoaded]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-black mb-2">Sync History</h1>
                <p className="text-foreground/60">Manage and review your past synchronizations.</p>
            </div>

            {error && (
                <div className="rounded-2xl bg-accent/10 p-6 text-accent border border-accent/20 mb-8">
                    <p className="font-bold">Error loading history</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {history.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-border">
                    <Zap className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                    <p className="text-xl font-bold text-foreground/40">No history yet.</p>
                    <p className="text-foreground/30">Your synchronized content will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group rounded-3xl glass p-6 shadow-sm border-border hover:border-primary/50 transition-all cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">
                                            {item.dialect}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-foreground/40 font-medium">
                                            <Calendar size={12} />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium line-clamp-1 text-foreground/70 mb-3">
                                        {item.content}
                                    </p>
                                    <div className="flex gap-2">
                                        {item.platforms.map((pID: string) => {
                                            const p = PLATFORMS.find(plat => plat.id === pID);
                                            return (
                                                <div key={pID} className={`h-6 w-6 rounded-md flex items-center justify-center text-white ${p?.color || "bg-foreground"}`}>
                                                    {p ? <p.icon size={12} /> : <Zap size={12} />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-bold text-foreground/30 uppercase">Status</p>
                                        <p className="text-sm font-bold text-secondary">Completed</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-white border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
