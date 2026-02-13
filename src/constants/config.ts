/**
 * Application configuration constants
 * @fileoverview Centralized configuration for the application
 */

/**
 * Supported networks
 */
export const SUPPORTED_NETWORKS = {
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
  },
} as const;

/**
 * Default network for contracts
 */
export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.base;

/**
 * Environment variable keys
 */
export const ENV_KEYS = {
  WALLETCONNECT_PROJECT_ID: "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
  CHECK_IN_CONTRACT_ADDRESS: "NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS",
  /** Base Builder Code from base.dev → Settings → Builder Code */
  BUILDER_CODE: "NEXT_PUBLIC_BUILDER_CODE",
} as const;

