"use client";

export const dynamic = "force-dynamic";

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
    Plus,
    ChevronRight,
    ChevronDown
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
    const [feedback, setFeedback] = useState<Record<string, number>>({});

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
        setFeedback({});

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

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to queue job");

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
                    // Don't null jobId yet so we can send feedback
                    clearInterval(pollInterval);
                } else if (data.state === "failed") {
                    setError(data.error || "Job failed during processing");
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

    const handleFeedback = async (platform: string, rating: number) => {
        if (!jobId) return;
        setFeedback(prev => ({ ...prev, [platform]: rating }));
        try {
            await fetch(`${BACKEND_URL}/api/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId, platform, rating })
            });
        } catch (err) {
            console.error("Feedback error:", err);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        if (text.startsWith("Error:")) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isCurrentPath = (path: string) => {
        if (typeof window === 'undefined') return false;
        return window.location.pathname === path;
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
            {/* Sidebar */}
            <aside className="hidden w-72 border-r border-border bg-card md:flex flex-col">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="h-10 w-10 relative">
                            <Image src="/logo.png" alt="Lingo" fill className="object-contain" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">Lingo</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1.5">
                    <Link href="/app" className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 font-bold transition-all ${isCurrentPath('/app') ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'}`}>
                        <LayoutDashboard size={22} strokeWidth={2.5} />
                        Synchronizer
                    </Link>
                    <Link href="/app/history" className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 font-bold transition-all ${isCurrentPath('/app/history') ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'}`}>
                        <History size={22} strokeWidth={2.5} />
                        History
                    </Link>
                    <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-foreground/50 hover:bg-foreground/5 hover:text-foreground font-bold transition-all">
                        <Settings size={22} strokeWidth={2.5} />
                        Settings
                    </button>
                </nav>

                <div className="p-6 mt-auto">
                    <div className="rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-6 border border-white/50 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={16} className="text-primary fill-primary" />
                            <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Pilot Plan</p>
                        </div>
                        <p className="text-sm font-bold mb-4 leading-tight">Unlock Multi-Agent Posting</p>
                        <button className="w-full rounded-2xl bg-foreground py-3 text-xs font-black text-background uppercase tracking-widest hover:scale-105 transition-transform">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-xl">
                    <div className="sm:hidden flex items-center gap-2">
                        <Image src="/logo.png" alt="Lingo" width={28} height={28} />
                        <span className="text-lg font-black tracking-tighter">Lingo</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-black uppercase tracking-widest text-foreground/30">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 border border-border rounded-full flex items-center justify-center bg-white cursor-pointer hover:bg-foreground/5 transition-colors">
                            <Plus size={20} />
                        </div>
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "h-10 w-10 border-2 border-primary/20"
                                }
                            }}
                            showName
                        />
                    </div>
                </header>

                <div className="p-6 lg:p-12 max-w-6xl mx-auto">
                    <div className="grid gap-10 lg:grid-cols-5">
                        {/* Input Section */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-border focus-within:border-primary/50 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-foreground/30">
                                        Source Content
                                    </label>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${content.length > 5000 ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'}`}>
                                        {content.length} / 10000
                                    </span>
                                </div>
                                <textarea
                                    className="w-full min-h-[350px] bg-transparent resize-none border-none focus:ring-0 text-xl font-medium leading-relaxed placeholder:text-foreground/10"
                                    placeholder="Paste your base content here... (e.g., a LinkedIn post or a script)"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />

                                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 text-xs font-bold text-foreground/40 hover:text-primary transition-colors">
                                            <Copy size={14} /> Import from URL
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setContent("")}
                                        className="text-xs font-black text-accent uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                                    >
                                        Clear Canvas
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-border">
                                <label className="block text-xs font-black uppercase tracking-[0.2em] text-foreground/30 mb-6">
                                    Dialect Engine
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                    {DIALECTS.map(dialect => (
                                        <button
                                            key={dialect}
                                            onClick={() => setSelectedDialect(dialect)}
                                            className={`rounded-2xl px-6 py-3 text-sm font-black transition-all ${selectedDialect === dialect
                                                ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105"
                                                : "bg-foreground/5 hover:bg-foreground/10 text-foreground/60"
                                                }`}
                                        >
                                            {dialect}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Options & Action Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-border">
                                <label className="block text-xs font-black uppercase tracking-[0.2em] text-foreground/30 mb-6">
                                    Deployment Hub
                                </label>
                                <div className="space-y-3.5">
                                    {PLATFORMS.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => togglePlatform(platform.id)}
                                            className={`group flex w-full items-center gap-4 rounded-[2rem] border-2 p-5 transition-all ${selectedPlatforms.includes(platform.id)
                                                ? "border-primary bg-primary/5 scale-[1.02] shadow-sm"
                                                : "border-transparent bg-foreground/5 hover:bg-foreground/10"
                                                }`}
                                        >
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 ${platform.color}`}>
                                                <platform.icon size={22} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-black text-sm uppercase tracking-wider">{platform.name}</p>
                                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Optimized Reformatting</p>
                                            </div>
                                            {selectedPlatforms.includes(platform.id) && (
                                                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white">
                                                    <Check size={14} strokeWidth={4} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing || !content.trim() || selectedPlatforms.length === 0}
                                    className="group relative w-full overflow-hidden rounded-[2.5rem] bg-primary p-7 text-xl font-black text-white shadow-2xl shadow-primary/40 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-4 uppercase tracking-[0.1em]">
                                        {isSyncing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={24} />
                                                <span>{status || "Orchestrating..."}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="fill-current" size={24} />
                                                <span>Initialize Sync</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-white/20 to-primary translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                </button>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col gap-3 rounded-[2rem] bg-accent/10 p-6 text-accent border border-accent/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlertCircle size={22} strokeWidth={2.5} />
                                            <p className="font-black uppercase tracking-widest text-xs">Sync Interrupted</p>
                                        </div>
                                        <p className="text-sm font-bold opacity-80 leading-snug">{error}</p>
                                        <button
                                            onClick={handleSync}
                                            className="mt-2 w-fit text-[10px] font-black uppercase tracking-[0.2em] bg-accent text-white px-4 py-2 rounded-full hover:scale-105 transition-transform"
                                        >
                                            Retry Process
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <AnimatePresence>
                        {results && (
                            <motion.div
                                initial={{ opacity: 0, y: 60 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-20 space-y-12"
                            >
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                                    <div>
                                        <h2 className="text-4xl font-black mb-3">Sync Output</h2>
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-secondary bg-secondary/10 w-fit px-4 py-1.5 rounded-full">
                                            <Check size={14} strokeWidth={4} />
                                            <span>Multi-Platform Sync Complete</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-black text-background hover:scale-105 transition-transform shadow-lg shadow-foreground/20">
                                            <Send size={18} /> Share Project
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    {Object.entries(results).map(([platform, text]) => {
                                        const platformData = PLATFORMS.find(p => p.id === platform);
                                        const isError = text.startsWith("Error:");

                                        return (
                                            <div key={platform} className={`rounded-[2.5rem] bg-white p-8 shadow-sm border-2 transition-all ${isError ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-primary/30'}`}>
                                                <div className="mb-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md ${platformData?.color || "bg-foreground"}`}>
                                                            {platformData ? <platformData.icon size={22} /> : <Zap size={22} />}
                                                        </div>
                                                        <div>
                                                            <span className="font-black uppercase tracking-wider text-sm">{platform} Draft</span>
                                                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest leading-none mt-1">
                                                                {isError ? "Output Failed" : "Standard Engine"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!isError && (
                                                            <div className="flex gap-1 mr-2 px-2 py-1 bg-foreground/5 rounded-full">
                                                                <button
                                                                    onClick={() => handleFeedback(platform, 1)}
                                                                    className={`p-1.5 rounded-md transition-colors ${feedback[platform] === 1 ? 'text-secondary bg-secondary/10' : 'text-foreground/30 hover:text-foreground'}`}
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleFeedback(platform, 0)}
                                                                    className={`p-1.5 rounded-md transition-colors ${feedback[platform] === 0 ? 'text-accent bg-accent/10' : 'text-foreground/30 hover:text-foreground'}`}
                                                                >
                                                                    <AlertCircle size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => copyToClipboard(text, platform)}
                                                            disabled={isError}
                                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background hover:scale-110 active:scale-90 transition-all shadow-md disabled:opacity-20 disabled:hover:scale-100"
                                                        >
                                                            {copiedId === platform ? <Check size={20} className="text-secondary" strokeWidth={3} /> : <Copy size={20} strokeWidth={2.5} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className={`flex-1 rounded-3xl p-6 text-base font-medium leading-relaxed whitespace-pre-wrap ${isError ? 'text-accent border border-accent/20 italic' : 'bg-foreground/[0.02] border border-border'}`}>
                                                    {text}
                                                </div>
                                                {!isError && (
                                                    <div className="mt-6 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{text.split(' ').length} words</span>
                                                        <button
                                                            onClick={() => window.alert(`Direct posting to ${platform} coming in v1.1!`)}
                                                            className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"
                                                        >
                                                            Post Directly <ChevronRight size={10} strokeWidth={4} />
                                                        </button>
                                                    </div>
                                                )}
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
