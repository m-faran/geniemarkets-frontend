import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://geniemarkets.xyz"
  ),
  title: "Genie Markets — Onchain Number Prediction",
  description:
    "Predict numbers, win up to 600x. Powered by Chainlink VRF randomness and Privy embedded wallets. No seed phrases, no gas fees.",
  openGraph: {
    title: "Genie Markets — Onchain Prediction Protocol",
    description: "Predict numbers, win up to 600x. Onchain prediction markets powered by Chainlink VRF.",
    images: ["/genie-lamp-artwork-LOGO.png"],
  },
  icons: {
    icon: "/genie-lamp-artwork-LOGO.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#05070B] font-sans text-slate-100 selection:bg-violet-600/30 selection:text-violet-200 relative">
        {/* Global Web3 Ambient Grid & Glow Layer */}
        <div className="fixed inset-0 pointer-events-none cyber-matrix-grid -z-10" />
        <div className="fixed -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="fixed -bottom-48 right-10 w-[500px] h-[300px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <Providers>
          <NavBar />
          <main className="flex-1 relative z-0">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
