"use client";

import { useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import {
  fryReefAbi,
  FRYREEF_ADDRESS,
  isFryReefConfigured,
  type UserInfo,
} from "@/contracts/fryReef";

const DEFAULT_CHAIN_ID = baseSepolia.id;

export function useFryReef() {
  const { address, chainId: currentChainId } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isOnCorrectNetwork = (currentChainId || chainId) === baseSepolia.id;
  const isConfigured = isFryReefConfigured();
  const contractAddress = isConfigured
    ? (FRYREEF_ADDRESS as `0x${string}`)
    : undefined;

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
      refetchInterval: 10000, // Refetch every 10 seconds to keep data fresh
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

  // Use data directly instead of syncing with state
  const checkedInToday = checkedInTodayData ?? false;

  // Write contracts
  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: DEFAULT_CHAIN_ID,
  });

  // Claim starter pack
  const claimStarterPack = async () => {
    if (!contractAddress || !address) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "claimStarterPack",
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Claim starter pack error:", error);
    }
  };

  // Check in
  const checkIn = async () => {
    if (!contractAddress || !address) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "checkIn",
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Check-in error:", error);
    }
  };

  // Collect spawn dust
  const collectSpawnDust = async () => {
    if (!contractAddress || !address) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "collectSpawnDust",
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Collect spawn dust error:", error);
    }
  };

  // Start incubation
  const startIncubation = async (eggId: number) => {
    if (!contractAddress || !address) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "startIncubation",
        args: [BigInt(eggId)],
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Start incubation error:", error);
    }
  };

  // Hatch egg
  const hatchEgg = async (eggId: number) => {
    if (!contractAddress || !address) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "hatchEgg",
        args: [BigInt(eggId)],
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Hatch egg error:", error);
    }
  };

  // Lay egg (from fish)
  const layEgg = async (fishId: number) => {
    if (!contractAddress || !address) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "layEgg",
        args: [BigInt(fishId)],
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Lay egg error:", error);
    }
  };

  // Merge fish
  const mergeFish = async (fishId1: number, fishId2: number) => {
    if (!contractAddress || !address) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "mergeFish",
        args: [BigInt(fishId1), BigInt(fishId2)],
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Merge fish error:", error);
    }
  };

  // Expand reef
  const expandReef = async () => {
    if (!contractAddress || !address) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "expandReef",
        args: [],
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Expand reef error:", error);
    }
  };

  // Burn fish
  const burnFish = async (fishIds: number[]) => {
    if (!contractAddress || !address || fishIds.length === 0) return;

    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: baseSepolia.id });
        return;
      } catch (error) {
        console.error("Failed to switch network:", error);
        return;
      }
    }

    try {
      const fishIdsBigInt = fishIds.map((id) => BigInt(id));
      console.log("Calling burnFish with:", {
        fishIds,
        fishIdsBigInt,
        contractAddress,
      });
      writeContract({
        address: contractAddress,
        abi: fryReefAbi,
        functionName: "burnFish",
        args: [fishIdsBigInt],
        chainId: DEFAULT_CHAIN_ID,
      });
    } catch (error) {
      console.error("Burn fish error:", error);
    }
  };

  // Switch network helper
  const switchToBaseSepolia = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  // Refetch after successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      // Immediate refetch
      refetchUserInfo();
      refetchCheckedInToday();
      refetchStarterPack();
      refetchReefCapacity();
      refetchExpansionCost();

      // Additional refetch after delay to ensure data is updated
      const timer1 = setTimeout(() => {
        refetchUserInfo();
        refetchCheckedInToday();
        refetchStarterPack();
        refetchReefCapacity();
        refetchExpansionCost();
      }, 2000);

      // Final refetch after longer delay
      const timer2 = setTimeout(() => {
        refetchUserInfo();
        refetchCheckedInToday();
        refetchStarterPack();
        refetchReefCapacity();
        refetchExpansionCost();
      }, 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [
    isSuccess,
    hash,
    refetchUserInfo,
    refetchCheckedInToday,
    refetchStarterPack,
    refetchReefCapacity,
    refetchExpansionCost,
  ]);

  // Filter out user rejection errors
  const getFilteredError = () => {
    if (!writeError) return null;

    const errorMessage =
      writeError instanceof Error
        ? writeError.message.toLowerCase()
        : String(writeError).toLowerCase();

    const isUserRejection =
      errorMessage.includes("user rejected") ||
      errorMessage.includes("user denied") ||
      errorMessage.includes("rejected") ||
      errorMessage.includes("denied") ||
      errorMessage.includes("cancelled");

    if (isUserRejection) return null;

    return writeError as Error;
  };

  // Debug: log userInfo to check data
  if (userInfo) {
    console.log("UserInfo from contract:", {
      pearlShards: userInfo.pearlShards?.toString(),
      spawnDust: userInfo.spawnDust?.toString(),
      reefCapacity: userInfo.reefCapacity?.toString(),
      starterPackClaimed: userInfo.starterPackClaimed,
    });
  }

  return {
    // User info
    userInfo,
    pearlShards: userInfo?.pearlShards ? Number(userInfo.pearlShards) : 0,
    spawnDust: userInfo?.spawnDust ? Number(userInfo.spawnDust) : 0,
    currentStreak: userInfo?.currentStreak ? Number(userInfo.currentStreak) : 0,
    totalCheckIns: userInfo?.totalCheckIns ? Number(userInfo.totalCheckIns) : 0,

    // Starter pack - keep undefined until data loads
    starterPackClaimed: starterPackClaimedData,
    claimStarterPack,

    // Check-in
    checkedInToday,
    checkIn,

    // Spawn dust
    collectSpawnDust,

    // Incubation
    startIncubation,
    hatchEgg,
    layEgg,
    mergeFish,
    burnFish,

    // Reef expansion
    reefCapacity: reefCapacityData ? Number(reefCapacityData) : 3, // Default to 3
    expansionCost: expansionCostData ? Number(expansionCostData) : null,
    expandReef,
    refetchReefCapacity,

    // Refetch
    refetchUserInfo,

    // Status
    isLoading: isLoadingUserInfo || isConfirming,
    isWriting,
    isSuccess,
    error: getFilteredError(),
    resetWrite,

    // Network
    isOnCorrectNetwork,
    switchToBaseSepolia,
    isConfigured,
  };
}
