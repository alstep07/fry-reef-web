/**
 * FishNFT Contract Configuration
 */

export const FISH_NFT_ADDRESS = process.env.NEXT_PUBLIC_FISH_NFT_ADDRESS || "";

export const fishNftAbi = [
  // ERC721 standard
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  // Custom functions
  {
    type: "function",
    name: "getFishInfo",
    inputs: [{ name: "_tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "rarity", type: "uint8" },
          { name: "mintedAt", type: "uint256" },
          { name: "lastDustCollectedAt", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFishByOwner",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPendingDustForFish",
    inputs: [{ name: "_tokenId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPendingSpawnDust",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDustPerDay",
    inputs: [{ name: "_rarity", type: "uint8" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "pure",
  },
  // Events
  {
    type: "event",
    name: "FishMinted",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "rarity", type: "uint8" },
    ],
  },
  {
    type: "event",
    name: "SpawnDustCollected",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
] as const;

export interface FishInfo {
  rarity: number;
  mintedAt: bigint;
  lastDustCollectedAt: bigint;
}

// Rarity enum matching contract
export enum FishRarity {
  Common = 0,
  Rare = 1,
  Epic = 2,
  Legendary = 3,
  Mythic = 4,
}

