/**
 * FryReef Contract Configuration
 */

export const FRYREEF_ADDRESS = process.env.NEXT_PUBLIC_FRYREEF_ADDRESS || "";
export const EGG_NFT_ADDRESS = process.env.NEXT_PUBLIC_EGG_NFT_ADDRESS || "";
export const FISH_NFT_ADDRESS = process.env.NEXT_PUBLIC_FISH_NFT_ADDRESS || "";

export const isFryReefConfigured = () => {
  return FRYREEF_ADDRESS !== "" && FRYREEF_ADDRESS !== "0x";
};

export const fryReefAbi = [
  // Events
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "streak", type: "uint256" },
      { indexed: false, name: "totalCheckIns", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "StarterPackClaimed",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "eggId", type: "uint256" },
      { indexed: false, name: "pearlShards", type: "uint256" },
      { indexed: false, name: "spawnDust", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "ResourcesUpdated",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "pearlShards", type: "uint256" },
      { indexed: false, name: "spawnDust", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "StreakReward",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "pearlShards", type: "uint256" },
    ],
  },
  // Read functions
  {
    type: "function",
    name: "getUserInfo",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "lastCheckIn", type: "uint256" },
          { name: "currentStreak", type: "uint256" },
          { name: "totalCheckIns", type: "uint256" },
          { name: "pearlShards", type: "uint256" },
          { name: "spawnDust", type: "uint256" },
          { name: "starterPackClaimed", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasCheckedInToday",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasClaimedStarterPack",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getResources",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [
      { name: "pearlShards", type: "uint256" },
      { name: "spawnDust", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPendingSpawnDust",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "claimStarterPack",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "checkIn",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "startIncubation",
    inputs: [{ name: "_eggId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hatchEgg",
    inputs: [{ name: "_eggId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "layEgg",
    inputs: [{ name: "_fishId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "collectSpawnDust",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Constants
  {
    type: "function",
    name: "STREAK_FOR_REWARD",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "STARTER_PACK_EGGS",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "STARTER_PACK_PEARL_SHARDS",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "STARTER_PACK_SPAWN_DUST",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export interface UserInfo {
  lastCheckIn: bigint;
  currentStreak: bigint;
  totalCheckIns: bigint;
  pearlShards: bigint;
  spawnDust: bigint;
  starterPackClaimed: boolean;
}

