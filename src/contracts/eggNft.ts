/**
 * EggNFT Contract Configuration
 */

export const EGG_NFT_ADDRESS = process.env.NEXT_PUBLIC_EGG_NFT_ADDRESS || "";

export const eggNftAbi = [
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
    name: "getEggInfo",
    inputs: [{ name: "_tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "mintedAt", type: "uint256" },
          { name: "incubationStartedAt", type: "uint256" },
          { name: "isIncubating", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canHatch",
    inputs: [{ name: "_tokenId", type: "uint256" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTimeUntilHatch",
    inputs: [{ name: "_tokenId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "INCUBATION_DURATION",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  // Events
  {
    type: "event",
    name: "EggMinted",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "IncubationStarted",
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "startTime", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "EggHatched",
    inputs: [{ indexed: true, name: "tokenId", type: "uint256" }],
  },
] as const;

export interface EggInfo {
  mintedAt: bigint;
  incubationStartedAt: bigint;
  isIncubating: boolean;
}

