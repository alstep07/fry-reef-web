import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "@/lib/web3";
import { MiniAppReady } from "@/components/MiniAppReady";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = "https://fry-reef.vercel.app";

export const metadata: Metadata = {
  title: "FryReef",
  description: "Collect, breed & merge fish NFTs. Hatch eggs, evolve rare species, earn daily rewards. No crypto needed to start!",
  keywords: ["NFT", "game", "Base", "fish", "breeding", "merge", "evolve", "onchain", "free-to-play", "web3"],
  openGraph: {
    title: "FryReef",
    description: "Build your underwater reef by breeding and evolving fish NFTs",
    url: APP_URL,
    siteName: "FryReef",
    images: [
      {
        url: `${APP_URL}/images/screenshots/hero_image.png`,
        width: 1200,
        height: 630,
        alt: "FryReef",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FryReef",
    description: "Build your underwater reef by breeding and evolving fish NFTs",
    images: [`${APP_URL}/images/screenshots/hero_image.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FryReef",
  },
  icons: {
    apple: [
      {
        url: "/images/apple-touch-icon.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  },
  other: {
    "base:app_id": "696a34857383fd216ccd736b",
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/images/screenshots/hero_image.png`,
      button: {
        title: "Play FryReef",
        action: {
          type: "launch_miniapp",
          name: "FryReef",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/images/apple-touch-icon.png`,
          splashBackgroundColor: "#0a1628",
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeInitializer />
        <MiniAppReady />
        <MiniKitProvider>
          <Web3Providers>{children}</Web3Providers>
        </MiniKitProvider>
      </body>
    </html>
  );
}
