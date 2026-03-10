import { Orbitron, Work_Sans } from "next/font/google";

export const displayFont = Orbitron({
    subsets: ["latin"],
    variable: "--font-display",
    weight: ["400", "500", "600", "700", "800", "900"],
});

export const bodyFont = Work_Sans({
    subsets: ["latin"],
    variable: "--font-body",
});
