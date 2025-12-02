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

  if (!isConnected || !address) return null;

  if (isLoading) {
    return (
      <span className="text-xs text-slate-400 sm:text-sm">
        Balance: loading…
      </span>
    );
  }

  if (isError || !data) {
    return (
      <span className="text-xs text-slate-400 sm:text-sm">
        Balance: 0.0000 ETH
      </span>
    );
  }

  const formattedBalance = (
    Number(data.value) /
    10 ** data.decimals
  ).toFixed(4);

  return (
    <span className="text-xs text-slate-200 sm:text-sm">
      Balance: {formattedBalance} {data.symbol}
    </span>
  );
}

