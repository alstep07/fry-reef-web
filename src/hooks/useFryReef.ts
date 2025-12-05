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
      const timer = setTimeout(() => {
        refetchUserInfo();
        refetchCheckedInToday();
        refetchStarterPack();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash, refetchUserInfo, refetchCheckedInToday, refetchStarterPack]);

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

