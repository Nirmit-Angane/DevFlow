'use client';

import React, { useState } from 'react';

export interface RetroLoginProps {
    onLogin?: (email: string) => void;
    className?: string;
}

export const RetroLogin: React.FC<RetroLoginProps> = ({ onLogin, className = '' }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitted(true);
        if (onLogin) {
            onLogin(email);
        }
    };

    return (
        <div
            className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#dfbe9b] relative overflow-hidden select-none font-sans ${className}`}
            style={{
                // Import Google Fonts dynamically if not present globally
                fontFamily: `'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif`,
            }}
        >
            {/* Embedded Google Fonts stylesheet for instant standalone rendering */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&family=Syncopate:wght@700&display=swap');
                
                .font-syncopate {
                    font-family: 'Syncopate', sans-serif;
                }
                .font-space-mono {
                    font-family: 'Space Mono', monospace;
                }
                .font-space-grotesk {
                    font-family: 'Space Grotesk', sans-serif;
                }
            `}</style>

            {/* Subtle Floating Decorative Elements */}
            {/* Top-Left: Hollow Orange Circle */}
            <div
                aria-hidden="true"
                className="absolute top-6 left-6 sm:top-12 sm:left-12 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[7px] sm:border-[8px] border-[#df8b5b]/90 pointer-events-none"
            />

            {/* Bottom-Right: 4 Minimalist Staggered Vertical Bars */}
            <div
                aria-hidden="true"
                className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 flex items-end gap-1.5 sm:gap-2 pointer-events-none"
            >
                {/* Teal Bar */}
                <div className="w-2 sm:w-2.5 h-10 sm:h-12 bg-[#27847a] rounded-full" />
                {/* Burnt Orange Bar */}
                <div className="w-2 sm:w-2.5 h-6 sm:h-7 bg-[#dc5f2b] rounded-full" />
                {/* Slate Blue Bar */}
                <div className="w-2 sm:w-2.5 h-12 sm:h-14 bg-[#8faec4] rounded-full" />
                {/* Warm Yellow Bar */}
                <div className="w-2 sm:w-2.5 h-8 sm:h-9 bg-[#eec85d] rounded-full" />
            </div>

            {/* Main Login Card (Split 2-Column Layout) */}
            <main className="relative z-10 w-full max-w-[780px] bg-[#0c141c] rounded-[32px] sm:rounded-[38px] border-[3px] border-[#0c141c] shadow-[0_20px_50px_rgba(15,20,25,0.25)] overflow-hidden flex flex-col md:flex-row">
                
                {/* LEFT PANEL: Welcome & Portal Radar Graphic */}
                <section className="w-full md:w-[52%] bg-[#08131d] p-6 sm:p-8 flex flex-col justify-between relative border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#0c141c]">
                    
                    {/* Top Metadata Text */}
                    <div className="flex items-center justify-between text-[#577486] font-space-mono text-[10px] tracking-[0.25em] font-semibold uppercase">
                        <span>TOMORROW ARCHIVE</span>
                        <span>75</span>
                    </div>

                    {/* Central Hero Radar Graphic */}
                    <div className="my-6 sm:my-8 flex justify-center items-center">
                        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[10px] sm:border-[12px] border-[#3e5363] bg-[#0f756e] overflow-hidden shadow-inner flex items-center justify-center">
                            
                            {/* Faint Dot Grid Pattern Overlay */}
                            <div
                                className="absolute inset-0 opacity-40"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 1.2px, transparent 1.2px)',
                                    backgroundSize: '13px 13px',
                                }}
                            />

                            {/* Abstract Burnt-Orange Planet Form (Offset Bottom-Right) */}
                            <div className="absolute -bottom-2 -right-2 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#dd5c22]" />

                            {/* Small Yellow Accent Pill Shape */}
                            <div className="absolute top-[42%] right-[42%] w-5 h-8 sm:w-6 sm:h-9 rounded-full bg-[#e8c355] -rotate-[35deg] shadow-sm" />

                            {/* Intersecting White Pill-Shaped Line */}
                            <div className="absolute bottom-9 left-6 w-16 sm:w-20 h-2 sm:h-2.5 rounded-full bg-white -rotate-[14deg] shadow-sm z-10" />
                        </div>
                    </div>

                    {/* Left Bottom Typography */}
                    <div className="space-y-1">
                        <h1 className="font-syncopate font-bold text-2xl sm:text-3xl text-white tracking-tight uppercase leading-[1.05]">
                            WELCOME<br />BACK
                        </h1>
                        <p className="font-space-grotesk text-[10px] sm:text-[11px] tracking-[0.22em] text-[#6b899b] uppercase pt-1 font-medium">
                            SIGN IN TO YOUR ACCOUNT
                        </p>
                    </div>
                </section>

                {/* RIGHT PANEL: Access Console & Form */}
                <section className="w-full md:w-[48%] bg-[#fbf0e6] p-6 sm:p-8 flex flex-col justify-between">
                    
                    <div>
                        {/* Header: Access Console & Status Gauge Dial */}
                        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-[1.5px] border-[#0c141c]">
                            <div>
                                <h2 className="font-syncopate font-bold text-xs sm:text-sm tracking-wide text-[#0c141c] uppercase">
                                    ACCESS CONSOLE
                                </h2>
                                <p className="font-space-mono text-[9px] sm:text-[10px] tracking-[0.25em] text-[#7d858b] uppercase mt-0.5 font-medium">
                                    SYSTEM READY
                                </p>
                            </div>

                            {/* Vintage Dial/Gauge Clock Icon */}
                            <div
                                aria-label="System status indicator"
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#0c141c] bg-[#8baec0] relative flex items-center justify-center shrink-0 shadow-sm"
                            >
                                {/* Vertical Dial Indicator Tick */}
                                <div className="w-[2px] h-3 bg-[#0c141c] rounded-full absolute top-1" />
                            </div>
                        </div>

                        {/* Interactive Form */}
                        <form onSubmit={handleSubmit} className="mt-6 sm:mt-7 space-y-4 sm:space-y-5">
                            <div>
                                <label
                                    htmlFor="retro-email"
                                    className="block font-space-mono text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#3d454d] uppercase mb-1.5"
                                >
                                    EMAIL
                                </label>
                                <input
                                    id="retro-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-full border-2 border-[#0c141c] bg-[#f0dfd1]/50 px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#0c141c] placeholder:text-[#9e9084] font-space-grotesk focus:outline-none focus:ring-2 focus:ring-[#db5c1c] focus:bg-[#f0dfd1] transition-all"
                                />
                            </div>

                            {/* Burnt-Orange Tactile Pill Button with Hard Offset Shadow */}
                            <button
                                type="submit"
                                className="w-full rounded-full border-[2.5px] border-[#0c141c] bg-[#db5c1c] hover:bg-[#e66627] text-white font-syncopate font-bold text-xs sm:text-sm tracking-[0.2em] uppercase py-2.5 sm:py-3 shadow-[0_5px_0_#0c141c] active:translate-y-1 active:shadow-[0_1px_0_#0c141c] transition-all cursor-pointer flex items-center justify-center"
                            >
                                {isSubmitted ? 'AUTHENTICATING...' : 'CONTINUE'}
                            </button>
                        </form>
                    </div>

                    {/* Footer: Triple Indicator Status Lights */}
                    <div className="pt-8 sm:pt-10 flex justify-center items-center gap-2.5">
                        <span aria-label="Status: Optimal" className="w-2 h-2 rounded-full bg-[#75a557] border border-[#0c141c]/40" />
                        <span aria-label="Status: Standby" className="w-2 h-2 rounded-full bg-[#e0b741] border border-[#0c141c]/40" />
                        <span aria-label="Status: Locked" className="w-2 h-2 rounded-full bg-[#dc5038] border border-[#0c141c]/40" />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default RetroLogin;
