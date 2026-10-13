import type { Metadata } from "next";
import { displayFont, bodyFont, monoFont } from "../execution/config/fonts";
import "./globals.css";

export const metadata: Metadata = {
    title: "DevFlow - Visual Architecture Planner",
    description: "Master Your System Architecture with Vintage Space-Age Tactile Planning.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
            <body className="font-body antialiased bg-[#dfbe9b] text-[#0c141c] min-h-screen flex flex-col selection:bg-[#dc5c1c] selection:text-white">
                {children}
            </body>
        </html>
    );
}

