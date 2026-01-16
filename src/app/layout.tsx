import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "@/lib/web3";
import { MiniAppReady } from "@/components/MiniAppReady";

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
  title: "FryReef - Fish NFT Game on Base",
  description: "Collect, breed & merge fish NFTs. Free-to-play game on Base. Earn rewards daily!",
  keywords: ["NFT", "game", "Base", "fish", "breeding", "free-to-play", "web3"],
  openGraph: {
    title: "FryReef - Fish NFT Game",
    description: "Collect, breed & merge fish NFTs on Base. Free-to-play!",
    url: APP_URL,
    siteName: "FryReef",
    images: [
      {
        url: `${APP_URL}/images/common/logo.png`,
        width: 1200,
        height: 630,
        alt: "FryReef Game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FryReef - Fish NFT Game",
    description: "Collect, breed & merge fish NFTs on Base",
    images: [`${APP_URL}/images/common/logo.png`],
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
      imageUrl: `${APP_URL}/images/common/logo.png`,
      button: {
        title: "Play FryReef",
        action: {
          type: "launch_miniapp",
          name: "FryReef",
          url: APP_URL,
          splashImageUrl: `${APP_URL}/images/common/logo.png`,
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
        <MiniAppReady />
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
