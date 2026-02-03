"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    LayoutDashboard,
    History,
    Settings,
    Send,
    Copy,
    Check,
    Twitter,
    Linkedin,
    Video,
    Loader2,
    AlertCircle,
    Plus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

const PLATFORMS = [
    { id: "X", name: "X (Twitter)", icon: Twitter, color: "bg-[#000000]" },
    { id: "LinkedIn", name: "LinkedIn", icon: Linkedin, color: "bg-[#0077b5]" },
    { id: "TikTok", name: "TikTok", icon: Video, color: "bg-[#ff0050]" },
];

const DIALECTS = [
    "Standard English",
    "Lagos Pidgin",
    "Gen-Alpha Slang",
    "Professional/Academic",
    "Witty/Sarcastic"
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function App() {
    const { userId } = useAuth();
    const [content, setContent] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["X", "LinkedIn"]);
    const [selectedDialect, setSelectedDialect] = useState("Lagos Pidgin");
    const [isSyncing, setIsSyncing] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, string> | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSync = async () => {
        if (!content.trim() || selectedPlatforms.length === 0) return;

        setIsSyncing(true);
        setError(null);
        setResults(null);
        setStatus("Queuing job...");

        try {
            const response = await fetch(`${BACKEND_URL}/api/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    platforms: selectedPlatforms,
                    targetDialect: selectedDialect,
                    userId: userId || "anonymous"
                }),
            });

            if (!response.ok) throw new Error("Failed to queue job");

            const data = await response.json();
            setJobId(data.jobId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (!jobId || !isSyncing) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/sync/${jobId}`);
                if (!response.ok) throw new Error("Failed to fetch job status");

                const data = await response.json();
                setStatus(data.state);

                if (data.state === "completed") {
                    setResults(data.results);
                    setIsSyncing(false);
                    setJobId(null);
                    clearInterval(pollInterval);
                } else if (data.state === "failed") {
                    setError(data.error || "Job failed");
                    setIsSyncing(false);
                    setJobId(null);
                    clearInterval(pollInterval);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [jobId, isSyncing]);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden w-64 border-r border-border bg-card md:flex flex-col">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Lingo" width={32} height={32} />
                        <span className="text-xl font-bold tracking-tighter">Lingo</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/app" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">
                        <LayoutDashboard size={20} />
                        Synchronizer
                    </Link>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-colors">
                        <History size={20} />
                        History
                    </button>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-colors">
                        <Settings size={20} />
                        Settings
                    </button>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 border border-primary/20">
                        <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Early Access</p>
                        <p className="text-sm font-medium mb-3">You're on the Lingo v1.0 Pilot plan.</p>
                        <button className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-lg shadow-primary/20">
                            Upgrade
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
                    <h1 className="text-lg font-bold">Content Synchronizer</h1>
                    <div className="flex items-center gap-4">
                        <UserButton showName />
                    </div>
                </header>

                <div className="p-6 lg:p-10 max-w-5xl mx-auto">
                    <div className="grid gap-8 lg:grid-cols-5">
                        {/* Input Section */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="rounded-3xl glass p-6 shadow-sm border-border">
                                <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-foreground/50">
                                    Source Content
                                </label>
                                <textarea
                                    className="w-full min-h-[300px] bg-transparent resize-none border-none focus:ring-0 text-lg leading-relaxed placeholder:text-foreground/20"
                                    placeholder="Paste your base content here... (e.g., a LinkedIn post or a script)"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />

                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className="text-xs font-mono text-foreground/40">{content.length} characters</span>
                                    </div>
                                    <button
                                        onClick={() => setContent("")}
                                        className="text-xs font-bold text-accent hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-3xl glass p-6 shadow-sm border-border">
                                <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-foreground/50">
                                    Target Dialect
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DIALECTS.map(dialect => (
                                        <button
                                            key={dialect}
                                            onClick={() => setSelectedDialect(dialect)}
                                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedDialect === dialect
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-white border border-border hover:border-primary/50"
                                                }`}
                                        >
                                            {dialect}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Options & Action Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-3xl glass p-6 shadow-sm border-border">
                                <label className="block text-sm font-bold mb-4 uppercase tracking-wider text-foreground/50">
                                    Sync Destinations
                                </label>
                                <div className="space-y-3">
                                    {PLATFORMS.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => togglePlatform(platform.id)}
                                            className={`flex w-full items-center gap-3 rounded-2xl border p-4 transition-all ${selectedPlatforms.includes(platform.id)
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border bg-white hover:border-primary/30"
                                                }`}
                                        >
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${platform.color}`}>
                                                <platform.icon size={20} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-bold">{platform.name}</p>
                                                <p className="text-xs text-foreground/50">Auto-tone mapping</p>
                                            </div>
                                            {selectedPlatforms.includes(platform.id) && (
                                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSync}
                                disabled={isSyncing || !content.trim() || selectedPlatforms.length === 0}
                                className="group relative w-full overflow-hidden rounded-[2rem] bg-primary p-6 text-xl font-bold text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isSyncing ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            <span>{status || "Syncing..."}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="fill-current" />
                                            <span>Sync Content</span>
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-white/10 to-primary translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </button>

                            {error && (
                                <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-4 text-accent border border-accent/20">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <AnimatePresence>
                        {results && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black">Sync Results</h2>
                                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                        <Check size={20} />
                                        <span>Synchronized Successfully</span>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {Object.entries(results).map(([platform, text]) => {
                                        const platformData = PLATFORMS.find(p => p.id === platform);
                                        return (
                                            <div key={platform} className="rounded-3xl glass p-6 shadow-sm border-border flex flex-col">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${platformData?.color || "bg-foreground"}`}>
                                                            {platformData ? <platformData.icon size={20} /> : <Zap size={20} />}
                                                        </div>
                                                        <span className="font-bold">{platform} Draft</span>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(text, platform)}
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border hover:bg-foreground hover:text-white transition-all shadow-sm"
                                                    >
                                                        {copiedId === platform ? <Check size={18} className="text-secondary" /> : <Copy size={18} />}
                                                    </button>
                                                </div>
                                                <div className="flex-1 rounded-2xl bg-white/50 p-4 text-sm leading-relaxed whitespace-pre-wrap border border-white/50">
                                                    {text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
