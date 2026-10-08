import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";

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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Genie Markets Protocol",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genie Markets — Onchain Prediction Protocol",
    description: "Predict numbers, win up to 600x. Onchain prediction markets powered by Chainlink VRF.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/genie-lamp-artwork-LOGO.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground selection:bg-slate-700 selection:text-white relative">
        <Providers>
          <NavBar />
          <main className="flex-1 relative z-0">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
