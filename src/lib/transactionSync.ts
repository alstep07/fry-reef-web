/**
 * Transaction Synchronization Manager
 * Handles reliable cache invalidation and state updates after contract transactions
 * 
 * Special handling for Coinbase Wallet and Base Mini App
 */

import { QueryClient } from "@tanstack/react-query";

export type TransactionType = 
  | "lay_egg"
  | "hatch_egg"
  | "start_incubation"
  | "collect_dust"
  | "check_in"
  | "merge_fish"
  | "burn_fish"
  | "expand_reef"
  | "claim_starter_pack";

interface SyncConfig {
  queryClient: QueryClient;
  transactionType: TransactionType;
  onDataReady?: () => void;
}

/**
 * Wait for transaction to be fully synced across RPC nodes
 * Coinbase Wallet can be delayed, so we use multiple confirmation attempts
 */
export async function waitForTransactionSync(
  hash: `0x${string}`,
  publicClient: any,
  options?: { maxAttempts?: number; delayMs?: number }
) {
  const maxAttempts = options?.maxAttempts ?? 5;
  const delayMs = options?.delayMs ?? 1000;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash });
      if (receipt) {
        // Extra delay for Coinbase Wallet to sync state
        await new Promise(resolve => setTimeout(resolve, 500));
        return receipt;
      }
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError || new Error("Failed to sync transaction");
}

/**
 * Invalidate specific query keys based on transaction type
 */
export function invalidateQueriesByType(
  queryClient: QueryClient,
  transactionType: TransactionType
) {
  const queryKeysToInvalidate: (string | string[])[] = [];
  
  // All fish/egg operations need these
  const commonKeys = [
    ["readContract", "getFishByOwner"],
    ["readContract", "getEggInfo"],
    ["readContract", "balanceOf"],
    ["readContract", "getUserInfo"],
  ];
  
  switch (transactionType) {
    case "lay_egg":
    case "hatch_egg":
    case "start_incubation":
      queryKeysToInvalidate.push(
        ...commonKeys,
        ["readContract", "getEggInfo"],
        ["readContract", "getTimeUntilHatch"],
        ["readContract", "canHatch"],
        ["readContract", "tokenOfOwnerByIndex"]
      );
      break;
      
    case "collect_dust":
    case "merge_fish":
    case "burn_fish":
      queryKeysToInvalidate.push(
        ...commonKeys,
        ["readContract", "getPendingDustForFish"],
        ["readContract", "getPendingSpawnDust"],
        ["readContract", "getTimeUntilNextEgg"]
      );
      break;
      
    case "check_in":
    case "claim_starter_pack":
      queryKeysToInvalidate.push(
        ["readContract", "getUserInfo"],
        ["readContract", "hasCheckedInToday"],
        ["readContract", "hasClaimedStarterPack"]
      );
      break;
      
    case "expand_reef":
      queryKeysToInvalidate.push(
        ["readContract", "getReefCapacity"],
        ["readContract", "getExpansionCost"],
        ["readContract", "getUserInfo"]
      );
      break;
  }
  
  // Invalidate all related queries
  queryKeysToInvalidate.forEach(key => {
    queryClient.invalidateQueries({
      queryKey: Array.isArray(key) ? key : [key],
      exact: false,
    });
  });
  
  // Dispatch events for hooks that listen
  window.dispatchEvent(new CustomEvent("transaction:success", { 
    detail: { type: transactionType } 
  }));
}

/**
 * Main sync function - call after transaction is confirmed
 */
export async function syncTransactionData(config: SyncConfig) {
  const { queryClient, transactionType, onDataReady } = config;
  
  try {
    // Invalidate queries
    invalidateQueriesByType(queryClient, transactionType);
    
    // Wait a bit for refetch to start
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Notify that data should be ready soon
    onDataReady?.();
  } catch (err) {
    console.error("Failed to sync transaction data:", err);
  }
}
