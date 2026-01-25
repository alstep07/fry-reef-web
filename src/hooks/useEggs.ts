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
  const eggLoadingStartRef = useRef<Map<number, number>>(new Map());
  const LOADING_TIMEOUT = 8000;

  const contractAddress = EGG_NFT_ADDRESS
    ? (EGG_NFT_ADDRESS as `0x${string}`)
    : undefined;

  // Get egg balance
  const { data: balance, isFetched: isBalanceFetched } = useReadContract({
    address: contractAddress,
    abi: eggNftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: DEFAULT_CHAIN_ID,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  const eggCount = balance ? Number(balance) : 0;

  // Get all token IDs
  const tokenIdContracts = Array.from({ length: eggCount }, (_, i) => ({
    address: contractAddress,
    abi: eggNftAbi,
    functionName: "tokenOfOwnerByIndex" as const,
    args: [address, BigInt(i)] as const,
    chainId: DEFAULT_CHAIN_ID,
  }));

  const { data: tokenIdsData, isFetched: isTokenIdsFetched } = useReadContracts({
    contracts: tokenIdContracts,
    query: {
      enabled: eggCount > 0 && !!address,
    },
  });

  const tokenIds = tokenIdsData
    ?.map((result) => (result.status === "success" ? Number(result.result) : null))
    .filter((id): id is number => id !== null) || [];

  // Get ALL egg data in ONE request with polling
  const eggDataContracts = tokenIds.flatMap((tokenId) => [
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

  const { data: eggDataResults, isFetched: isEggDataFetched } = useReadContracts({
    contracts: eggDataContracts,
    query: {
      enabled: tokenIds.length > 0,
      refetchInterval: 5000, // Poll all data every 5 seconds
      staleTime: 4000,
      placeholderData: keepPreviousData,
    },
  });

  // Parse egg data
  const eggs: EggWithInfo[] = tokenIds.map((tokenId, index) => {
    const baseIdx = index * 3;
    const infoResult = eggDataResults?.[baseIdx];
    const canHatchResult = eggDataResults?.[baseIdx + 1];
    const timeResult = eggDataResults?.[baseIdx + 2];

    const now = Date.now();
    if (!eggLoadingStartRef.current.has(tokenId)) {
      eggLoadingStartRef.current.set(tokenId, now);
    }
    const loadingStartTime = eggLoadingStartRef.current.get(tokenId) || now;
    const hasBeenLoadingTooLong = now - loadingStartTime > LOADING_TIMEOUT;

    const hasValidInfo = infoResult?.status === "success" && infoResult?.result !== undefined;
    const isInfoLoaded = hasValidInfo || hasBeenLoadingTooLong;

    let info: EggInfo;
    if (hasValidInfo && infoResult?.result) {
      const result = infoResult.result;
      if (Array.isArray(result) || (typeof result === 'object' && '0' in result)) {
        const arr = result as readonly [bigint, bigint, boolean];
        info = {
          mintedAt: BigInt(arr[0] ?? 0),
          incubationStartedAt: BigInt(arr[1] ?? 0),
          isIncubating: Boolean(arr[2]),
        };
      } else {
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
      timeUntilHatch: timeResult?.status === "success" ? Number(timeResult.result ?? 0) : 0,
      isInfoLoaded,
    };
  });

  const refetch = () => {
    // Handled by wagmi automatically
  };

  // Listen for transaction success events
  useEffect(() => {
    const handleTransactionSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const type = customEvent.detail?.type;
      
      if (["lay_egg", "hatch_egg", "start_incubation"].includes(type)) {
        queryClient.invalidateQueries({
          queryKey: ["readContract"],
          exact: false,
        });
        eggLoadingStartRef.current.clear();
      }
    };

    window.addEventListener("transaction:success", handleTransactionSuccess);
    return () => window.removeEventListener("transaction:success", handleTransactionSuccess);
  }, [queryClient]);

  useEffect(() => {
    eggLoadingStartRef.current.clear();
  }, [address]);

  return {
    eggs,
    eggCount,
    refetch,
    isLoading: !isBalanceFetched || (eggCount > 0 && !isTokenIdsFetched) || (tokenIds.length > 0 && !isEggDataFetched),
    refetchEggInfo: refetch,
    refetchTimeUntilHatch: refetch,
  };
}
