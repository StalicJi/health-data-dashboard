import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

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
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">睡眠分析</h1>
          <div className="flex gap-6 text-sm text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">總覽</Link>
            <Link href="/upload" className="hover:text-white transition-colors">上傳資料</Link>
          </div>
        </nav>
        <main className="p-6 flex-1">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
