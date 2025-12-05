"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { useMemo, useState, type ReactNode } from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, createStorage, http, fallback } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_WALLETCONNECT_PROJECT_ID";

type Props = {
  children: ReactNode;
};

// Create connectors once outside component to keep stable reference
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rainbowWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: "FryReef",
    projectId,
  }
);

// Base Sepolia RPC endpoints with fallback
// Use environment variable if available, otherwise use public RPCs
const baseSepoliaRpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;
const baseSepoliaRpcUrls = baseSepoliaRpcUrl
  ? [baseSepoliaRpcUrl]
  : [
      "https://base-sepolia-rpc.publicnode.com", // PublicNode (CORS-friendly)
      "https://sepolia.base.org", // Official Base RPC
    ];

// Create config once outside component
const wagmiConfig = createConfig({
  connectors,
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: baseSepoliaRpcUrls.length === 1
      ? http(baseSepoliaRpcUrls[0])
      : fallback(
          baseSepoliaRpcUrls.map((url) => http(url)),
          { rank: false }
        ),
  },
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
});

export function Web3Providers({ children }: Props) {
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
    <WagmiProvider config={wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" initialChain={baseSepolia}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
