import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Genie Markets — Onchain Number Prediction",
  description:
    "Predict numbers, win up to 600x. Powered by Chainlink VRF randomness and Privy embedded wallets. No seed phrases, no gas fees.",
  openGraph: {
    title: "Genie Markets",
    description: "Predict numbers, win up to 600x. Onchain prediction markets.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-zinc-950 font-sans text-white">
        <Providers>
          <NavBar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
