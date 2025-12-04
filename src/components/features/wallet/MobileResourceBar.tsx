"use client";

import { useAccount, useBalance } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useFryReef } from "@/hooks/useFryReef";
import { RESOURCE_CONFIG, Resource } from "@/constants/gameConfig";

export function MobileResourceBar() {
  const { address, isConnected } = useAccount();
  const { pearlShards, spawnDust, starterPackClaimed } = useFryReef();

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const ethBalance = balanceData
    ? (Number(balanceData.value) / 10 ** balanceData.decimals).toFixed(3)
    : "-.--";

  if (!isConnected) return null;

  return (
    <div className="flex sm:hidden items-center justify-center mt-2">
      <div className="inline-flex items-center gap-4 py-2 px-4 rounded-full bg-white/5 backdrop-blur-sm">
        {/* ETH Balance */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⟠</span>
          <span className="font-mono text-sm font-medium text-white tabular-nums">
            {isBalanceLoading ? "-.--" : ethBalance}
          </span>
        </div>

        {/* Resources - only show after starter pack claimed */}
        {starterPackClaimed && (
          <>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{RESOURCE_CONFIG[Resource.PearlShard].icon}</span>
              <span className="font-mono text-sm font-medium text-white tabular-nums">{pearlShards}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{RESOURCE_CONFIG[Resource.SpawnDust].icon}</span>
              <span className="font-mono text-sm font-medium text-white tabular-nums">{spawnDust}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

