"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { eggNftAbi, EGG_NFT_ADDRESS, type EggInfo } from "@/contracts/eggNft";

const DEFAULT_CHAIN_ID = base.id;

export interface EggWithInfo {
  tokenId: number;
  info: EggInfo;
  canHatch: boolean;
  timeUntilHatch: number;
  isInfoLoaded: boolean;
}

export function useEggs() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  // Track when each egg started loading
  const eggLoadingStartRef = useRef<Map<number, number>>(new Map());
  const LOADING_TIMEOUT = 8000; // 8 seconds - if egg doesn't load, show it anyway

  const contractAddress = EGG_NFT_ADDRESS
    ? (EGG_NFT_ADDRESS as `0x${string}`)
    : undefined;

  // Get egg balance (auto-refresh every 30s as fallback)
  const { data: balance, refetch: refetchBalance, isFetched: isBalanceFetched } = useReadContract({
    address: contractAddress,
    abi: eggNftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: DEFAULT_CHAIN_ID,
    query: {
      enabled: !!address && !!contractAddress,
      refetchInterval: 30000, // Fallback - explicit refetch after transactions is primary
      placeholderData: keepPreviousData,
    },
  });

  const eggCount = balance ? Number(balance) : 0;

  // Get token IDs for each egg
  const tokenIdContracts = Array.from({ length: eggCount }, (_, i) => ({
    address: contractAddress,
    abi: eggNftAbi,
    functionName: "tokenOfOwnerByIndex" as const,
    args: [address, BigInt(i)] as const,
    chainId: DEFAULT_CHAIN_ID,
  }));

  const { data: tokenIdsData, isFetched: isTokenIdsFetched, refetch: refetchTokenIds } = useReadContracts({
    contracts: tokenIdContracts,
    query: {
      enabled: eggCount > 0 && !!address,
      refetchInterval: 30000, // Fallback
      placeholderData: keepPreviousData,
    },
  });

  const tokenIds = tokenIdsData
    ?.map((result) => (result.status === "success" ? Number(result.result) : null))
    .filter((id): id is number => id !== null) || [];

  // Get egg info for each token (basic static info - no polling)
  const eggInfoContracts = tokenIds.flatMap((tokenId) => [
    {
      address: contractAddress,
      abi: eggNftAbi,
      functionName: "getEggInfo" as const,
      args: [BigInt(tokenId)] as const,
      chainId: DEFAULT_CHAIN_ID,
    },
    {
      address: contractAddress,
      abi: eggNftAbi,
      functionName: "canHatch" as const,
      args: [BigInt(tokenId)] as const,
      chainId: DEFAULT_CHAIN_ID,
    },
  ]);

  const { data: eggInfoData, refetch: refetchEggInfo, isFetched: isEggInfoFetched, status: eggInfoStatus } = useReadContracts({
    contracts: eggInfoContracts,
    query: {
      enabled: tokenIds.length > 0,
      placeholderData: keepPreviousData,
    },
  });

  // Get time until hatch for each token (only needs polling for timer)
  const timeUntilHatchContracts = tokenIds.map((tokenId) => ({
    address: contractAddress,
    abi: eggNftAbi,
    functionName: "getTimeUntilHatch" as const,
    args: [BigInt(tokenId)] as const,
    chainId: DEFAULT_CHAIN_ID,
  }));

  const { data: timeUntilHatchData, refetch: refetchTimeUntilHatch } = useReadContracts({
    contracts: timeUntilHatchContracts,
    query: {
      enabled: tokenIds.length > 0,
      refetchInterval: 10000, // Only for timer - 10 seconds
      placeholderData: keepPreviousData,
    },
  });

  // Parse egg data
  const eggs: EggWithInfo[] = tokenIds.map((tokenId, index) => {
    // eggInfoData has 2 items per egg: [info, canHatch, info, canHatch, ...]
    const infoResult = eggInfoData?.[index * 2];
    const canHatchResult = eggInfoData?.[index * 2 + 1];
    const timeResult = timeUntilHatchData?.[index];

    const now = Date.now();
    
    // Track when this egg started loading
    if (!eggLoadingStartRef.current.has(tokenId)) {
      eggLoadingStartRef.current.set(tokenId, now);
    }
    const loadingStartTime = eggLoadingStartRef.current.get(tokenId) || now;
    const hasBeenLoadingTooLong = now - loadingStartTime > LOADING_TIMEOUT;

    // Check if we have valid info result
    const hasValidInfo = infoResult?.status === "success" && infoResult?.result !== undefined;
    const isInfoLoaded = hasValidInfo || hasBeenLoadingTooLong;

    // Parse EggInfo - wagmi may return as array tuple or object
    let info: EggInfo;
    if (hasValidInfo && infoResult?.result) {
      const result = infoResult.result;
      
      // Check for readonly array (wagmi returns readonly tuples)
      if (Array.isArray(result) || (typeof result === 'object' && '0' in result)) {
        // Tuple/array format: [mintedAt, incubationStartedAt, isIncubating]
        const arr = result as readonly [bigint, bigint, boolean];
        info = {
          mintedAt: BigInt(arr[0] ?? 0),
          incubationStartedAt: BigInt(arr[1] ?? 0),
          isIncubating: Boolean(arr[2]),
        };
      } else {
        // Object format
        const obj = result as { mintedAt?: bigint; incubationStartedAt?: bigint; isIncubating?: boolean };
        info = {
          mintedAt: BigInt(obj.mintedAt ?? 0),
          incubationStartedAt: BigInt(obj.incubationStartedAt ?? 0),
          isIncubating: Boolean(obj.isIncubating),
        };
      }
    } else {
      info = { mintedAt: BigInt(0), incubationStartedAt: BigInt(0), isIncubating: false };
    }

    return {
      tokenId,
      info,
      canHatch: canHatchResult?.status === "success" ? Boolean(canHatchResult.result) : false,
      timeUntilHatch: (timeResult?.status === "success" && timeResult?.result !== undefined) 
        ? Number(timeResult.result) 
        : 0,
      isInfoLoaded,
    };
  });

  const refetch = () => {
    refetchBalance();
    refetchTokenIds();
    refetchEggInfo();
    refetchTimeUntilHatch();
  };

  // Listen for invalidation signals from transactions
  useEffect(() => {
    const handleInvalidation = () => {
      queryClient.invalidateQueries({
        queryKey: ["readContract"],
        exact: false,
      });
      // Reset loading timers
      eggLoadingStartRef.current.clear();
      // Force immediate refetch of critical data
      refetchEggInfo();
      refetchTimeUntilHatch();
    };

    const handleTransactionSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const type = customEvent.detail?.type;
      
      // Re-fetch if transaction affected eggs
      if (["lay_egg", "hatch_egg", "start_incubation"].includes(type)) {
        handleInvalidation();
      }
    };

    window.addEventListener("eggs:invalidate", handleInvalidation);
    window.addEventListener("transaction:success", handleTransactionSuccess);
    
    return () => {
      window.removeEventListener("eggs:invalidate", handleInvalidation);
      window.removeEventListener("transaction:success", handleTransactionSuccess);
    };
  }, [queryClient, refetchEggInfo, refetchTimeUntilHatch]);

  // Clean up old egg loading timers
  useEffect(() => {
    const currentEggIds = new Set(tokenIds);
    const timerKeys = Array.from(eggLoadingStartRef.current.keys());
    
    timerKeys.forEach(key => {
      if (!currentEggIds.has(key)) {
        eggLoadingStartRef.current.delete(key);
      }
    });
  }, [tokenIds]);

  // Reset loading timers when wallet address changes
  useEffect(() => {
    eggLoadingStartRef.current.clear();
  }, [address]);

  // Aggressively refetch on component mount and when address changes for instant data
  useEffect(() => {
    if (!address) return;
    
    const timer = setTimeout(() => {
      refetchBalance();
      refetchTokenIds();
      refetchEggInfo();
      refetchTimeUntilHatch();
    }, 50);  // Faster - 50ms instead of 100ms
    
    return () => clearTimeout(timer);
  }, [address, refetchBalance, refetchTokenIds, refetchEggInfo, refetchTimeUntilHatch]);

  // Loading only on initial fetch (not during refetch with keepPreviousData)
  const isLoading = !isBalanceFetched || 
    (eggCount > 0 && !isTokenIdsFetched) ||
    (tokenIds.length > 0 && !isEggInfoFetched);

  return {
    eggs,
    eggCount,
    refetch,
    isLoading,
    // Export individual refetch functions for transaction sync
    refetchEggInfo,
    refetchTimeUntilHatch,
  };
}

