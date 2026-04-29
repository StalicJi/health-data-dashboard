import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "睡眠資料分析",
  description: "Apple Health 睡眠資料分析儀表板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <Providers>
          <div className="h-0.5 bg-gradient-to-r from-[#0e7490] via-[#06b6d4] to-[#0e7490]" />
          <nav className="bg-background border-b border-border px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-primary text-xl leading-none">◐</span>
              <span className="text-foreground font-bold text-lg tracking-wide">
                睡眠分析
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-8">
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium tracking-wide"
                >
                  總覽
                </Link>
                <Link
                  href="/upload"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium tracking-wide"
                >
                  紀錄上傳
                </Link>
              </div>
              <ThemeToggle />
            </div>
          </nav>
          <main className="flex-1 px-8 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
