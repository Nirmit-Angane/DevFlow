"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fadeUp, staggerContainer, glowPulse } from "../execution/motion/variants";
import useStore from "../execution/store/useStore";
import { aiService } from "../execution/services/aiService";

/* ─── Animation Variants ─────────────────────────────────── */
const fadeIn: any = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" }
    }),
};

/* ─── Feature data ───────────────────────────────────────── */
const features = [
    {
        color: "signal" as const,
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17.5 17.5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M7 7l3 3M14 7l-3 3M7 17l3-3" />
            </svg>
        ),
        title: "System Architecture Planning",
        description: "Visually connect the dots between your API, UI, and logic before a single line of code is written. Map dependencies with precision.",
    },
    {
        color: "accent1" as const,
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M5 9a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4-4h4" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
        ),
        title: "Visual Workflow Builder",
        description: "Drag, connect, and compose components into living diagrams. Define data flow, states, and logic pathways without writing boilerplate.",
    },
    {
        color: "accent2" as const,
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M7 8l-4 4l4 4" /><path d="M17 8l4 4l-4 4" /><path d="M14 4l-4 16" />
            </svg>
        ),
        title: "AI Export for Coding Tools",
        description: "One click exports your architecture as structured prompts, component trees, or typed interfaces — ready for Cursor, Copilot, or Claude.",
    },
];

const steps = [
    { number: "01", label: "Map Components", detail: "Drop nodes for every service, page, or module in your system." },
    { number: "02", label: "Connect Flows", detail: "Draw edges that represent API calls, data streams, or user journeys." },
    { number: "03", label: "Export & Build", detail: "Generate architecture docs or AI prompts and start coding with confidence." },
];

const colorTokens = {
    signal: {
        border: "border-[hsl(180,100%,50%)]",
        text: "text-[hsl(180,100%,50%)]",
        bg: "bg-[hsl(180,100%,50%)]",
        shadow: "shadow-[0_0_24px_rgba(0,255,255,0.25)]",
        glow: "shadow-[0_0_32px_rgba(0,255,255,0.5)]",
        dot: "bg-[hsl(180,100%,50%)]",
    },
    accent1: {
        border: "border-[hsl(28,100%,50%)]",
        text: "text-[hsl(28,100%,50%)]",
        bg: "bg-[hsl(28,100%,50%)]",
        shadow: "shadow-[0_0_24px_rgba(255,138,0,0.25)]",
        glow: "shadow-[0_0_32px_rgba(255,138,0,0.5)]",
        dot: "bg-[hsl(28,100%,50%)]",
    },
    accent2: {
        border: "border-[hsl(282,100%,50%)]",
        text: "text-[hsl(282,100%,50%)]",
        bg: "bg-[hsl(282,100%,50%)]",
        shadow: "shadow-[0_0_24px_rgba(179,0,255,0.25)]",
        glow: "shadow-[0_0_32px_rgba(179,0,255,0.5)]",
        dot: "bg-[hsl(282,100%,50%)]",
    },
};

/* ─── Main Component ─────────────────────────────────────── */
export default function Home() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const router = useRouter();
    const setProjectDetails = useStore(state => state.setProjectDetails);
    const clearProject = useStore(state => state.clearProject);
    const setArchitecture = useStore(state => state.setArchitecture);
    const projectDetails = useStore(state => state.projectDetails);

    // Setup Modal State
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [setupMode, setSetupMode] = useState<"SELECT" | "MANUAL" | "AI">("SELECT");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "Web Application",
        nodeStructure: ""
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCreateManual = (e: React.FormEvent) => {
        e.preventDefault();
        // Clear old project and set new details
        clearProject();
        setProjectDetails({
            name: formData.name,
            description: formData.description,
            type: formData.type
        });
        setIsSetupOpen(false);
        router.push('/demo');
    };

    const handleCreateAI = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const details = { name: formData.name, description: formData.description, type: formData.type };
            // Clear existing
            clearProject();
            setProjectDetails(details);

            // Call AI Service
            const structure = await aiService.generateWorkflow(details, formData.nodeStructure);

            // Translate the structured JSON back to DevFlow nodes for layout
            // Very simple staggered layout algorithm
            const newNodes = structure.nodes.map((n: any, index: number) => ({
                id: n.id,
                type: 'devflow',
                position: { x: 100 + (index % 3) * 300, y: 100 + Math.floor(index / 3) * 200 },
                data: {
                    title: n.title,
                    type: n.type,
                    description: n.description,
                    color: index === 0 ? 'textPrimary' : (index % 2 === 0 ? 'accent1' : 'signal')
                }
            }));

            const newEdges = structure.connections.map((c: any, index: number) => ({
                id: `e-${c.source}-${c.target}-${index}`,
                source: c.source,
                target: c.target,
                type: 'smoothstep',
                animated: true,
                style: { stroke: 'hsl(180, 100%, 50%)', strokeWidth: 2 }
            }));

            setArchitecture(newNodes, newEdges);

            setIsSetupOpen(false);
            router.push('/demo');
        } catch (error) {
            console.error("Failed to generate workflow via AI", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[hsl(273,35%,16%)] relative overflow-x-hidden">

            {/* ── Ambient background layers ── */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: `
                            linear-gradient(hsl(180,100%,50%,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(180,100%,50%,0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                    }}
                />
                {/* Horizon glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(180,100%,50%,0.4)] to-transparent" />
                {/* Orbs */}
                <div className="absolute top-[8%] left-[10%] w-[500px] h-[500px] rounded-full bg-[hsl(282,100%,50%)] opacity-[0.06] blur-[100px]" />
                <div className="absolute top-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-[hsl(28,100%,50%)] opacity-[0.06] blur-[80px]" />
                <div className="absolute top-[60%] left-[30%] w-[600px] h-[300px] rounded-full bg-[hsl(180,100%,50%)] opacity-[0.04] blur-[100px]" />
            </div>

            {/* ── Navbar ── */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-50 w-full"
            >
                <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(28,100%,50%)] to-[hsl(282,100%,50%)] shadow-[0_0_20px_rgba(255,138,0,0.35)] flex items-center justify-center overflow-hidden transition-shadow group-hover:shadow-[0_0_30px_rgba(255,138,0,0.55)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
                            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 relative z-10">
                                <circle cx="6" cy="6" r="2.5" fill="white" fillOpacity="0.9" />
                                <circle cx="14" cy="6" r="2.5" fill="white" fillOpacity="0.9" />
                                <circle cx="10" cy="14" r="2.5" fill="white" fillOpacity="0.9" />
                                <line x1="6" y1="6" x2="14" y2="6" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
                                <line x1="6" y1="6" x2="10" y2="14" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
                                <line x1="14" y1="6" x2="10" y2="14" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <span className="font-display font-bold text-xl tracking-wide text-[hsl(340,100%,98%)]">DevFlow</span>
                    </div>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-1">
                        {["Product", "Solutions", "Pricing", "Docs"].map((item) => (
                            <Link
                                key={item}
                                href="#"
                                className="px-4 py-2 text-sm font-medium text-[hsl(275,39%,82%)] hover:text-[hsl(340,100%,98%)] hover:bg-[hsl(270,30%,24%,0.6)] rounded-md transition-all"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA group */}
                    <div className="flex items-center gap-3">
                        <Link href="#" className="hidden sm:block text-sm font-medium text-[hsl(275,39%,82%)] hover:text-[hsl(340,100%,98%)] transition-colors px-3 py-2">
                            Log In
                        </Link>
                        <button
                            onClick={() => { setSetupMode("SELECT"); setIsSetupOpen(true); }}
                            className="text-sm font-display font-bold bg-gradient-to-r from-[hsl(28,100%,50%)] to-[hsl(28,100%,60%)] text-[hsl(273,35%,16%)] px-5 py-2.5 rounded-lg shadow-[0_0_16px_rgba(255,138,0,0.3)] hover:shadow-[0_0_28px_rgba(255,138,0,0.55)] transition-all hover:-translate-y-0.5 tracking-wide"
                        >
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Hairline divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[hsl(268,30%,35%,0.6)] to-transparent" />
            </motion.header>

            {/* ── Hero ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center">
                <section ref={heroRef} className="w-full flex flex-col items-center text-center pt-28 pb-20 px-6">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center max-w-4xl"
                    >
                        {/* Badge */}
                        <motion.div
                            custom={0}
                            variants={fadeIn}
                            className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(268,30%,35%)] bg-[hsl(270,30%,24%,0.5)] backdrop-blur-sm text-xs font-display tracking-widest text-[hsl(275,39%,82%)] uppercase"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(180,100%,50%)] animate-pulse" />
                            Visual Architecture Planner
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            custom={1}
                            variants={fadeIn}
                            className="text-6xl md:text-8xl font-display font-bold mb-6 leading-[1.05] tracking-tight"
                        >
                            <span className="text-[hsl(340,100%,98%)]">Master Your</span>
                            <br />
                            <span className="relative inline-block">
                                <span
                                    className="text-transparent bg-clip-text"
                                    style={{ backgroundImage: "linear-gradient(135deg, hsl(28,100%,50%) 0%, hsl(180,100%,50%) 50%, hsl(282,100%,60%) 100%)" }}
                                >
                                    System Architecture.
                                </span>
                                {/* Glow under text */}
                                <span className="absolute inset-0 text-transparent bg-clip-text blur-2xl opacity-40"
                                    style={{ backgroundImage: "linear-gradient(135deg, hsl(28,100%,50%) 0%, hsl(180,100%,50%) 50%, hsl(282,100%,60%) 100%)" }}
                                    aria-hidden>
                                    System Architecture.
                                </span>
                            </span>
                        </motion.h1>

                        {/* Sub */}
                        <motion.p custom={2} variants={fadeIn} className="text-lg md:text-xl text-[hsl(275,39%,82%)] mb-12 max-w-2xl leading-relaxed">
                            Map APIs, UI layers, and business logic into living diagrams — before you write a single line of code.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div custom={3} variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => { setSetupMode("SELECT"); setIsSetupOpen(true); }}
                                className="group inline-flex items-center gap-3 px-8 py-4 font-display font-bold text-[hsl(273,35%,16%)] bg-gradient-to-r from-[hsl(28,100%,50%)] to-[hsl(28,100%,62%)] rounded-xl shadow-[0_0_24px_rgba(255,138,0,0.35)] hover:shadow-[0_0_40px_rgba(255,138,0,0.6)] transition-all hover:-translate-y-1 tracking-widest uppercase text-sm"
                            >
                                Build the Blueprint
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                                    <path d="M3 8h10M9 4l4 4-4 4" />
                                </svg>
                            </button>
                            <Link
                                href="#features"
                                className="inline-flex items-center gap-2 px-8 py-4 font-display font-medium text-[hsl(275,39%,82%)] hover:text-[hsl(340,100%,98%)] border border-[hsl(268,30%,35%)] hover:border-[hsl(268,30%,50%)] rounded-xl bg-[hsl(270,30%,24%,0.4)] backdrop-blur hover:bg-[hsl(270,30%,24%,0.7)] transition-all text-sm tracking-wide"
                            >
                                See how it works
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* ── Architecture diagram card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="mt-20 w-full max-w-5xl"
                    >
                        {/* Card chrome */}
                        <div className="relative rounded-2xl overflow-hidden border border-[hsl(268,30%,35%,0.8)] shadow-[0_0_80px_rgba(42,27,56,0.9),0_0_0_1px_hsl(268,30%,35%,0.3)]">
                            {/* Titlebar */}
                            <div className="flex items-center gap-3 px-5 py-3.5 bg-[hsl(273,35%,13%)] border-b border-[hsl(268,30%,28%)]">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[hsl(0,80%,60%,0.8)]" />
                                    <div className="w-3 h-3 rounded-full bg-[hsl(40,90%,55%,0.8)]" />
                                    <div className="w-3 h-3 rounded-full bg-[hsl(140,70%,45%,0.8)]" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <span className="font-display text-xs tracking-widest text-[hsl(275,39%,70%)] uppercase">architecture.devflow</span>
                                </div>
                                <div className="flex items-center gap-2 text-[hsl(275,39%,60%)]">
                                    <span className="font-display text-xs">v1.0.0</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(180,100%,50%)] animate-pulse" />
                                </div>
                            </div>

                            {/* Diagram canvas */}
                            <div
                                className="relative w-full aspect-[2.2/1] overflow-hidden bg-[hsl(273,35%,12%)]"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(hsl(180,100%,50%,0.06) 1px, transparent 1px),
                                        linear-gradient(90deg, hsl(180,100%,50%,0.06) 1px, transparent 1px)
                                    `,
                                    backgroundSize: "40px 40px",
                                }}
                            >
                                {/* Subtle vignette */}
                                <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent to-[hsl(273,35%,10%,0.6)] pointer-events-none" />

                                {/* Nodes */}
                                <DiagramNode glowPulse={glowPulse} style={{ top: "12%", left: "18%" }} color="signal" label="User Interface" sub="React / Next.js" />
                                <DiagramNode glowPulse={glowPulse} style={{ top: "42%", left: "38%" }} color="textPrimary" label="Main API" sub="REST / GraphQL" />
                                <DiagramNode glowPulse={glowPulse} style={{ bottom: "14%", left: "20%" }} color="accent2" label="Analytics Engine" sub="Event Stream" />
                                <DiagramNode glowPulse={glowPulse} style={{ top: "18%", right: "22%" }} color="accent2" label="Microservice" sub="gRPC" />
                                <DiagramNode glowPulse={glowPulse} style={{ bottom: "24%", right: "28%" }} color="accent1" label="Auth Service" sub="OAuth 2.0" />
                                <DiagramNode glowPulse={glowPulse} style={{ bottom: "10%", left: "48%" }} color="signal" label="User Database" sub="PostgreSQL" />

                                {/* SVG connectors */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 400" preserveAspectRatio="none">
                                    <defs>
                                        <marker id="arrow-signal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L6,3 z" fill="hsl(180,100%,50%)" fillOpacity="0.7" />
                                        </marker>
                                        <marker id="arrow-accent1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L6,3 z" fill="hsl(28,100%,50%)" fillOpacity="0.7" />
                                        </marker>
                                        <marker id="arrow-accent2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L6,3 z" fill="hsl(282,100%,50%)" fillOpacity="0.7" />
                                        </marker>
                                    </defs>
                                    <path d="M220,62 C290,62 300,168 342,168" stroke="hsl(180,100%,50%)" strokeWidth="2" fill="none" strokeOpacity="0.55" strokeDasharray="6 3" markerEnd="url(#arrow-signal)" />
                                    <path d="M342,168 C420,168 500,72 620,72" stroke="hsl(282,100%,50%)" strokeWidth="2" fill="none" strokeOpacity="0.45" markerEnd="url(#arrow-accent2)" />
                                    <path d="M342,175 C370,175 380,310 432,310" stroke="hsl(180,100%,50%)" strokeWidth="2" fill="none" strokeOpacity="0.45" markerEnd="url(#arrow-signal)" />
                                    <path d="M620,72 C680,72 680,270 630,296" stroke="hsl(28,100%,50%)" strokeWidth="2" fill="none" strokeOpacity="0.45" strokeDasharray="4 4" markerEnd="url(#arrow-accent1)" />
                                    <path d="M215,268 C270,268 320,310 388,318" stroke="hsl(282,100%,50%)" strokeWidth="2" fill="none" strokeOpacity="0.4" markerEnd="url(#arrow-accent2)" />
                                </svg>

                                {/* Floating label */}
                                <div className="absolute bottom-4 right-4 font-display text-[10px] tracking-widest text-[hsl(275,39%,55%)] uppercase opacity-60">
                                    DevFlow Canvas · 1440px
                                </div>
                            </div>
                        </div>

                        {/* Glow under card */}
                        <div className="h-8 bg-gradient-to-b from-[hsl(282,100%,50%,0.08)] to-transparent blur-xl -mt-4 mx-16" />
                    </motion.div>
                </section>

                {/* ── Features ── */}
                <section id="features" className="w-full max-w-7xl mx-auto px-6 py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-20"
                    >
                        <p className="font-display text-xs tracking-[0.3em] uppercase text-[hsl(180,100%,50%)] mb-4">Why DevFlow</p>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-[hsl(340,100%,98%)] tracking-tight">
                            Everything you need to<br />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, hsl(28,100%,50%), hsl(282,100%,60%))" }}>
                                ship with confidence.
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                            >
                                <FeatureCard {...f} index={i} />
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── How it works ── */}
                <section className="w-full max-w-7xl mx-auto px-6 py-20 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-20"
                    >
                        <p className="font-display text-xs tracking-[0.3em] uppercase text-[hsl(28,100%,50%)] mb-4">The Process</p>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-[hsl(340,100%,98%)] tracking-tight">Three steps to clarity.</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-[hsl(28,100%,50%,0.3)] via-[hsl(180,100%,50%,0.5)] to-[hsl(282,100%,50%,0.3)]" />

                        {steps.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.6 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="relative mb-8">
                                    <div className="w-14 h-14 rounded-xl border border-[hsl(268,30%,35%)] bg-[hsl(270,30%,24%)] flex items-center justify-center shadow-[0_0_20px_rgba(42,27,56,0.8)]">
                                        <span
                                            className="font-display font-bold text-2xl text-transparent bg-clip-text"
                                            style={{ backgroundImage: i === 0 ? "linear-gradient(135deg,hsl(28,100%,50%),hsl(28,100%,70%))" : i === 1 ? "linear-gradient(135deg,hsl(180,100%,50%),hsl(180,100%,70%))" : "linear-gradient(135deg,hsl(282,100%,50%),hsl(282,100%,70%))" }}
                                        >
                                            {step.number}
                                        </span>
                                    </div>
                                    {/* dot on the connector line */}
                                    <div className="hidden md:block absolute -bottom-[2.3rem] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-[hsl(268,30%,35%)] bg-[hsl(273,35%,16%)]" />
                                </div>
                                <h3 className="font-display font-bold text-xl text-[hsl(340,100%,98%)] mb-3">{step.label}</h3>
                                <p className="text-sm text-[hsl(275,39%,72%)] leading-relaxed max-w-xs">{step.detail}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── Editor Preview ── */}
                <section className="w-full max-w-7xl mx-auto px-6 py-20 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-16"
                    >
                        <p className="font-display text-xs tracking-[0.3em] uppercase text-[hsl(282,100%,65%)] mb-4">The Tool</p>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-[hsl(340,100%,98%)] tracking-tight">The Flow Editor.</h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.8 }}
                        className="rounded-2xl overflow-hidden border border-[hsl(268,30%,35%,0.8)] shadow-[0_0_100px_rgba(42,27,56,0.9)]"
                    >
                        {/* Titlebar */}
                        <div className="flex items-center gap-3 px-5 py-3.5 bg-[hsl(273,35%,12%)] border-b border-[hsl(268,30%,25%)]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[hsl(0,80%,60%,0.7)]" />
                                <div className="w-3 h-3 rounded-full bg-[hsl(40,90%,55%,0.7)]" />
                                <div className="w-3 h-3 rounded-full bg-[hsl(140,70%,45%,0.7)]" />
                            </div>
                            <span className="ml-2 font-display text-xs tracking-widest text-[hsl(275,39%,65%)] uppercase">Flow Editor — project.devflow</span>
                        </div>

                        <div className="flex h-[580px]">
                            {/* Left toolbar */}
                            <div className="w-14 border-r border-[hsl(268,30%,25%)] bg-[hsl(273,35%,13%)] flex flex-col items-center gap-5 py-6">
                                {[
                                    { shape: "rounded-sm", color: "hsl(28,100%,50%)" },
                                    { shape: "rounded-full", color: "hsl(282,100%,50%)" },
                                    { shape: "rotate-45 rounded-sm", color: "hsl(180,100%,50%)" },
                                    { shape: "rounded-sm", color: "hsl(340,100%,98%)" },
                                ].map((t, i) => (
                                    <div
                                        key={i}
                                        className={`w-6 h-6 ${t.shape} cursor-pointer hover:scale-110 transition-transform`}
                                        style={{ background: `${t.color}22`, border: `1.5px solid ${t.color}66` }}
                                    />
                                ))}
                                <div className="flex-1" />
                                <div className="w-6 h-px bg-[hsl(268,30%,35%)]" />
                                <div className="w-6 h-6 rounded-sm cursor-pointer hover:scale-110 transition-transform" style={{ background: "hsl(180,100%,50%,0.12)", border: "1.5px solid hsl(180,100%,50%,0.4)" }} />
                            </div>

                            {/* Canvas */}
                            <div
                                className="flex-1 relative overflow-hidden bg-[hsl(273,35%,11%)]"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(hsl(180,100%,50%,0.05) 1px, transparent 1px),
                                        linear-gradient(90deg, hsl(180,100%,50%,0.05) 1px, transparent 1px)
                                    `,
                                    backgroundSize: "32px 32px",
                                }}
                            >
                                {/* Editor nodes */}
                                <EditorNode style={{ top: 60, left: 60 }} color="hsl(282,100%,50%)" title="UserDashboard" type="Page" />
                                <EditorNode style={{ top: 140, left: 320 }} color="hsl(28,100%,50%)" title="REST API" type="Endpoint" />
                                <EditorNode style={{ top: 280, left: 320 }} color="hsl(282,100%,50%)" title="Auth Guard" type="Middleware" />
                                <EditorNode style={{ top: 60, right: 80 }} color="hsl(180,100%,50%)" title="WebSocket" type="Realtime" />
                                <EditorNode style={{ top: 280, right: 80 }} color="hsl(340,100%,98%)" title="PostgreSQL" type="Database" dim />

                                {/* Connections */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <defs>
                                        <marker id="ed-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                                            <path d="M0,0 L0,5 L5,2.5 z" fill="hsl(28,100%,50%)" fillOpacity="0.6" />
                                        </marker>
                                        <marker id="ed-arrow2" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                                            <path d="M0,0 L0,5 L5,2.5 z" fill="hsl(180,100%,50%)" fillOpacity="0.6" />
                                        </marker>
                                    </defs>
                                    <path d="M180,96 C250,96 250,176 320,176" stroke="hsl(28,100%,50%)" strokeWidth="2" fill="none" strokeOpacity="0.5" strokeDasharray="5 3" markerEnd="url(#ed-arrow)" />
                                    <path d="M180,110 C240,110 240,316 320,316" stroke="hsl(282,100%,50%)" strokeWidth="2" fill="none" strokeOpacity="0.4" strokeDasharray="5 3" />
                                    <path d="M320,176 C420,176 420,96 550,96" stroke="hsl(180,100%,50%)" strokeWidth="2" fill="none" strokeOpacity="0.5" markerEnd="url(#ed-arrow2)" />
                                    <path d="M320,316 C440,316 440,316 550,316" stroke="hsl(340,100%,98%)" strokeWidth="2" fill="none" strokeOpacity="0.25" />
                                </svg>

                                {/* Mini status bar */}
                                <div className="absolute bottom-0 inset-x-0 flex items-center gap-4 px-5 py-2.5 bg-[hsl(273,35%,12%,0.9)] border-t border-[hsl(268,30%,22%)] backdrop-blur-sm">
                                    <span className="font-display text-[10px] tracking-widest text-[hsl(275,39%,55%)] uppercase">5 nodes · 4 connections</span>
                                    <div className="flex-1" />
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(180,100%,50%)] animate-pulse" />
                                        <span className="font-display text-[10px] tracking-widest text-[hsl(180,100%,50%)] uppercase">Live</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right sidebar */}
                            <div className="w-56 border-l border-[hsl(268,30%,25%)] bg-[hsl(273,35%,13%)] flex flex-col p-4 gap-4 overflow-hidden">
                                <p className="font-display text-[10px] tracking-[0.25em] text-[hsl(275,39%,55%)] uppercase">Properties</p>
                                <div className="space-y-3">
                                    {[
                                        { label: "Name", value: "REST API" },
                                        { label: "Type", value: "Endpoint" },
                                        { label: "Method", value: "GET / POST" },
                                    ].map((prop) => (
                                        <div key={prop.label}>
                                            <p className="text-[10px] text-[hsl(275,39%,55%)] mb-1 font-display tracking-wider uppercase">{prop.label}</p>
                                            <div className="px-2.5 py-1.5 rounded bg-[hsl(270,30%,20%)] border border-[hsl(268,30%,28%)] text-xs text-[hsl(275,39%,82%)] font-display">{prop.value}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-auto space-y-2">
                                    <button className="w-full py-2 rounded-lg bg-[hsl(28,100%,50%,0.15)] border border-[hsl(28,100%,50%,0.4)] text-[hsl(28,100%,50%)] font-display text-xs tracking-wider hover:bg-[hsl(28,100%,50%,0.25)] transition-colors">
                                        Export Node
                                    </button>
                                    <button className="w-full py-2 rounded-lg bg-[hsl(270,30%,20%)] border border-[hsl(268,30%,30%)] text-[hsl(275,39%,72%)] font-display text-xs tracking-wider hover:border-[hsl(268,30%,45%)] transition-colors">
                                        Duplicate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* ── CTA Banner ── */}
                <section className="w-full max-w-7xl mx-auto px-6 pb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7 }}
                        className="relative rounded-2xl overflow-hidden border border-[hsl(268,30%,35%,0.8)] p-16 text-center"
                        style={{
                            background: "linear-gradient(135deg, hsl(273,35%,20%) 0%, hsl(270,30%,26%) 50%, hsl(273,35%,20%) 100%)",
                        }}
                    >
                        {/* Decorative glows */}
                        <div className="absolute top-0 left-1/4 w-[300px] h-[200px] rounded-full bg-[hsl(28,100%,50%)] opacity-10 blur-[60px]" />
                        <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] rounded-full bg-[hsl(282,100%,50%)] opacity-10 blur-[60px]" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(28,100%,50%,0.5)] to-transparent" />

                        <div className="relative z-10">
                            <p className="font-display text-xs tracking-[0.3em] uppercase text-[hsl(180,100%,50%)] mb-5">Start Today — It's Free</p>
                            <h2 className="text-4xl md:text-6xl font-display font-bold text-[hsl(340,100%,98%)] mb-6 tracking-tight">
                                Stop guessing.<br />
                                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, hsl(28,100%,50%), hsl(180,100%,55%))" }}>
                                    Start architecting.
                                </span>
                            </h2>
                            <p className="text-lg text-[hsl(275,39%,78%)] mb-10 max-w-xl mx-auto leading-relaxed">
                                Join thousands of developers who ship faster because they plan smarter with DevFlow.
                            </p>
                            <Link
                                href="/demo"
                                className="inline-flex items-center gap-3 px-10 py-5 font-display font-bold text-[hsl(273,35%,16%)] bg-gradient-to-r from-[hsl(28,100%,50%)] to-[hsl(28,100%,65%)] rounded-xl shadow-[0_0_32px_rgba(255,138,0,0.4)] hover:shadow-[0_0_50px_rgba(255,138,0,0.65)] transition-all hover:-translate-y-1 tracking-widest uppercase text-sm"
                            >
                                Build Your Blueprint
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M3 8h10M9 4l4 4-4 4" />
                                </svg>
                            </Link>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 border-t border-[hsl(268,30%,25%)] py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(28,100%,50%)] to-[hsl(282,100%,50%)] shadow-[0_0_12px_rgba(255,138,0,0.3)]" />
                        <span className="font-display font-bold text-[hsl(340,100%,98%)] text-sm">DevFlow</span>
                    </div>
                    <p className="font-display text-xs text-[hsl(275,39%,55%)] tracking-wider">© 2025 DevFlow. Visual Architecture Planner.</p>
                    <nav className="flex items-center gap-6">
                        {["Privacy", "Terms", "Contact"].map((item) => (
                            <Link key={item} href="#" className="text-xs text-[hsl(275,39%,55%)] hover:text-[hsl(275,39%,82%)] font-display tracking-wider transition-colors">
                                {item}
                            </Link>
                        ))}
                    </nav>
                </div>
            </footer>
            {/* ── Setup Modal Overlay ── */}
            <AnimatePresence>
                {isSetupOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(273,35%,10%,0.8)] backdrop-blur-md px-6 py-12 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[hsl(273,35%,14%)] border border-[#311f42] rounded-2xl p-8 max-w-2xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative my-auto"
                        >
                            <button
                                onClick={() => setIsSetupOpen(false)}
                                className="absolute top-6 right-6 text-[hsl(275,39%,60%)] hover:text-white transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            {setupMode === "SELECT" && (
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-display font-bold text-[hsl(340,100%,98%)] mb-2 tracking-wide">Start Your Project</h3>
                                        <p className="text-[hsl(275,39%,80%)]">How would you like to build your architecture blueprint?</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setSetupMode("MANUAL")}
                                            className="flex flex-col items-center gap-4 p-6 rounded-xl border border-[#311f42] bg-[hsl(273,35%,16%)] hover:bg-[hsl(273,35%,18%)] hover:border-accent1/50 transition-all text-left group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-accent1/10 flex items-center justify-center text-accent1 group-hover:scale-110 transition-transform">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-display font-bold text-white mb-2">Design Manually</h4>
                                                <p className="text-sm text-[hsl(275,39%,70%)]">Start with a blank canvas and drag-and-drop nodes to structure your app.</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setSetupMode("AI")}
                                            className="flex flex-col items-center gap-4 p-6 rounded-xl border border-[#311f42] bg-[hsl(273,35%,16%)] hover:bg-[hsl(273,35%,18%)] hover:border-signal/50 transition-all text-left group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-signal/10 flex items-center justify-center text-signal group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                            </div>
                                            <div className="text-center">
                                                <h4 className="font-display font-bold text-white mb-2">Generate with AI</h4>
                                                <p className="text-sm text-[hsl(275,39%,70%)]">Describe your app features, and AI will automatically build the entire architecture map.</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(setupMode === "MANUAL" || setupMode === "AI") && (
                                <form onSubmit={setupMode === "MANUAL" ? handleCreateManual : handleCreateAI} className="space-y-5">
                                    <div className="flex items-center gap-3 mb-6 border-b border-[#311f42] pb-4">
                                        <button
                                            type="button"
                                            onClick={() => setSetupMode("SELECT")}
                                            className="text-[hsl(275,39%,60%)] hover:text-white"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                        </button>
                                        <h3 className="text-xl font-display font-bold text-white tracking-wide">
                                            {setupMode === "MANUAL" ? "Manual Setup" : "AI Workflow Generator"}
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-display font-bold text-[hsl(275,39%,60%)] uppercase tracking-wider mb-2">Project Name</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className="w-full bg-[hsl(273,35%,12%)] border border-[#311f42] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors"
                                            placeholder="e.g., E-commerce App"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-display font-bold text-[hsl(275,39%,60%)] uppercase tracking-wider mb-2">App Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                                                className="w-full bg-[hsl(273,35%,12%)] border border-[#311f42] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors appearance-none"
                                            >
                                                <option>Web Application</option>
                                                <option>Mobile Application</option>
                                                <option>Desktop Application</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-display font-bold text-[hsl(275,39%,60%)] uppercase tracking-wider mb-2">Project Description</label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                            rows={2}
                                            className="w-full bg-[hsl(273,35%,12%)] border border-[#311f42] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent1 transition-colors resize-none"
                                            placeholder="What does this product do?"
                                        />
                                    </div>

                                    {setupMode === "AI" && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2 overflow-hidden">
                                            <label className="block text-xs font-display font-bold text-signal uppercase tracking-wider mb-2 flex items-center justify-between">
                                                <span>Node Structure Description</span>
                                                <span className="text-[10px] text-[hsl(275,39%,50%)] normal-case flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
                                                    Groq AI
                                                </span>
                                            </label>
                                            <textarea
                                                required
                                                value={formData.nodeStructure}
                                                onChange={e => setFormData(p => ({ ...p, nodeStructure: e.target.value }))}
                                                rows={5}
                                                className="w-full bg-[hsl(273,35%,10%)] border border-signal/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-signal focus:shadow-[0_0_15px_rgba(0,255,255,0.1)] transition-all resize-none font-body text-sm"
                                                placeholder="Example: Landing Page -> Auth Page -> Dashboard. Inside Dashboard display User Account, Chat Bot, and History..."
                                            />
                                        </motion.div>
                                    )}

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isGenerating}
                                            className={`px-8 py-3 rounded-lg font-display font-bold tracking-wide transition-all ${setupMode === "AI"
                                                ? "bg-signal text-[hsl(273,35%,12%)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                                                : "bg-gradient-to-r from-accent1 to-accent2 text-white hover:shadow-[0_0_20px_rgba(255,138,0,0.4)]"
                                                } ${isGenerating ? "opacity-70 cursor-not-allowed" : ""}`}
                                        >
                                            {isGenerating ? "Generating..." : (setupMode === "AI" ? "Generate Architecture" : "Start Designing")}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Sub-components ─────────────────────────────────────── */
function DiagramNode({
    glowPulse,
    style,
    color,
    label,
    sub,
}: {
    glowPulse: any;
    style: React.CSSProperties;
    color: "signal" | "accent1" | "accent2" | "textPrimary";
    label: string;
    sub: string;
}) {
    const colorStyles = {
        signal: { border: "hsl(180,100%,50%)", text: "hsl(180,100%,50%)", shadow: "rgba(0,255,255,0.25)" },
        accent1: { border: "hsl(28,100%,50%)", text: "hsl(28,100%,50%)", shadow: "rgba(255,138,0,0.25)" },
        accent2: { border: "hsl(282,100%,50%)", text: "hsl(282,100%,50%)", shadow: "rgba(179,0,255,0.25)" },
        textPrimary: { border: "hsl(340,100%,98%)", text: "hsl(340,100%,98%)", shadow: "rgba(255,240,245,0.15)" },
    }[color];

    return (
        <motion.div
            variants={glowPulse}
            animate="animate"
            className="absolute flex flex-col gap-1 px-4 py-3 rounded-lg font-display text-xs tracking-wide select-none"
            style={{
                ...style,
                border: `1.5px solid ${colorStyles.border}99`,
                color: colorStyles.text,
                background: `hsl(273,35%,12%)`,
                boxShadow: `0 0 16px ${colorStyles.shadow}, inset 0 0 8px ${colorStyles.shadow}`,
            }}
        >
            <span className="font-bold text-sm">{label}</span>
            <span style={{ color: colorStyles.text, opacity: 0.6 }} className="text-[10px] tracking-widest uppercase">{sub}</span>
        </motion.div>
    );
}

function EditorNode({
    style,
    color,
    title,
    type,
    dim = false,
}: {
    style: React.CSSProperties;
    color: string;
    title: string;
    type: string;
    dim?: boolean;
}) {
    return (
        <div
            className="absolute w-44 rounded-lg px-4 py-3 select-none"
            style={{
                ...style,
                background: "hsl(273,35%,14%)",
                border: `1.5px solid ${color}${dim ? "44" : "77"}`,
                boxShadow: `0 0 14px ${color}${dim ? "15" : "22"}`,
            }}
        >
            <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: color, opacity: dim ? 0.4 : 0.9 }} />
                <span className="font-display font-bold text-xs" style={{ color: dim ? "hsl(275,39%,55%)" : "hsl(340,100%,98%)" }}>{title}</span>
            </div>
            <span className="font-display text-[10px] tracking-widest uppercase" style={{ color, opacity: dim ? 0.4 : 0.65 }}>{type}</span>
            <div className="mt-2 space-y-1.5">
                <div className="h-1.5 rounded-full" style={{ background: color, opacity: dim ? 0.08 : 0.18, width: "75%" }} />
                <div className="h-1.5 rounded-full" style={{ background: color, opacity: dim ? 0.06 : 0.12, width: "55%" }} />
            </div>
        </div>
    );
}

function FeatureCard({
    color,
    icon,
    title,
    description,
    index,
}: {
    color: "signal" | "accent1" | "accent2";
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}) {
    const t = colorTokens[color];

    return (
        <div
            className={`group relative p-8 rounded-2xl bg-[hsl(270,30%,22%,0.6)] border ${t.border} ${t.shadow} backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 overflow-hidden`}
        >
            {/* Corner glow on hover */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${t.bg} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />

            {/* Top accent line */}
            <div className={`absolute top-0 left-8 right-8 h-px ${t.bg} opacity-40`} />

            {/* Icon */}
            <div className={`w-12 h-12 mb-6 rounded-xl flex items-center justify-center border ${t.border} bg-[hsl(273,35%,16%)] ${t.text}`}
                style={{ boxShadow: `0 0 16px var(--tw-shadow-color, transparent)` }}>
                {icon}
            </div>

            {/* Number */}
            <span className={`font-display font-bold text-5xl ${t.text} opacity-10 absolute top-4 right-6 select-none`}>
                {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="font-display font-bold text-xl text-[hsl(340,100%,98%)] mb-3 leading-snug">{title}</h3>
            <p className="text-sm text-[hsl(275,39%,72%)] leading-relaxed">{description}</p>
        </div>
    );
}