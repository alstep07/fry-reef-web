"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { keepPreviousData } from "@tanstack/react-query";
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

  const contractAddress = EGG_NFT_ADDRESS
    ? (EGG_NFT_ADDRESS as `0x${string}`)
    : undefined;

  // Get egg balance
  const { data: balance, refetch: refetchBalance, isFetched: isBalanceFetched } = useReadContract({
    address: contractAddress,
    abi: eggNftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: DEFAULT_CHAIN_ID,
    query: {
      enabled: !!address && !!contractAddress,
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

  const { data: eggInfoData, refetch: refetchEggInfo, isFetched: isEggInfoFetched } = useReadContracts({
    contracts: eggInfoContracts,
    query: {
      enabled: tokenIds.length > 0,
      placeholderData: keepPreviousData,
    },
  });

  // Parse egg data
  const eggs: EggWithInfo[] = tokenIds.map((tokenId, index) => {
    const baseIndex = index * 3;
    const infoResult = eggInfoData?.[baseIndex];
    const canHatchResult = eggInfoData?.[baseIndex + 1];
    const timeResult = eggInfoData?.[baseIndex + 2];

    const isInfoLoaded = infoResult?.status === "success" && infoResult?.result !== undefined;

    // Parse EggInfo - wagmi may return as array tuple or object
    let info: EggInfo;
    if (infoResult?.status === "success" && infoResult?.result) {
      const result = infoResult.result as 
        | { mintedAt?: bigint; incubationStartedAt?: bigint; isIncubating?: boolean }
        | [bigint, bigint, boolean];
      
      if (Array.isArray(result)) {
        // Tuple format: [mintedAt, incubationStartedAt, isIncubating]
        info = {
          mintedAt: BigInt(result[0] ?? 0),
          incubationStartedAt: BigInt(result[1] ?? 0),
          isIncubating: Boolean(result[2]),
        };
      } else {
        // Object format
        info = {
          mintedAt: BigInt(result.mintedAt ?? 0),
          incubationStartedAt: BigInt(result.incubationStartedAt ?? 0),
          isIncubating: Boolean(result.isIncubating),
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

