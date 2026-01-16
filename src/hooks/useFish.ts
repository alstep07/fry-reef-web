"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { fishNftAbi, FISH_NFT_ADDRESS, type FishInfo } from "@/contracts/fishNft";
import { fryReefAbi, FRYREEF_ADDRESS } from "@/contracts/fryReef";

export interface FishWithInfo {
  tokenId: number;
  info: FishInfo;
  pendingDust: number;
  timeUntilNextEgg: number;
}

export function useFish() {
  const { address } = useAccount();

  const contractAddress = FISH_NFT_ADDRESS
    ? (FISH_NFT_ADDRESS as `0x${string}`)
    : undefined;

  const fryReefAddress = FRYREEF_ADDRESS
    ? (FRYREEF_ADDRESS as `0x${string}`)
    : undefined;

  // Get fish IDs owned by user
  const {
    data: fishIds,
    isLoading: isLoadingIds,
    refetch: refetchIds,
  } = useReadContract({
    address: contractAddress,
    abi: fishNftAbi,
    functionName: "getFishByOwner",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // Get total pending spawn dust for user (auto-refresh every 60s)
  const {
    data: totalPendingDust,
    isLoading: isLoadingPendingDust,
    refetch: refetchPendingDust,
  } = useReadContract({
    address: fryReefAddress,
    abi: fryReefAbi,
    functionName: "getPendingSpawnDust",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!fryReefAddress,
      refetchInterval: 60000,
    },
  });

  // Get info for each fish
  const fishIdsArray = (fishIds as bigint[]) || [];

  const fishInfoContracts = fishIdsArray.map((id) => ({
    address: contractAddress!,
    abi: fishNftAbi,
    functionName: "getFishInfo" as const,
    args: [id] as const,
    chainId: base.id,
  }));

  const pendingDustContracts = fishIdsArray.map((id) => ({
    address: contractAddress!,
    abi: fishNftAbi,
    functionName: "getPendingDustForFish" as const,
    args: [id] as const,
    chainId: base.id,
  }));

  const timeUntilNextEggContracts = fishIdsArray.map((id) => ({
    address: fryReefAddress!,
    abi: fryReefAbi,
    functionName: "getTimeUntilNextEgg" as const,
    args: [id] as const,
    chainId: base.id,
  }));

  const {
    data: fishInfoResults,
    isLoading: isLoadingInfo,
    refetch: refetchInfo,
  } = useReadContracts({
    contracts: fishInfoContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!contractAddress,
    },
  });

  // Get pending dust per fish (auto-refresh every 60s)
  const {
    data: pendingDustResults,
    isLoading: isLoadingDust,
    refetch: refetchDust,
  } = useReadContracts({
    contracts: pendingDustContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!contractAddress,
      refetchInterval: 60000,
    },
  });

  // Get time until next egg per fish (auto-refresh every second for live updates)
  const {
    data: timeUntilNextEggResults,
    isLoading: isLoadingTime,
    refetch: refetchTime,
  } = useReadContracts({
    contracts: timeUntilNextEggContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!fryReefAddress,
      refetchInterval: 1000,
    },
  });

  // Combine data
  const fish: FishWithInfo[] = fishIdsArray.map((id, index) => {
    const infoResult = fishInfoResults?.[index];
    const dustResult = pendingDustResults?.[index];
    const timeResult = timeUntilNextEggResults?.[index];

    // Extract FishInfo from result
    let info: FishInfo;
    if (infoResult?.result) {
      const result = infoResult.result as {
        rarity?: number;
        mintedAt?: bigint;
        lastDustCollectedAt?: bigint;
        lastEggLaidAt?: bigint;
      } | [number, bigint, bigint, bigint];

      if (Array.isArray(result)) {
        // Tuple format: [rarity, mintedAt, lastDustCollectedAt, lastEggLaidAt]
        info = {
          rarity: Number(result[0] ?? 0),
          mintedAt: BigInt(result[1] ?? 0),
          lastDustCollectedAt: BigInt(result[2] ?? 0),
          lastEggLaidAt: BigInt(result[3] ?? 0),
        };
      } else {
        // Object format
        info = {
          rarity: Number(result.rarity ?? 0),
          mintedAt: BigInt(result.mintedAt ?? 0),
          lastDustCollectedAt: BigInt(result.lastDustCollectedAt ?? 0),
          lastEggLaidAt: BigInt(result.lastEggLaidAt ?? 0),
        };
      }
    } else {
      info = {
        rarity: 0,
        mintedAt: BigInt(0),
        lastDustCollectedAt: BigInt(0),
        lastEggLaidAt: BigInt(0),
      };
    }

    const pendingDust = dustResult?.result
      ? Number(dustResult.result as bigint)
      : 0;

    const timeUntilNextEgg = timeResult?.result
      ? Number(timeResult.result as bigint)
      : 0;

    return {
      tokenId: Number(id),
      info,
      pendingDust,
      timeUntilNextEgg,
    };
  });

  const refetch = () => {
    refetchIds();
    refetchPendingDust();
    refetchInfo();
    refetchDust();
    refetchTime();
  };

  return {
    fish,
    fishCount: fishIdsArray.length,
    totalPendingDust: totalPendingDust ? Number(totalPendingDust as bigint) : 0,
    isLoading: isLoadingIds || isLoadingInfo || isLoadingDust || isLoadingPendingDust || isLoadingTime,
    refetch,
  };
}
