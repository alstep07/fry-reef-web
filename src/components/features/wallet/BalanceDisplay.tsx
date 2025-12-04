"use client";

import { useAccount, useBalance } from "wagmi";
import { base } from "wagmi/chains";

export function BalanceDisplay() {
  const { address, isConnected } = useAccount();
  const { data, isLoading, isError } = useBalance({
    address,
    chainId: base.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  if (!isConnected || !address || isLoading) return null;

  if (isError || !data) {
    return (
      <span className="font-mono text-xs text-slate-400">
        0.000 ETH
      </span>
    );
  }

  const formattedBalance = (
    Number(data.value) /
    10 ** data.decimals
  ).toFixed(3);

  return (
    <span className="font-mono text-xs text-slate-200">
      {formattedBalance} {data.symbol}
    </span>
  );
}

