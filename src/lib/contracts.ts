/**
 * Contract utilities and helpers
 * @fileoverview Shared utilities for working with smart contracts
 */

import { base } from "wagmi/chains";

/**
 * Supported chains for contracts
 */
export const CONTRACT_CHAINS = {
  base,
} as const;

/**
 * Default chain ID for contracts
 */
export const DEFAULT_CHAIN_ID = base.id;

/**
 * Get contract address for a given contract name
 * @param contractName - Name of the contract
 * @returns Contract address or undefined if not configured
 */
export function getContractAddress(
  contractName: string
): `0x${string}` | undefined {
  const envKey = `NEXT_PUBLIC_${contractName.toUpperCase()}_CONTRACT_ADDRESS`;
  const address = process.env[envKey] as `0x${string}` | undefined;

  if (!address || !address.startsWith("0x")) {
    return undefined;
  }

  return address;
}
