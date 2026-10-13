"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useStore from "../execution/store/useStore";
import { aiService } from "../execution/services/aiService";

/* ─── Feature data ───────────────────────────────────────── */
const features = [
    {
        tag: "SYSTEM MAP",
        accent: "teal",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17.5 17.5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M7 7l3 3M14 7l-3 3M7 17l3-3" />
            </svg>
        ),
        title: "System Architecture Planning",
        description: "Visually connect the dots between your API, UI, and logic before a single line of code is written. Map dependencies with tactile precision.",
    },
    {
        accent: "orange",
        tag: "DIAGRAM ENGINE",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M5 9a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4-4h4" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
        ),
        title: "Visual Workflow Builder",
        description: "Drag, connect, and compose components into living blueprints. Define data flows, states, and logic pathways on a vintage terminal canvas.",
    },
    {
        accent: "slate",
        tag: "AI CODEGEN",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M7 8l-4 4l4 4" /><path d="M17 8l4 4l-4 4" /><path d="M14 4l-4 16" />
            </svg>
        ),
        title: "AI Export for Coding Tools",
        description: "One click exports your architecture as structured prompts, component trees, or typed interfaces — ready for Cursor, Copilot, or Claude.",
    },
];

const steps = [
    { number: "01", label: "Map Components", detail: "Drop tactical nodes for every service, page, or database module in your system." },
    { number: "02", label: "Connect Flows", detail: "Draw directional edges that represent API payloads, data streams, and state shifts." },
    { number: "03", label: "Export & Build", detail: "Generate detailed SOP technical documentation and AI blueprints to ship immediately." },
];

/* ─── Main Component ─────────────────────────────────────── */
export default function Home() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.2]);

    const router = useRouter();
    const setProjectDetails = useStore(state => state.setProjectDetails);
    const clearProject = useStore(state => state.clearProject);
    const setArchitecture = useStore(state => state.setArchitecture);

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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleCreateManual = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
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
        setErrorMessage(null);
        try {
            clearProject();
            const project = {
                name: formData.name,
                description: formData.description,
                type: formData.type
            };
            setProjectDetails(project);

            const structure = await aiService.generateWorkflow(project, formData.nodeStructure);

            const typeColorMap: Record<string, string> = {
                'Page': 'signal',
                'Feature': 'accent1',
                'API': 'accent2',
                'Database': 'textPrimary',
                'Logic': 'signal',
            };

            const newNodes = structure.nodes.map((n: any, index: number) => ({
                id: n.id,
                type: 'devflow',
                position: { x: 80 + 320 * (index % 3), y: 80 + 190 * Math.floor(index / 3) },
                data: {
                    title: n.title,
                    label: n.title,
                    type: n.type || 'Feature',
                    description: n.description || '',
                    color: typeColorMap[n.type] || (index === 0 ? 'textPrimary' : (index % 2 === 0 ? 'accent1' : 'signal'))
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
        } catch (error: any) {
            console.error("Failed to generate workflow via AI", error);
            setErrorMessage(error.message || "Failed to generate workflow. Please make sure the local server is running.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#dfbe9b] text-[#0c141c] relative overflow-x-hidden font-body selection:bg-[#dc5c1c] selection:text-white">

            {/* ── Background Geometric Retro Decor ── */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Subtle Technical Dot Grid */}
                <div
                    className="absolute inset-0 opacity-[0.14]"
                    style={{
                        backgroundImage: "radial-gradient(circle, #0c141c 1.2px, transparent 1.2px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                {/* Floating Decor: Top-Left Hollow Orange Ring */}
                <div className="absolute top-16 left-8 sm:left-16 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-[8px] sm:border-[10px] border-[#dc5c1c]/80" />

                {/* Floating Decor: Mid-Right Hollow Teal Ring */}
                <div className="absolute top-[45%] right-8 sm:right-16 w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[7px] sm:border-[8px] border-[#0f756e]/50" />

                {/* Floating Decor: Bottom-Right 4 Minimalist Vertical Bars */}
                <div className="absolute bottom-12 right-8 sm:right-16 flex items-end gap-2">
                    <div className="w-2.5 h-12 bg-[#0f756e] rounded-full" />
                    <div className="w-2.5 h-8 bg-[#dc5c1c] rounded-full" />
                    <div className="w-2.5 h-14 bg-[#8faec4] rounded-full" />
                    <div className="w-2.5 h-9 bg-[#eec85d] rounded-full" />
                </div>

                {/* Floating Decor: Bottom-Left 4 Vertical Bars */}
                <div className="absolute bottom-20 left-8 sm:left-16 hidden md:flex items-end gap-1.5 opacity-60">
                    <div className="w-2 h-7 bg-[#dc5c1c] rounded-full" />
                    <div className="w-2 h-11 bg-[#0f756e] rounded-full" />
                    <div className="w-2 h-6 bg-[#eec85d] rounded-full" />
                    <div className="w-2 h-12 bg-[#8faec4] rounded-full" />
                </div>

                {/* Space-Age Corner Telemetry Stamps */}
                <div className="absolute top-6 right-8 font-mono text-[9px] tracking-[0.3em] font-bold text-[#0c141c]/40 uppercase hidden sm:block">
                    DEVFLOW // ARC-75 SPEC
                </div>
            </div>

            {/* ── Navbar ── */}
            <header className="relative z-50 w-full pt-4 sm:pt-6 px-4 sm:px-8">
                <nav className="mx-auto max-w-6xl bg-[#fbf0e6] border-[2.5px] border-[#0c141c] rounded-full shadow-[4px_4px_0_#0c141c] px-6 py-3.5 flex items-center justify-between">
                    
                    {/* Logo & Status Dial */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-9 h-9 rounded-full bg-[#dc5c1c] border-2 border-[#0c141c] flex items-center justify-center shadow-[2px_2px_0_#0c141c] group-hover:bg-[#e66627] transition-all">
                            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-white">
                                <circle cx="6" cy="6" r="2.5" fill="currentColor" />
                                <circle cx="14" cy="6" r="2.5" fill="currentColor" />
                                <circle cx="10" cy="14" r="2.5" fill="currentColor" />
                                <line x1="6" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="2" />
                                <line x1="6" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="2" />
                                <line x1="14" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-bold text-lg tracking-wider text-[#0c141c]">DevFlow</span>
                            <span className="font-mono text-[8px] tracking-[0.2em] font-bold text-[#63707c] uppercase -mt-1">SYSTEMS</span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {["Product", "Features", "Architecture", "Docs"].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="px-4 py-1.5 text-xs font-display font-bold text-[#0c141c] hover:bg-[#eedecf] rounded-full transition-all uppercase tracking-wider"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Group */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/retro-login"
                            className="hidden sm:inline-flex items-center font-display font-bold text-xs uppercase tracking-wider text-[#0c141c] hover:text-[#dc5c1c] px-3 py-1.5 transition-colors"
                        >
                            Log In
                        </Link>
                        <button
                            onClick={() => { setSetupMode("SELECT"); setIsSetupOpen(true); }}
                            className="retro-btn text-xs tracking-wider px-5 py-2"
                        >
                            Get Started
                        </button>
                    </div>
                </nav>
            </header>

            {/* ── Main Hero Section ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center">
                <section ref={heroRef} className="w-full flex flex-col items-center text-center pt-16 sm:pt-24 pb-16 px-4 sm:px-6">
                    <div className="flex flex-col items-center max-w-4xl">
                        
                        {/* Tactile Console Badge */}
                        <div className="mb-6 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 border-[#0c141c] bg-[#fbf0e6] shadow-[3px_3px_0_#0c141c] text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#0c141c] uppercase">
                            <span className="w-2 h-2 rounded-full bg-[#0f756e] animate-pulse" />
                            <span>Visual Architecture Planner // ARC-75</span>
                        </div>

                        {/* Solid Non-Gradient Retro-Futuristic Headline */}
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold mb-6 leading-[1.08] tracking-tight text-[#0c141c] uppercase">
                            Master Your<br />
                            <span className="text-[#dc5c1c] underline decoration-4 decoration-[#0c141c] underline-offset-8">
                                System Architecture.
                            </span>
                        </h1>

                        {/* Tracked-out Body Subheading */}
                        <p className="text-base sm:text-lg md:text-xl text-[#4a5863] font-body font-medium mb-10 max-w-2xl leading-relaxed">
                            Map APIs, UI layers, and business logic into living diagrams — before you write a single line of code. Space-age clarity for modern systems.
                        </p>

                        {/* Tactile Pill Call to Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => { setSetupMode("SELECT"); setIsSetupOpen(true); }}
                                className="retro-btn text-xs sm:text-sm tracking-[0.2em] px-8 py-3.5 w-full sm:w-auto flex items-center justify-center gap-3"
                            >
                                Build the Blueprint
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M3 8h10M9 4l4 4-4 4" />
                                </svg>
                            </button>
                            <Link
                                href="#features"
                                className="retro-btn-outline text-xs sm:text-sm tracking-[0.2em] px-8 py-3.5 w-full sm:w-auto"
                            >
                                See How It Works
                            </Link>
                        </div>
                    </div>

                    {/* ── Architecture Diagram Hero Card (Tactile Radar Console Frame) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="mt-14 sm:mt-16 w-full max-w-5xl"
                    >
                        <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden border-[3px] border-[#0c141c] bg-[#08131d] shadow-[8px_8px_0_#0c141c]">
                            
                            {/* Titlebar / Diagnostic Console Bar */}
                            <div className="flex items-center justify-between px-6 py-3.5 bg-[#fbf0e6] border-b-[2.5px] border-[#0c141c]">
                                {/* 3 Indicator Status Lights */}
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#75a557] border border-[#0c141c]" />
                                    <div className="w-3 h-3 rounded-full bg-[#e0b741] border border-[#0c141c]" />
                                    <div className="w-3 h-3 rounded-full bg-[#dc5038] border border-[#0c141c]" />
                                </div>
                                {/* Center Telemetry Title */}
                                <div className="font-mono text-xs font-bold tracking-[0.25em] text-[#0c141c] uppercase flex items-center gap-2">
                                    <span>ARCHITECTURE.DEVFLOW // CONSOLE READY</span>
                                </div>
                                {/* Dial Icon */}
                                <div className="w-6 h-6 rounded-full border-2 border-[#0c141c] bg-[#8baec0] relative flex items-center justify-center">
                                    <div className="w-[1.5px] h-2.5 bg-[#0c141c] absolute top-0.5 rounded-full" />
                                </div>
                            </div>

                            {/* Radar Canvas with Dot Grid & Geometric Nodes */}
                            <div
                                className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] overflow-hidden bg-[#08131d]"
                                style={{
                                    backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.35) 1.2px, transparent 1.2px)",
                                    backgroundSize: "24px 24px",
                                }}
                            >
                                {/* Center Circular Radar Ring (from reference design) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full border-[10px] sm:border-[12px] border-[#3e5363] bg-[#0f756e]/25 pointer-events-none opacity-60">
                                    <div className="absolute inset-0 rounded-full border border-white/20" />
                                </div>

                                {/* Tactile Diagram Nodes */}
                                <div className="absolute top-[12%] left-[12%] sm:left-[16%]">
                                    <TactileNode title="User Interface" sub="React / Next.js" type="PAGE" bg="#fbf0e6" border="#0c141c" text="#0c141c" />
                                </div>
                                <div className="absolute top-[42%] left-[34%] sm:left-[38%]">
                                    <TactileNode title="Main Gateway" sub="REST / GraphQL" type="API" bg="#dc5c1c" border="#0c141c" text="#ffffff" />
                                </div>
                                <div className="absolute bottom-[14%] left-[16%] sm:left-[20%]">
                                    <TactileNode title="Analytics Engine" sub="Event Bus" type="LOGIC" bg="#eec85d" border="#0c141c" text="#0c141c" />
                                </div>
                                <div className="absolute top-[16%] right-[16%] sm:right-[22%]">
                                    <TactileNode title="Microservice" sub="gRPC Worker" type="SERVICE" bg="#8faec4" border="#0c141c" text="#0c141c" />
                                </div>
                                <div className="absolute bottom-[22%] right-[22%] sm:right-[28%]">
                                    <TactileNode title="Auth Guard" sub="OAuth 2.0" type="AUTH" bg="#0f756e" border="#0c141c" text="#ffffff" />
                                </div>

                                {/* Solid Vector Connection Cables */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 400" preserveAspectRatio="none">
                                    <defs>
                                        <marker id="retro-arrow-teal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L6,3 z" fill="#0f756e" />
                                        </marker>
                                        <marker id="retro-arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L6,3 z" fill="#dc5c1c" />
                                        </marker>
                                    </defs>
                                    <path d="M240,75 C310,75 320,175 365,175" stroke="#0f756e" strokeWidth="2.5" fill="none" strokeDasharray="5 3" markerEnd="url(#retro-arrow-teal)" />
                                    <path d="M470,175 C530,175 560,85 640,85" stroke="#dc5c1c" strokeWidth="2.5" fill="none" markerEnd="url(#retro-arrow-orange)" />
                                    <path d="M470,185 C510,185 530,290 620,290" stroke="#0f756e" strokeWidth="2.5" fill="none" strokeDasharray="5 3" markerEnd="url(#retro-arrow-teal)" />
                                    <path d="M240,290 C310,290 320,200 365,185" stroke="#dc5c1c" strokeWidth="2" fill="none" />
                                </svg>

                                {/* Bottom Canvas Metadata Tag */}
                                <div className="absolute bottom-3 right-5 font-mono text-[9px] tracking-[0.25em] text-[#6b899b] uppercase font-bold">
                                    CANVAS READY // 1440PX RADAR
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* ── Feature Cards Section (1, 2, 3) ── */}
                <section id="features" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
                    <div className="text-center mb-16">
                        <span className="font-mono text-xs tracking-[0.3em] font-bold text-[#dc5c1c] uppercase block mb-3">
                            WHY DEVFLOW // 01-03
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-display font-bold text-[#0c141c] tracking-tight uppercase">
                            Everything You Need To<br />
                            <span className="text-[#0f756e]">Ship With Confidence.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((f, i) => (
                            <div
                                key={f.title}
                                className="relative p-7 sm:p-8 rounded-[28px] bg-[#fbf0e6] border-[2.5px] border-[#0c141c] shadow-[6px_6px_0_#0c141c] flex flex-col justify-between hover:-translate-y-1 transition-transform"
                            >
                                <div>
                                    {/* Numbering Stamp & Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`w-12 h-12 rounded-2xl border-2 border-[#0c141c] flex items-center justify-center text-white shadow-[2px_2px_0_#0c141c] ${f.accent === "teal" ? "bg-[#0f756e]" : f.accent === "orange" ? "bg-[#dc5c1c]" : "bg-[#8faec4] text-[#0c141c]"}`}>
                                            {f.icon}
                                        </div>
                                        <span className="font-display font-bold text-4xl text-[#0c141c]/20 select-none">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                    </div>

                                    <span className="font-mono text-[9px] tracking-[0.25em] font-bold text-[#63707c] uppercase block mb-2">
                                        {f.tag}
                                    </span>
                                    <h3 className="font-display font-bold text-lg sm:text-xl text-[#0c141c] mb-3 leading-snug uppercase">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm text-[#4a5863] leading-relaxed font-body">
                                        {f.description}
                                    </p>
                                </div>

                                {/* Card Footer Indicator Bar */}
                                <div className="mt-8 pt-4 border-t-2 border-[#0c141c]/15 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-[#75a557]" />
                                        <div className="w-2 h-2 rounded-full bg-[#e0b741]" />
                                        <div className="w-2 h-2 rounded-full bg-[#dc5038]" />
                                    </div>
                                    <span className="font-mono text-[9px] tracking-[0.2em] font-bold text-[#0c141c] uppercase">
                                        STATUS: ACTIVE
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Process: Three Steps to Clarity ── */}
                <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-16">
                    <div className="text-center mb-16">
                        <span className="font-mono text-xs tracking-[0.3em] font-bold text-[#0f756e] uppercase block mb-3">
                            THE PROCESS
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-display font-bold text-[#0c141c] tracking-tight uppercase">
                            Three Steps to Clarity.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
                        {steps.map((step, i) => (
                            <div
                                key={step.number}
                                className="flex flex-col items-center text-center p-8 rounded-[28px] bg-[#fbf0e6] border-[2.5px] border-[#0c141c] shadow-[5px_5px_0_#0c141c]"
                            >
                                <div className="w-14 h-14 rounded-full border-[2.5px] border-[#0c141c] bg-[#dc5c1c] text-white flex items-center justify-center font-display font-bold text-xl mb-6 shadow-[3px_3px_0_#0c141c]">
                                    {step.number}
                                </div>
                                <h3 className="font-display font-bold text-base sm:text-lg text-[#0c141c] mb-3 uppercase tracking-wide">
                                    {step.label}
                                </h3>
                                <p className="text-sm text-[#4a5863] leading-relaxed">
                                    {step.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Flow Editor Terminal Preview ── */}
                <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-20 mb-12">
                    <div className="text-center mb-14">
                        <span className="font-mono text-xs tracking-[0.3em] font-bold text-[#dc5c1c] uppercase block mb-2">
                            THE WORKBENCH
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-display font-bold text-[#0c141c] tracking-tight uppercase">
                            The Flow Editor.
                        </h2>
                    </div>

                    <div className="rounded-[28px] sm:rounded-[36px] overflow-hidden border-[3px] border-[#0c141c] bg-[#fbf0e6] shadow-[8px_8px_0_#0c141c]">
                        {/* Editor Header Bar */}
                        <div className="flex items-center justify-between px-6 py-3.5 bg-[#eedecf] border-b-2 border-[#0c141c]">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#dc5038] border border-[#0c141c]" />
                                <div className="w-3 h-3 rounded-full bg-[#e0b741] border border-[#0c141c]" />
                                <div className="w-3 h-3 rounded-full bg-[#75a557] border border-[#0c141c]" />
                            </div>
                            <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#0c141c] uppercase">
                                DEVFLOW WORKBENCH // PROJECT_CANVAS
                            </span>
                            <div className="w-3 h-3 rounded-full bg-[#0f756e] animate-pulse" />
                        </div>

                        {/* Editor Canvas & Sidebars */}
                        <div className="flex flex-col md:flex-row h-[520px]">
                            {/* Left Tool Palette */}
                            <div className="w-full md:w-16 border-b-2 md:border-b-0 md:border-r-2 border-[#0c141c] bg-[#eedecf] flex md:flex-col items-center justify-around md:justify-start gap-4 p-4">
                                {[
                                    { label: "P", color: "#dc5c1c" },
                                    { label: "A", color: "#0f756e" },
                                    { label: "D", color: "#eec85d" },
                                    { label: "S", color: "#8faec4" },
                                ].map((tool, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full border-2 border-[#0c141c] flex items-center justify-center font-display font-bold text-xs shadow-[2px_2px_0_#0c141c] cursor-pointer hover:translate-y-[-2px] transition-transform"
                                        style={{ backgroundColor: tool.color, color: tool.color === "#eec85d" ? "#0c141c" : "#ffffff" }}
                                    >
                                        {tool.label}
                                    </div>
                                ))}
                            </div>

                            {/* Canvas Area */}
                            <div
                                className="flex-1 relative overflow-hidden bg-[#08131d]"
                                style={{
                                    backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 1.2px, transparent 1.2px)",
                                    backgroundSize: "22px 22px",
                                }}
                            >
                                <div className="absolute top-12 left-12">
                                    <TactileNode title="UserDashboard" sub="Page View" type="PAGE" bg="#fbf0e6" border="#0c141c" text="#0c141c" />
                                </div>
                                <div className="absolute top-32 left-72">
                                    <TactileNode title="REST Gateway" sub="Endpoints" type="API" bg="#dc5c1c" border="#0c141c" text="#ffffff" />
                                </div>
                                <div className="absolute bottom-20 left-72">
                                    <TactileNode title="Auth Guard" sub="Middleware" type="AUTH" bg="#0f756e" border="#0c141c" text="#ffffff" />
                                </div>
                                <div className="absolute top-16 right-16">
                                    <TactileNode title="PostgreSQL" sub="Primary DB" type="DB" bg="#8faec4" border="#0c141c" text="#0c141c" />
                                </div>

                                {/* Status Bar */}
                                <div className="absolute bottom-0 inset-x-0 px-4 py-2 bg-[#fbf0e6] border-t-2 border-[#0c141c] flex items-center justify-between font-mono text-[9px] font-bold tracking-[0.2em] text-[#0c141c]">
                                    <span>STATUS: 4 NODES SYNCED</span>
                                    <span className="text-[#0f756e]">LATENCY: 12MS</span>
                                </div>
                            </div>

                            {/* Right Properties Inspector */}
                            <div className="w-full md:w-64 border-t-2 md:border-t-0 md:border-l-2 border-[#0c141c] bg-[#eedecf] p-5 flex flex-col justify-between">
                                <div>
                                    <span className="font-mono text-[10px] tracking-[0.25em] font-bold text-[#63707c] uppercase block mb-3">
                                        NODE INSPECTOR
                                    </span>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="font-mono text-[9px] font-bold tracking-wider text-[#0c141c] uppercase block mb-1">NODE TITLE</label>
                                            <div className="px-3 py-1.5 rounded-lg border-2 border-[#0c141c] bg-[#fbf0e6] font-display text-xs font-bold text-[#0c141c]">REST Gateway</div>
                                        </div>
                                        <div>
                                            <label className="font-mono text-[9px] font-bold tracking-wider text-[#0c141c] uppercase block mb-1">PROTOCOL</label>
                                            <div className="px-3 py-1.5 rounded-lg border-2 border-[#0c141c] bg-[#fbf0e6] font-mono text-xs text-[#0c141c]">HTTP/2 HTTPS</div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSetupMode("SELECT"); setIsSetupOpen(true); }}
                                    className="retro-btn text-[10px] tracking-wider py-2 mt-4 w-full"
                                >
                                    OPEN CONSOLE
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Call To Action Banner ── */}
                <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 pb-28">
                    <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden border-[3px] border-[#0c141c] bg-[#fbf0e6] p-10 sm:p-16 text-center shadow-[8px_8px_0_#0c141c]">
                        
                        {/* Background Decor in Banner */}
                        <div className="absolute top-6 left-8 w-14 h-14 rounded-full border-4 border-[#dc5c1c]/40" />
                        <div className="absolute bottom-6 right-8 hidden sm:flex items-end gap-1.5">
                            <div className="w-2 h-8 bg-[#0f756e] rounded-full" />
                            <div className="w-2 h-5 bg-[#dc5c1c] rounded-full" />
                            <div className="w-2 h-9 bg-[#8faec4] rounded-full" />
                        </div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <span className="font-mono text-xs tracking-[0.3em] font-bold text-[#dc5c1c] uppercase block mb-4">
                                READY TO BEGIN? // FREE ACCESS
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-display font-bold text-[#0c141c] mb-6 tracking-tight uppercase">
                                Stop Guessing.<br />
                                <span className="text-[#0f756e]">Start Architecting.</span>
                            </h2>
                            <p className="text-base sm:text-lg text-[#4a5863] mb-8 leading-relaxed font-body">
                                Join engineers and system designers building robust, scalable architectures with space-age clarity.
                            </p>
                            <button
                                onClick={() => { setSetupMode("SELECT"); setIsSetupOpen(true); }}
                                className="retro-btn text-xs sm:text-sm tracking-[0.2em] px-10 py-4 inline-flex items-center gap-3"
                            >
                                Build Your Blueprint
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M3 8h10M9 4l4 4-4 4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 border-t-[2.5px] border-[#0c141c] bg-[#fbf0e6] py-10 px-6 sm:px-12">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#dc5c1c] border-2 border-[#0c141c] flex items-center justify-center text-white font-display font-bold text-xs shadow-[2px_2px_0_#0c141c]">
                            D
                        </div>
                        <span className="font-display font-bold text-[#0c141c] text-sm uppercase">DevFlow</span>
                        <span className="font-mono text-[9px] text-[#63707c] uppercase tracking-wider">© 2026 ARCHIVE-75</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#75a557]" />
                        <span className="w-2 h-2 rounded-full bg-[#e0b741]" />
                        <span className="w-2 h-2 rounded-full bg-[#dc5038]" />
                        <span className="font-mono text-[10px] tracking-[0.2em] font-bold text-[#0c141c] uppercase ml-2">ALL SYSTEMS OPERATIONAL</span>
                    </div>

                    <nav className="flex items-center gap-6">
                        {["Privacy", "Terms", "Contact"].map((item) => (
                            <Link key={item} href="#" className="font-mono text-xs font-bold text-[#0c141c] hover:text-[#dc5c1c] uppercase tracking-wider transition-colors">
                                {item}
                            </Link>
                        ))}
                    </nav>
                </div>
            </footer>

            {/* ── Project Setup Modal (Tactile Console Styling) ── */}
            <AnimatePresence>
                {isSetupOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c141c]/60 backdrop-blur-sm px-4 py-8 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="bg-[#fbf0e6] border-[3px] border-[#0c141c] rounded-[32px] p-6 sm:p-9 max-w-xl w-full shadow-[10px_10px_0_#0c141c] relative my-auto"
                        >
                            <button
                                onClick={() => setIsSetupOpen(false)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full border-2 border-[#0c141c] bg-[#eedecf] flex items-center justify-center font-bold text-[#0c141c] hover:bg-[#dc5c1c] hover:text-white transition-colors"
                            >
                                ✕
                            </button>

                            {setupMode === "SELECT" && (
                                <div className="space-y-6">
                                    <div className="text-center pr-6">
                                        <span className="font-mono text-[10px] tracking-[0.25em] font-bold text-[#dc5c1c] uppercase block mb-1">
                                            SELECT OPERATION MODE
                                        </span>
                                        <h3 className="text-2xl font-display font-bold text-[#0c141c] tracking-wide uppercase">
                                            Start Your Project
                                        </h3>
                                        <p className="text-sm text-[#50606e] font-body mt-1">
                                            Choose your preferred method to construct the system blueprint.
                                        </p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                        <button
                                            onClick={() => setSetupMode("MANUAL")}
                                            className="flex flex-col items-center p-6 rounded-[22px] border-2 border-[#0c141c] bg-[#eedecf] hover:bg-[#faede1] shadow-[4px_4px_0_#0c141c] active:translate-y-1 active:shadow-[1px_1px_0_#0c141c] transition-all text-center group cursor-pointer"
                                        >
                                            <div className="w-12 h-12 rounded-full border-2 border-[#0c141c] bg-[#dc5c1c] text-white flex items-center justify-center mb-3">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                                                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                </svg>
                                            </div>
                                            <h4 className="font-display font-bold text-sm text-[#0c141c] uppercase mb-1">Design Manually</h4>
                                            <p className="text-xs text-[#50606e] font-body">Blank interactive canvas with drag-and-drop nodes.</p>
                                        </button>

                                        <button
                                            onClick={() => setSetupMode("AI")}
                                            className="flex flex-col items-center p-6 rounded-[22px] border-2 border-[#0c141c] bg-[#eedecf] hover:bg-[#faede1] shadow-[4px_4px_0_#0c141c] active:translate-y-1 active:shadow-[1px_1px_0_#0c141c] transition-all text-center group cursor-pointer"
                                        >
                                            <div className="w-12 h-12 rounded-full border-2 border-[#0c141c] bg-[#0f756e] text-white flex items-center justify-center mb-3">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                                </svg>
                                            </div>
                                            <h4 className="font-display font-bold text-sm text-[#0c141c] uppercase mb-1">Generate with AI</h4>
                                            <p className="text-xs text-[#50606e] font-body">Describe your system and Groq AI maps every node.</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(setupMode === "MANUAL" || setupMode === "AI") && (
                                <form onSubmit={setupMode === "MANUAL" ? handleCreateManual : handleCreateAI} className="space-y-4">
                                    <div className="flex items-center gap-3 border-b-2 border-[#0c141c] pb-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setSetupMode("SELECT")}
                                            className="text-xs font-mono font-bold text-[#dc5c1c] hover:underline"
                                        >
                                            ← BACK
                                        </button>
                                        <h3 className="text-lg font-display font-bold text-[#0c141c] uppercase">
                                            {setupMode === "MANUAL" ? "Manual Setup" : "Groq AI Architecture"}
                                        </h3>
                                    </div>

                                    {errorMessage && (
                                        <div className="p-3 rounded-xl border-2 border-[#dc5038] bg-[#dc5038]/10 text-[#dc5038] font-mono text-[11px] font-bold">
                                            {errorMessage}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block font-mono text-[10px] font-bold tracking-wider text-[#0c141c] uppercase mb-1">PROJECT NAME</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className="w-full rounded-full border-2 border-[#0c141c] bg-[#eedecf]/60 px-4 py-2.5 text-xs text-[#0c141c] font-body focus:outline-none focus:ring-2 focus:ring-[#dc5c1c]"
                                            placeholder="e.g., Space Logistics API"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-mono text-[10px] font-bold tracking-wider text-[#0c141c] uppercase mb-1">APP TYPE</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                                            className="w-full rounded-full border-2 border-[#0c141c] bg-[#eedecf]/60 px-4 py-2.5 text-xs text-[#0c141c] font-body focus:outline-none focus:ring-2 focus:ring-[#dc5c1c]"
                                        >
                                            <option>Web Application</option>
                                            <option>Mobile Application</option>
                                            <option>Desktop Application</option>
                                            <option>Distributed Microservices</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-mono text-[10px] font-bold tracking-wider text-[#0c141c] uppercase mb-1">PROJECT DESCRIPTION</label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                            rows={2}
                                            className="w-full rounded-2xl border-2 border-[#0c141c] bg-[#eedecf]/60 p-3 text-xs text-[#0c141c] font-body focus:outline-none focus:ring-2 focus:ring-[#dc5c1c] resize-none"
                                            placeholder="What does this application do?"
                                        />
                                    </div>

                                    {setupMode === "AI" && (
                                        <div>
                                            <label className="block font-mono text-[10px] font-bold tracking-wider text-[#0c141c] uppercase mb-1 flex items-center justify-between">
                                                <span>NODE STRUCTURE SPECIFICATION</span>
                                                <span className="text-[#0f756e]">AI POWERED</span>
                                            </label>
                                            <textarea
                                                required
                                                value={formData.nodeStructure}
                                                onChange={e => setFormData(p => ({ ...p, nodeStructure: e.target.value }))}
                                                rows={4}
                                                className="w-full rounded-2xl border-2 border-[#0c141c] bg-[#eedecf]/60 p-3 text-xs text-[#0c141c] font-body focus:outline-none focus:ring-2 focus:ring-[#dc5c1c] resize-none"
                                                placeholder="Example: Landing Page -> Auth Gateway -> Dashboard. Inside Dashboard display User Profile, Tournament Stream, and Metrics DB..."
                                            />
                                        </div>
                                    )}

                                    <div className="pt-2 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isGenerating}
                                            className="retro-btn text-xs tracking-wider px-6 py-2.5"
                                        >
                                            {isGenerating ? "GENERATING BLUEPRINT..." : (setupMode === "AI" ? "LAUNCH AI BLUEPRINT" : "OPEN WORKBENCH")}
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

/* ─── Tactile Diagram Node Subcomponent ──────────────────── */
function TactileNode({
    title,
    sub,
    type,
    bg,
    border,
    text,
}: {
    title: string;
    sub: string;
    type: string;
    bg: string;
    border: string;
    text: string;
}) {
    return (
        <div
            className="flex flex-col px-3.5 py-2.5 rounded-2xl border-[2.5px] shadow-[3px_3px_0_#0c141c] select-none hover:translate-y-[-2px] transition-transform"
            style={{
                backgroundColor: bg,
                borderColor: border,
                color: text,
            }}
        >
            <div className="flex items-center gap-1.5 mb-1">
                <span className="font-mono text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/10 uppercase">
                    {type}
                </span>
            </div>
            <span className="font-display font-bold text-xs leading-tight tracking-wide">{title}</span>
            <span className="font-mono text-[9px] tracking-wider opacity-75">{sub}</span>
        </div>
    );
}