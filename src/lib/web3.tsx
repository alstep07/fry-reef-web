"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { useState, type ReactNode } from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { wagmiConfig } from "./config";

type Props = {
  children: ReactNode;
  initialState?: State;
};

export function Web3Providers({ children, initialState }: Props) {
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
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" initialChain={baseSepolia}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
