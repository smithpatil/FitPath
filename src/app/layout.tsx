import type { Metadata } from "next";
import { Inter } from "next/font/google";
import TimezoneCookie from "@/components/TimezoneCookie";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitPath — a calm start to fitness",
  description: "Answer a few questions and get a simple weekly workout plan made for you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {/* Lets keyboard and screen-reader users jump past the menu */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <TimezoneCookie />
        {children}
      </body>
    </html>
  );
}
