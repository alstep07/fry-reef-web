"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { fishNftAbi, FISH_NFT_ADDRESS, type FishInfo } from "@/contracts/fishNft";
import { fryReefAbi, FRYREEF_ADDRESS } from "@/contracts/fryReef";

export interface FishWithInfo {
  tokenId: number;
  info: FishInfo;
  pendingDust: number;
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
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // Get total pending spawn dust for user
  const {
    data: totalPendingDust,
    isLoading: isLoadingPendingDust,
    refetch: refetchPendingDust,
  } = useReadContract({
    address: fryReefAddress,
    abi: fryReefAbi,
    functionName: "getPendingSpawnDust",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && !!fryReefAddress,
    },
  });

  // Get info for each fish
  const fishIdsArray = (fishIds as bigint[]) || [];
  
  const fishInfoContracts = fishIdsArray.map((id) => ({
    address: contractAddress!,
    abi: fishNftAbi,
    functionName: "getFishInfo" as const,
    args: [id] as const,
    chainId: baseSepolia.id,
  }));

  const pendingDustContracts = fishIdsArray.map((id) => ({
    address: contractAddress!,
    abi: fishNftAbi,
    functionName: "getPendingDustForFish" as const,
    args: [id] as const,
    chainId: baseSepolia.id,
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

  const {
    data: pendingDustResults,
    isLoading: isLoadingDust,
    refetch: refetchDust,
  } = useReadContracts({
    contracts: pendingDustContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!contractAddress,
    },
  });

  // Combine data
  const fish: FishWithInfo[] = fishIdsArray.map((id, index) => {
    const infoResult = fishInfoResults?.[index];
    const dustResult = pendingDustResults?.[index];

    const info: FishInfo = infoResult?.result
      ? (infoResult.result as FishInfo)
      : { rarity: 0, mintedAt: BigInt(0), lastDustCollectedAt: BigInt(0) };

    const pendingDust = dustResult?.result
      ? Number(dustResult.result as bigint)
      : 0;

    return {
      tokenId: Number(id),
      info,
      pendingDust,
    };
  });

  const refetch = () => {
    refetchIds();
    refetchPendingDust();
    refetchInfo();
    refetchDust();
  };

  return {
    fish,
    fishCount: fishIdsArray.length,
    totalPendingDust: totalPendingDust ? Number(totalPendingDust as bigint) : 0,
    isLoading: isLoadingIds || isLoadingInfo || isLoadingDust || isLoadingPendingDust,
    refetch,
  };
}

