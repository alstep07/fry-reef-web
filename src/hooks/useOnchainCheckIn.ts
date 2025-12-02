"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS as `0x${string}`;

const ABI = [
  {
    inputs: [],
    name: "checkIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "lastCheckIn", type: "uint256" },
          { internalType: "uint256", name: "totalCheckIns", type: "uint256" },
          { internalType: "uint256", name: "currentMonthStreak", type: "uint256" },
          { internalType: "uint256", name: "bestMonthStreak", type: "uint256" },
          { internalType: "uint256", name: "currentMonthStart", type: "uint256" },
          { internalType: "uint256", name: "bestMonthTimestamp", type: "uint256" },
        ],
        internalType: "struct DailyCheckIn.UserInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "hasCheckedInToday",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "currentStreak", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "bestStreak", type: "uint256" },
    ],
    name: "CheckedIn",
    type: "event",
  },
] as const;

interface UserInfo {
  lastCheckIn: bigint;
  totalCheckIns: bigint;
  currentMonthStreak: bigint;
  bestMonthStreak: bigint;
  currentMonthStart: bigint;
  bestMonthTimestamp: bigint;
}

export function useOnchainCheckIn(address?: string) {
  const { address: connectedAddress } = useAccount();
  const userAddress = (address || connectedAddress) as `0x${string}` | undefined;

  // Read user info
  const { data: userInfo, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getUserInfo",
    args: userAddress ? [userAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!userAddress && !!CONTRACT_ADDRESS,
    },
  }) as { data: UserInfo | undefined; isLoading: boolean; refetch: () => void };

  // Check if checked in today
  const { data: checkedInToday } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "hasCheckedInToday",
    args: userAddress ? [userAddress] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!userAddress && !!CONTRACT_ADDRESS,
    },
  }) as { data: boolean | undefined };

  // Write check-in
  const { writeContract, data: hash, isPending: isWriting, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId: baseSepolia.id,
  });

  const checkIn = async () => {
    if (!CONTRACT_ADDRESS || !userAddress) return;

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "checkIn",
        chainId: baseSepolia.id,
      });
    } catch (error) {
      console.error("Check-in error:", error);
    }
  };

  // Refetch after successful transaction
  if (isSuccess && hash) {
    setTimeout(() => refetch(), 2000);
  }

  return {
    lastCheckInTimestamp: userInfo?.lastCheckIn ? Number(userInfo.lastCheckIn) : null,
    totalCount: userInfo?.totalCheckIns ? Number(userInfo.totalCheckIns) : 0,
    currentMonthStreak: userInfo?.currentMonthStreak ? Number(userInfo.currentMonthStreak) : 0,
    bestMonthStreak: userInfo?.bestMonthStreak ? Number(userInfo.bestMonthStreak) : 0,
    checkedInToday: checkedInToday ?? false,
    isLoading: isLoading || isConfirming,
    isWriting,
    checkIn,
    isSuccess,
    error: writeError ? (writeError as Error) : null,
  };
}

