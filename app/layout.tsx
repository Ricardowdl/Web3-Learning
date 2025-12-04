import type { Metadata } from "next";
import { Web3Provider } from "@/contexts/Web3Context";
import Navigation from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web3 DApp - 去中心化应用",
  description: "基于Next.js的Web3去中心化应用，集成MetaMask钱包功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="antialiased bg-gray-50">
        <Web3Provider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}
