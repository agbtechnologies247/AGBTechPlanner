import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AGB Tech Planner — Task Management for Every Industry",
  description:
    "A powerful, collaborative task and project planner built for B2B and B2C teams across 100+ industries. Plan smarter. Deliver faster.",
  keywords: "task management, project planner, team collaboration, kanban, AGB Tech",
  openGraph: {
    title: "AGB Tech Planner",
    description: "Collaborative task management for every industry vertical.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
