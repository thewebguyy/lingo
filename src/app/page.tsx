"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  RefreshCw,
  Zap,
  Globe,
  Shield,
  BarChart3,
  Twitter,
  Linkedin,
  Video
} from "lucide-react";

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full glass px-6 py-3 shadow-sm border-white/20">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.png"
                alt="Lingo Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-foreground">Lingo</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#bridge" className="text-sm font-medium hover:text-primary transition-colors">The Bridge</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden text-sm font-semibold sm:block cursor-pointer">Log in</button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer">
                  Launch App
                </button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pb-24 pt-12 text-center md:pb-32 md:pt-20">
          <div className="relative z-10 mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>Introducing Lingo v1.0 — The Universal Bridge</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-6 text-5xl font-black md:text-7xl lg:text-8xl"
            >
              Post in every <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">language.</span><br />
              Play on every platform.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-foreground/60 md:text-xl"
            >
              Lingo turns your LinkedIn logic into TikTok heat (and vice versa). Our AI bridge synchronizes your voice across the digital landscape in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/app">
                <button className="group flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-white shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 active:scale-95 cursor-pointer">
                  Start Syncing Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <button className="flex h-14 items-center gap-2 rounded-full border-2 border-border bg-white/50 px-8 text-lg font-bold backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-95">
                Watch Demo
              </button>
            </motion.div>
          </div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="relative mx-auto mt-20 max-w-5xl"
          >
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-gradient-to-br from-primary/5 to-accent/5">
              <Image
                src="/hero.png"
                alt="The Multi-faceted Creator"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="px-6 py-24 md:py-32 bg-white/30">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center md:text-left">
              <h2 className="mb-4 text-4xl font-black md:text-5xl">Engineered for the <br /> 2026 Global Creator.</h2>
              <p className="max-w-xl text-lg text-foreground/60">A bridge that understands tone, dialect, and algorithm psychology.</p>
            </div>

            <div className="bento-grid">
              <motion.div
                whileHover={{ y: -5 }}
                className="bento-card md:col-span-2 bg-gradient-to-br from-primary/5 to-transparent"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Auto-Tone Mapping</h3>
                <p className="text-foreground/70">
                  Automatically change "LinkedIn Corporate" to "TikTok Slang" while keeping the core message. AI that understands the vibe of every platform.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bento-card border-secondary/20"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-white">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Polyglot Pulse</h3>
                <p className="text-foreground/70">
                  Support for 15+ regional dialects including Pidgin and Gen-Alpha slang. Hyper-local authenticity at scale.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bento-card border-accent/20"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Video Auto-Captions</h3>
                <p className="text-foreground/70">
                  Generate and burn platform-specific captions (9:16 for TikTok, 1:1 for LinkedIn) with one click.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bento-card md:col-span-2 bg-gradient-to-tr from-accent/5 to-transparent"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Zero UI Automation</h3>
                <p className="text-foreground/70">
                  Spend less time in dashboards and more time creating. Modular, automated workflows that trigger the moment you hit "Post".
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Bridge Section */}
        <section id="bridge" className="px-6 py-24 md:py-40">
          <div className="mx-auto max-w-7xl flex flex-col items-center gap-16 lg:flex-row">
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-6 inline-block rounded-full bg-secondary/10 px-4 py-1 text-sm font-bold text-secondary">
                Technological Edge
              </div>
              <h2 className="mb-6 text-4xl font-black md:text-5xl lg:text-6xl">
                The Multi-Agent <br /> Orchestrator.
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xl font-bold">Secure API Sync</h4>
                    <p className="text-foreground/60">One-way or bidirectional syncs that never store your data long-term.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-full bg-secondary/10 p-2 text-secondary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xl font-bold">Engagement Analytics</h4>
                    <p className="text-foreground/60">Real-time tracking of reach across all connected platforms.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative aspect-square w-full max-w-[500px] glass rounded-3xl p-8 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 animate-pulse-slow">
                  <div className="h-full w-full rounded-full border-[40px] border-primary" />
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 rounded-2xl bg-[#000000] flex items-center justify-center text-white p-4 shadow-xl">
                      <Twitter size={40} />
                    </div>
                    <span className="font-bold">X Bridge</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 rounded-2xl bg-[#0077b5] flex items-center justify-center text-white p-4 shadow-xl">
                      <Linkedin size={40} />
                    </div>
                    <span className="font-bold">LinkedIn Sync</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 rounded-2xl bg-[#ff0050] flex items-center justify-center text-white p-4 shadow-xl">
                      <Video size={40} />
                    </div>
                    <span className="font-bold">TikTok Hub</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-white p-4 shadow-xl animate-float">
                      <Image src="/logo.png" alt="Lingo" width={40} height={40} className="invert brightness-0" />
                    </div>
                    <span className="font-bold">Lingo AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="px-6 py-24 mb-20">
          <div className="mx-auto max-w-5xl rounded-[3rem] bg-foreground p-12 text-center text-background md:p-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

            <h2 className="relative z-10 mb-8 text-4xl font-black md:text-6xl">
              Stop translating. <br /> Start vibrating.
            </h2>
            <button className="relative z-10 group flex mx-auto h-16 items-center gap-3 rounded-full bg-primary px-10 text-xl font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95">
              Get Started for Free
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="relative z-10 mt-8 text-white/50 font-medium italic">
              "Lingo turned my 10h/week repurposing slog into a 5-minute breeze." — Ayo, Lagos Creator
            </p>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-border">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Image src="/logo.png" alt="Lingo" width={24} height={24} />
            <span className="font-bold">Lingo © 2026</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-foreground/50">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
