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

  // Get egg balance (auto-refresh every 15s)
  const { data: balance, refetch: refetchBalance, isFetched: isBalanceFetched } = useReadContract({
    address: contractAddress,
    abi: eggNftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: DEFAULT_CHAIN_ID,
    query: {
      enabled: !!address && !!contractAddress,
      refetchInterval: 15000, // Check for new/hatched eggs
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
      refetchInterval: 15000, // Check for token ID changes
      placeholderData: keepPreviousData,
    },
  });

  const tokenIds = tokenIdsData
    ?.map((result) => (result.status === "success" ? Number(result.result) : null))
    .filter((id): id is number => id !== null) || [];

  // Get egg info for each token
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
    {
      address: contractAddress,
      abi: eggNftAbi,
      functionName: "getTimeUntilHatch" as const,
      args: [BigInt(tokenId)] as const,
      chainId: DEFAULT_CHAIN_ID,
    },
  ]);

  const { data: eggInfoData, refetch: refetchEggInfo, isFetched: isEggInfoFetched, status: eggInfoStatus } = useReadContracts({
    contracts: eggInfoContracts,
    query: {
      enabled: tokenIds.length > 0,
      refetchInterval: 10000, // Auto-refresh egg state every 10 seconds
      placeholderData: keepPreviousData,
    },
  });

  // Parse egg data
  const eggs: EggWithInfo[] = tokenIds.map((tokenId, index) => {
    const baseIndex = index * 3;
    const infoResult = eggInfoData?.[baseIndex];
    const canHatchResult = eggInfoData?.[baseIndex + 1];
    const timeResult = eggInfoData?.[baseIndex + 2];

    const now = Date.now();
    
    // Track when this egg started loading
    if (!eggLoadingStartRef.current.has(tokenId)) {
      eggLoadingStartRef.current.set(tokenId, now);
    }
    const loadingStartTime = eggLoadingStartRef.current.get(tokenId) || now;
    const hasBeenLoadingTooLong = now - loadingStartTime > LOADING_TIMEOUT;

    const isInfoLoaded = (infoResult?.status === "success" && infoResult?.result !== undefined) || hasBeenLoadingTooLong;

    // Parse EggInfo - wagmi may return as array tuple or object
    let info: EggInfo;
    if (infoResult?.status === "success" && infoResult?.result) {
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
      timeUntilHatch: timeResult?.status === "success" ? Number(timeResult.result) : 0,
      isInfoLoaded,
    };
  });

  const refetch = () => {
    refetchBalance();
    refetchTokenIds();
    refetchEggInfo();
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
    };

    window.addEventListener("eggs:invalidate", handleInvalidation);
    return () => window.removeEventListener("eggs:invalidate", handleInvalidation);
  }, [queryClient]);

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

  // Loading only on initial fetch (not during refetch with keepPreviousData)
  const isLoading = !isBalanceFetched || 
    (eggCount > 0 && !isTokenIdsFetched) ||
    (tokenIds.length > 0 && !isEggInfoFetched);

  return {
    eggs,
    eggCount,
    refetch,
    isLoading,
  };
}

