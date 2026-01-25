"use client";

import { useState, useCallback, useRef } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { base } from "wagmi/chains";
import { useQueryClient } from "@tanstack/react-query";
import type { Abi } from "viem";
import type { TransactionType } from "@/lib/transactionSync";
import { waitForTransactionSync, syncTransactionData } from "@/lib/transactionSync";

const TARGET_CHAIN_ID = base.id;

export type TransactionStatus = "idle" | "pending" | "confirming" | "success" | "error";

export interface TransactionState {
  status: TransactionStatus;
  hash: `0x${string}` | null;
  error: Error | null;
}

export interface UseTransactionOptions {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
  transactionType?: TransactionType;
}

/**
 * Hook for isolated transaction management with Coinbase Wallet support.
 * Ensures reliable state synchronization after transactions.
 */
export function useTransaction(options?: UseTransactionOptions) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

  const [state, setState] = useState<TransactionState>({
    status: "idle",
    hash: null,
    error: null,
  });

  // Store callbacks in refs to avoid stale closures
  const onSuccessRef = useRef(options?.onSuccess);
  const onErrorRef = useRef(options?.onError);
  const transactionTypeRef = useRef(options?.transactionType);
  
  onSuccessRef.current = options?.onSuccess;
  onErrorRef.current = options?.onError;
  transactionTypeRef.current = options?.transactionType;

  const isOnCorrectNetwork = chainId === TARGET_CHAIN_ID;

  const reset = useCallback(() => {
    setState({ status: "idle", hash: null, error: null });
  }, []);

  const switchToTargetNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: TARGET_CHAIN_ID });
      return true;
    } catch (error) {
      console.error("Failed to switch network:", error);
      return false;
    }
  }, [switchChain]);

  /**
   * Execute a contract write transaction with full lifecycle management.
   * Includes special handling for Coinbase Wallet sync delays.
   */
  const execute = useCallback(
    async <TAbi extends Abi>(params: {
      address: `0x${string}`;
      abi: TAbi;
      functionName: string;
      args?: readonly unknown[];
    }): Promise<boolean> => {
      if (!address || !walletClient || !publicClient) {
        const error = new Error("Wallet not connected");
        setState({ status: "error", hash: null, error });
        onErrorRef.current?.(error);
        return false;
      }

      // Check network
      if (!isOnCorrectNetwork) {
        const switched = await switchToTargetNetwork();
        if (!switched) {
          const error = new Error("Please switch to Base network");
          setState({ status: "error", hash: null, error });
          onErrorRef.current?.(error);
          return false;
        }
      }

      try {
        // Reset and start pending
        setState({ status: "pending", hash: null, error: null });

        // Send transaction
        const hash = await walletClient.writeContract({
          ...params,
          chain: base,
          account: address,
        } as Parameters<typeof walletClient.writeContract>[0]);

        setState({ status: "confirming", hash, error: null });

        // Wait for transaction with Coinbase Wallet retry logic
        const receipt = await waitForTransactionSync(hash, publicClient, {
          maxAttempts: 5,
          delayMs: 800,
        });

        if (receipt.status === "success") {
          setState({ status: "success", hash, error: null });
          
          // Sync cache invalidation
          if (transactionTypeRef.current) {
            await syncTransactionData({
              queryClient,
              transactionType: transactionTypeRef.current,
              onDataReady: () => {
                console.log("Transaction data ready to refresh");
              },
            });
          }
          
          // Call user callback
          await onSuccessRef.current?.();
          return true;
        } else {
          const error = new Error("Transaction failed");
          setState({ status: "error", hash, error });
          onErrorRef.current?.(error);
          return false;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Filter out user rejection errors
        const errorMessage = error.message.toLowerCase();
        const isUserRejection =
          errorMessage.includes("user rejected") ||
          errorMessage.includes("user denied") ||
          errorMessage.includes("rejected") ||
          errorMessage.includes("denied") ||
          errorMessage.includes("cancelled");

        if (isUserRejection) {
          // Just reset to idle on user rejection
          setState({ status: "idle", hash: null, error: null });
          return false;
        }

        setState({ status: "error", hash: null, error });
        onErrorRef.current?.(error);
        return false;
      }
    },
    [address, walletClient, publicClient, isOnCorrectNetwork, switchToTargetNetwork, queryClient]
  );

  return {
    // State
    status: state.status,
    hash: state.hash,
    error: state.error,
    
    // Computed
    isIdle: state.status === "idle",
    isPending: state.status === "pending",
    isConfirming: state.status === "confirming",
    isLoading: state.status === "pending" || state.status === "confirming",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    
    // Actions
    execute,
    reset,
    
    // Network
    isOnCorrectNetwork,
    switchToTargetNetwork,
  };
}
