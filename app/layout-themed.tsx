import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StackProvider, StackTheme, Theme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Personal AI Agent",
    description: "AI-powered personal agent for trending news, research papers, and social media posting",
};

const stackTheme: Theme = {
    light: {
        background: 'hsl(240 10% 99%)',      // almost white
        foreground: 'hsl(240 10% 3.9%)',     // near black
        primary: 'hsl(221.2 83.2% 53.3%)',   // blue-600
        'primary-foreground': 'hsl(210 40% 98%)', // almost white
        card: 'hsl(0 0% 100%)',              // white
        'card-foreground': 'hsl(240 10% 3.9%)',
        border: 'hsl(240 5.9% 90%)',         // gray-200
        input: 'hsl(240 5.9% 90%)',
        ring: 'hsl(221.2 83.2% 53.3%)',
    },
    dark: {
        background: 'hsl(0 0% 3.9%)',        // near black
        foreground: 'hsl(0 0% 98%)',         // almost white
        primary: 'hsl(217.2 91.2% 59.8%)',   // blue-500
        'primary-foreground': 'hsl(210 40% 98%)',
        card: 'hsl(0 0% 5.5%)',              // slightly lighter black
        'card-foreground': 'hsl(0 0% 98%)',
        border: 'hsl(240 3.7% 15.9%)',       // gray-800
        input: 'hsl(240 3.7% 15.9%)',
        ring: 'hsl(217.2 91.2% 59.8%)',
    },
    radius: '0.75rem', // Corresponds to rounded-xl in Tailwind
    font: {
        sans: {
            name: 'Geist',
            variants: ['regular', 'medium', 'bold'],
        },
        mono: {
            name: 'Geist Mono',
            variants: ['regular'],
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <StackProvider app={stackServerApp}>
                    <StackTheme theme={stackTheme}>
                        {children}
                    </StackTheme>
                </StackProvider>
                <Analytics />
            </body>
        </html>
    );
}
