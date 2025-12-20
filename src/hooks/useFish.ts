"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { fishNftAbi, FISH_NFT_ADDRESS, type FishInfo } from "@/contracts/fishNft";
import { fryReefAbi, FRYREEF_ADDRESS } from "@/contracts/fryReef";

export interface FishWithInfo {
  tokenId: number;
  info: FishInfo;
  pendingDust: number;
  timeUntilNextEgg: number; // Time in seconds until next egg can be laid
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
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && !!fryReefAddress,
      refetchInterval: 60000, // Refetch every 60 seconds
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

  const timeUntilNextEggContracts = fishIdsArray.map((id) => ({
    address: fryReefAddress!,
    abi: fryReefAbi,
    functionName: "getTimeUntilNextEgg" as const,
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

  // Get pending dust per fish (auto-refresh every 60s)
  const {
    data: pendingDustResults,
    isLoading: isLoadingDust,
    refetch: refetchDust,
  } = useReadContracts({
    contracts: pendingDustContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!contractAddress,
      refetchInterval: 60000, // Refetch every 60 seconds
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
      refetchInterval: 1000, // Refetch every second for live updates
    },
  });

  // Combine data
  const fish: FishWithInfo[] = fishIdsArray.map((id, index) => {
    const infoResult = fishInfoResults?.[index];
    const dustResult = pendingDustResults?.[index];
    const timeResult = timeUntilNextEggResults?.[index];

    // Extract FishInfo from result
    // wagmi returns tuple as an object with named properties matching ABI component names
    let info: FishInfo;
    if (infoResult?.result) {
      const result = infoResult.result as any;
      // Handle both object and array formats
      // TODO: Remove mock data when contract is updated
      const MOCK_MODE = false; // Set to false when contract is updated
      
      if (Array.isArray(result)) {
        // If it's an array, extract by index (order: rarity, mintedAt, lastDustCollectedAt, lastEggLaidAt)
        const contractRarity = Number(result[0] ?? 0);
        // Only use mock if contract rarity is 0 (likely means contract not updated or data missing)
        const rarity = MOCK_MODE && contractRarity === 0 ? ((Number(id) * 17) % 5) : contractRarity;
        
        info = {
          rarity,
          mintedAt: BigInt(result[1] ?? 0),
          lastDustCollectedAt: BigInt(result[2] ?? 0),
          lastEggLaidAt: BigInt(result[3] ?? 0),
        };
      } else {
        // If it's an object, use named properties
        const contractRarity = Number(result.rarity ?? 0);
        // Only use mock if contract rarity is 0 (likely means contract not updated or data missing)
        const rarity = MOCK_MODE && contractRarity === 0 ? ((Number(id) * 17) % 5) : contractRarity;
        
        info = {
          rarity,
          mintedAt: BigInt(result.mintedAt ?? 0),
          lastDustCollectedAt: BigInt(result.lastDustCollectedAt ?? 0),
          lastEggLaidAt: BigInt(result.lastEggLaidAt ?? 0),
        };
      }
    } else {
      // No result data - use default values
      const MOCK_MODE = false;
      const seed = Number(id);
      const mockRarity = (seed * 17) % 5;
      info = { 
        rarity: MOCK_MODE ? mockRarity : 0, 
        mintedAt: BigInt(0), 
        lastDustCollectedAt: BigInt(0), 
        lastEggLaidAt: BigInt(0) 
      };
    }

    const pendingDust = dustResult?.result
      ? Number(dustResult.result as bigint)
      : 0;

    // TODO: Remove this mock data when contract is updated
    // For now, generate random data for UI testing
    const MOCK_MODE = false; // Set to false when contract is updated
    
    let timeUntilNextEgg: number;
    if (MOCK_MODE) {
      // First fish (index 0) is ready to lay egg (timeUntilNextEgg = 0)
      if (index === 0) {
        timeUntilNextEgg = 0;
      } else {
        // Generate random time between 0 and 24 hours (86400 seconds) for other fish
        // Use tokenId as seed for consistent "random" values per fish
        const seed = Number(id);
        const randomValue = (seed * 7919) % 86400; // Use prime number for better distribution
        timeUntilNextEgg = randomValue;
      }
    } else {
      timeUntilNextEgg = timeResult?.result
        ? Number(timeResult.result as bigint)
        : 0;
    }

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

