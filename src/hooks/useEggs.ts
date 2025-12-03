"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { eggNftAbi, EGG_NFT_ADDRESS, type EggInfo } from "@/contracts/eggNft";

const DEFAULT_CHAIN_ID = baseSepolia.id;

export interface EggWithInfo {
  tokenId: number;
  info: EggInfo;
  canHatch: boolean;
  timeUntilHatch: number;
}

export function useEggs() {
  const { address } = useAccount();

  const contractAddress = EGG_NFT_ADDRESS
    ? (EGG_NFT_ADDRESS as `0x${string}`)
    : undefined;

  // Get egg balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
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

  // Get token IDs for each egg
  const tokenIdContracts = Array.from({ length: eggCount }, (_, i) => ({
    address: contractAddress,
    abi: eggNftAbi,
    functionName: "tokenOfOwnerByIndex" as const,
    args: [address, BigInt(i)] as const,
    chainId: DEFAULT_CHAIN_ID,
  }));

  const { data: tokenIdsData } = useReadContracts({
    contracts: tokenIdContracts,
    query: {
      enabled: eggCount > 0 && !!address,
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

  const { data: eggInfoData, refetch: refetchEggInfo } = useReadContracts({
    contracts: eggInfoContracts,
    query: {
      enabled: tokenIds.length > 0,
    },
  });

  // Parse egg data
  const eggs: EggWithInfo[] = tokenIds.map((tokenId, index) => {
    const baseIndex = index * 3;
    const infoResult = eggInfoData?.[baseIndex];
    const canHatchResult = eggInfoData?.[baseIndex + 1];
    const timeResult = eggInfoData?.[baseIndex + 2];

    const info = infoResult?.status === "success"
      ? (infoResult.result as EggInfo)
      : { mintedAt: BigInt(0), incubationStartedAt: BigInt(0), isIncubating: false };

    return {
      tokenId,
      info,
      canHatch: canHatchResult?.status === "success" ? Boolean(canHatchResult.result) : false,
      timeUntilHatch: timeResult?.status === "success" ? Number(timeResult.result) : 0,
    };
  });

  const refetch = () => {
    refetchBalance();
    refetchEggInfo();
  };

  return {
    eggs,
    eggCount,
    refetch,
    isLoading: false,
  };
}

