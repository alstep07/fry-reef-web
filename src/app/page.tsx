"use client";

import { useAccount } from "wagmi";
import { GameDashboard } from "@/components/features/game/GameDashboard";
import { WalletHeader } from "@/components/features/wallet/WalletHeader";
import { WalletConnectPrompt } from "@/components/features/wallet/WalletConnectPrompt";
import { PageHeader } from "@/components/ui/PageHeader";
import { BubbleAnimation } from "@/components/ui/BubbleAnimation";

export default function Home() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();

  // Show loading state while connecting
  const isLoading = isConnecting || isReconnecting;

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      <BubbleAnimation />
      <main className="relative z-10 container mx-auto flex min-h-screen flex-col px-4 py-6 sm:px-6 sm:py-10 lg:max-w-5xl">
        <PageHeader
          title="FryReef"
          description="Breed, merge, evolve on Base"
          action={<WalletHeader />}
        />
        <section className="flex flex-1 items-start justify-center pt-8 pb-10">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-baseBlue" />
            </div>
          ) : !isConnected ? (
            <WalletConnectPrompt />
          ) : (
            <GameDashboard />
          )}
        </section>
      </main>
    </div>
  );
}
