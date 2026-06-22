import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], weight: ["600","700","800"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Liraz Amir — Deploy Log",
  description: "A builder who designs, ships, and runs software across AI apps, developer tooling, browser extensions, and learning platforms. Most of it live right now.",
  metadataBase: new URL("https://sbz-showcase.netlify.app"),
  openGraph: {
    title: "Liraz Amir — Deploy Log",
    description: "Built end to end. Shipped to production. AI apps, dev tools, extensions, and learning platforms.",
    url: "https://sbz-showcase.netlify.app",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
