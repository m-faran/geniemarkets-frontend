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
      <body className="min-h-full flex flex-col bg-zinc-950 font-sans text-white">
        <Providers>
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
