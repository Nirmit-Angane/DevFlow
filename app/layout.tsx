import type { Metadata } from "next";
import { displayFont, bodyFont } from "../execution/config/fonts";
import "./globals.css";

export const metadata: Metadata = {
    title: "DevFlow - Visual Architecture Planner",
    description: "Master Your System Architecture.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} dark`}>
            <body className="font-body antialiased bg-base text-textPrimary min-h-screen flex flex-col">
                {children}
            </body>
        </html>
    );
}
