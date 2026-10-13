import { Syncopate, Space_Grotesk, Space_Mono } from "next/font/google";

export const displayFont = Syncopate({
    subsets: ["latin"],
    variable: "--font-display",
    weight: ["400", "700"],
});

export const bodyFont = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-body",
    weight: ["400", "500", "600", "700"],
});

export const monoFont = Space_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    weight: ["400", "700"],
});

