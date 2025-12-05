"use client";

import { useAccount } from "wagmi";
import { GameDashboard } from "@/components/features/game/GameDashboard";
import { WalletHeader } from "@/components/features/wallet/WalletHeader";
import { WalletConnectPrompt } from "@/components/features/wallet/WalletConnectPrompt";
import { MobileResourceBar } from "@/components/features/wallet/MobileResourceBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { BubbleAnimation } from "@/components/ui/BubbleAnimation";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="relative flex min-h-dvh flex-col text-slate-100 overflow-hidden">
      <BubbleAnimation />
      <main className="relative z-10 container mx-auto flex flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-6 sm:px-6 sm:pt-10 sm:pb-10 lg:max-w-5xl">
        <PageHeader
          title="FryReef"
          description="Breed, merge, evolve on Base"
          action={<WalletHeader />}
        />
        <MobileResourceBar />
        <section className={`flex flex-1 justify-center pt-6 sm:pt-8 pb-10 ${isConnected ? "items-start" : "items-center"}`}>
          {isConnected ? <GameDashboard /> : <WalletConnectPrompt />}
        </section>
      </main>
      <Footer />
    </div>
  );
}
