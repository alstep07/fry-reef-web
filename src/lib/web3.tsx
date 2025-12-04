"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { useState, type ReactNode } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_WALLETCONNECT_PROJECT_ID";

export const wagmiConfig = getDefaultConfig({
  appName: "FryReef",
  projectId,
  chains: [base, baseSepolia],
  ssr: true,
});

export function Web3Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={baseSepolia}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
