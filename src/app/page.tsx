"use client";

import { useAccount } from "wagmi";
import { CheckInCard } from "@/components/features/checkin/CheckInCard";
import { WalletHeader } from "@/components/features/wallet/WalletHeader";
import { WalletConnectPrompt } from "@/components/features/wallet/WalletConnectPrompt";
import { PageHeader } from "@/components/ui/PageHeader";
import { BubbleAnimation } from "@/components/ui/BubbleAnimation";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      <BubbleAnimation />
      <main className="relative z-10 container mx-auto flex min-h-screen flex-col px-4 py-6 sm:px-6 sm:py-10 lg:max-w-5xl">
        <PageHeader
          title="FryReef"
          description="Breed, merge, evolve on Base"
          action={<WalletHeader />}
        />
        <section className="flex flex-1 items-center justify-center pb-10">
          {!isConnected ? (
            <WalletConnectPrompt />
          ) : (
            <CheckInCard />
          )}
        </section>
      </main>
    </div>
  );
}
