import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CareerCraft AI — Your Intelligent Career Copilot",
  description:
    "AI-powered resume analysis, ATS scoring, job role matching, and interview preparation.",
  metadataBase: new URL("https://careercraft.ai")
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans bg-slate-50 text-navy-900">{children}</body>
    </html>
  );
}
