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

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://fryreef.vercel.app";

export const metadata: Metadata = {
  title: "FryReef",
  description: "Breed, merge, evolve on Base",
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
