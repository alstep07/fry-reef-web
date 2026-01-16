"use client";

import { useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  fryReefAbi,
  FRYREEF_ADDRESS,
  isFryReefConfigured,
  type UserInfo,
} from "@/contracts/fryReef";
import { useTransaction } from "./useTransaction";

const DEFAULT_CHAIN_ID = base.id;

export function useFryReef() {
  const { address, chainId: currentChainId } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isOnCorrectNetwork = (currentChainId || chainId) === base.id;
  const isConfigured = isFryReefConfigured();
  const contractAddress = isConfigured
    ? (FRYREEF_ADDRESS as `0x${string}`)
    : undefined;

  // ============================================================
  // READ CONTRACTS
  // ============================================================

  // Read user info
  const {
    data: userInfo,
    isLoading: isLoadingUserInfo,
    refetch: refetchUserInfo,
  } = useReadContract({
    address: contractAddress,
    abi: fryReefAbi,
    functionName: "getUserInfo",
    args: address ? [address] : undefined,
    chainId: DEFAULT_CHAIN_ID,
    query: {
      enabled: !!address && !!contractAddress && isOnCorrectNetwork,
      refetchInterval: 10000,
    },
  }) as { data: UserInfo | undefined; isLoading: boolean; refetch: () => void };

  // Check if checked in today
  const { data: checkedInTodayData, refetch: refetchCheckedInToday } =
    useReadContract({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "hasCheckedInToday",
      args: address ? [address] : undefined,
      chainId: DEFAULT_CHAIN_ID,
      query: {
        enabled: !!address && !!contractAddress && isOnCorrectNetwork,
      },
    }) as { data: boolean | undefined; refetch: () => void };

  // Check if starter pack claimed
  const { data: starterPackClaimedData, refetch: refetchStarterPack } =
    useReadContract({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "hasClaimedStarterPack",
      args: address ? [address] : undefined,
      chainId: DEFAULT_CHAIN_ID,
      query: {
        enabled: !!address && !!contractAddress && isOnCorrectNetwork,
      },
    }) as { data: boolean | undefined; refetch: () => void };

  // Read reef capacity
  const { data: reefCapacityData, refetch: refetchReefCapacity } =
    useReadContract({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "getReefCapacity",
      args: address ? [address] : undefined,
      chainId: DEFAULT_CHAIN_ID,
      query: {
        enabled: !!address && !!contractAddress && isOnCorrectNetwork,
      },
    }) as { data: bigint | undefined; refetch: () => void };

  // Read expansion cost
  const { data: expansionCostData, refetch: refetchExpansionCost } =
    useReadContract({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "getExpansionCost",
      args: address ? [address] : undefined,
      chainId: DEFAULT_CHAIN_ID,
      query: {
        enabled: !!address && !!contractAddress && isOnCorrectNetwork,
      },
    }) as { data: bigint | undefined; refetch: () => void };

  const checkedInToday = checkedInTodayData ?? false;

  // ============================================================
  // ISOLATED TRANSACTIONS - Each has its own state
  // ============================================================

  // Refetch all data helper
  const refetchAllData = useCallback(() => {
    refetchUserInfo();
    refetchCheckedInToday();
    refetchStarterPack();
    refetchReefCapacity();
    refetchExpansionCost();
  }, [refetchUserInfo, refetchCheckedInToday, refetchStarterPack, refetchReefCapacity, refetchExpansionCost]);

  // Starter pack transaction
  const starterPackTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // Check-in transaction
  const checkInTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // Collect spawn dust transaction
  const collectDustTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // Start incubation transaction
  const incubationTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // Hatch egg transaction
  const hatchTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // Lay egg transaction
  const layEggTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // Merge fish transaction
  const mergeTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // Expand reef transaction
  const expandTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // Burn fish transaction
  const burnTx = useTransaction({
    onSuccess: refetchAllData,
  });

  // ============================================================
  // TRANSACTION METHODS
  // ============================================================

  const claimStarterPack = useCallback(async (): Promise<boolean> => {
    if (!contractAddress) return false;
    return starterPackTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "claimStarterPack",
    });
  }, [contractAddress, starterPackTx]);

  const checkIn = useCallback(async (): Promise<boolean> => {
    if (!contractAddress) return false;
    return checkInTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "checkIn",
    });
  }, [contractAddress, checkInTx]);

  const collectSpawnDust = useCallback(async (): Promise<boolean> => {
    if (!contractAddress) return false;
    return collectDustTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "collectSpawnDust",
    });
  }, [contractAddress, collectDustTx]);

  const startIncubation = useCallback(async (eggId: number): Promise<boolean> => {
    if (!contractAddress) return false;
    return incubationTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "startIncubation",
      args: [BigInt(eggId)],
    });
  }, [contractAddress, incubationTx]);

  const hatchEgg = useCallback(async (eggId: number): Promise<boolean> => {
    if (!contractAddress) return false;
    return hatchTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "hatchEgg",
      args: [BigInt(eggId)],
    });
  }, [contractAddress, hatchTx]);

  const layEgg = useCallback(async (fishId: number): Promise<boolean> => {
    if (!contractAddress) return false;
    return layEggTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "layEgg",
      args: [BigInt(fishId)],
    });
  }, [contractAddress, layEggTx]);

  const mergeFish = useCallback(async (fishId1: number, fishId2: number): Promise<boolean> => {
    if (!contractAddress) return false;
    return mergeTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "mergeFish",
      args: [BigInt(fishId1), BigInt(fishId2)],
    });
  }, [contractAddress, mergeTx]);

  const expandReef = useCallback(async (): Promise<boolean> => {
    if (!contractAddress) return false;
    return expandTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "expandReef",
      args: [],
    });
  }, [contractAddress, expandTx]);

  const burnFish = useCallback(async (fishIds: number[]): Promise<boolean> => {
    if (!contractAddress || fishIds.length === 0) return false;
    return burnTx.execute({
      address: contractAddress,
      abi: fryReefAbi,
      functionName: "burnFish",
      args: [fishIds.map((id) => BigInt(id))],
    });
  }, [contractAddress, burnTx]);

  // Switch network helper
  const switchToBase = useCallback(async () => {
    try {
      await switchChain({ chainId: base.id });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  }, [switchChain]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // User info
    userInfo,
    pearlShards: userInfo?.pearlShards ? Number(userInfo.pearlShards) : 0,
    spawnDust: userInfo?.spawnDust ? Number(userInfo.spawnDust) : 0,
    currentStreak: userInfo?.currentStreak ? Number(userInfo.currentStreak) : 0,
    totalCheckIns: userInfo?.totalCheckIns ? Number(userInfo.totalCheckIns) : 0,

    // Starter pack
    starterPackClaimed: starterPackClaimedData,
    claimStarterPack,
    starterPackTx,

    // Check-in
    checkedInToday,
    checkIn,
    checkInTx,

    // Spawn dust
    collectSpawnDust,
    collectDustTx,

    // Incubation
    startIncubation,
    incubationTx,
    hatchEgg,
    hatchTx,
    layEgg,
    layEggTx,
    mergeFish,
    mergeTx,
    burnFish,
    burnTx,

    // Reef expansion
    reefCapacity: reefCapacityData ? Number(reefCapacityData) : 3,
    expansionCost: expansionCostData ? Number(expansionCostData) : null,
    expandReef,
    expandTx,
    refetchReefCapacity,

    // Refetch
    refetchUserInfo,
    refetchAllData,

    // Status (aggregated - any transaction loading)
    isLoading: isLoadingUserInfo,
    isAnyTxLoading:
      starterPackTx.isLoading ||
      checkInTx.isLoading ||
      collectDustTx.isLoading ||
      incubationTx.isLoading ||
      hatchTx.isLoading ||
      layEggTx.isLoading ||
      mergeTx.isLoading ||
      expandTx.isLoading ||
      burnTx.isLoading,

    // Network
    isOnCorrectNetwork,
    switchToBase,
    isConfigured,
  };
}
