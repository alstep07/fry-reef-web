import { NextRequest } from "next/server";
import { createPublicClient, http, getContract } from "viem";
import { base } from "viem/chains";
import { fishNftAbi, eggNftAbi } from "@/contracts";

// Contract addresses on Base mainnet - from environment variables
const FISH_NFT_ADDRESS = process.env.NEXT_PUBLIC_FISH_NFT_ADDRESS!;
const EGG_NFT_ADDRESS = process.env.NEXT_PUBLIC_EGG_NFT_ADDRESS!;

const RARITY_NAMES = ["Common", "Rare", "Epic", "Legendary", "Mythic"];
const DUST_PER_DAY = [6, 12, 18, 32, 48];

// OpenSea metadata standard endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contract: string; tokenId: string }> },
) {
  try {
    const { contract, tokenId } = await params;
    const contractAddress = contract.toLowerCase();

    // Create public client for Base
    const client = createPublicClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    // Check if it's Fish NFT
    if (contractAddress === FISH_NFT_ADDRESS.toLowerCase()) {
      const fishContract = getContract({
        address: FISH_NFT_ADDRESS as `0x${string}`,
        abi: fishNftAbi,
        client,
      });

      const fishInfo = (await fishContract.read.getFishInfo([
        BigInt(tokenId),
      ])) as any;
      const rarity = Number(fishInfo.rarity); // rarity enum
      const rarityName = RARITY_NAMES[rarity];
      const productionRate = DUST_PER_DAY[rarity];

      return Response.json({
        name: `FryReef Fish #${tokenId}`,
        description: `A ${rarityName} rarity fish from FryReef that produces ${productionRate} Spawn Dust per day. Breed, merge, and evolve your fish to build the ultimate reef!`,
        image: `https://fry-reef.vercel.app/images/fish/${rarityName.toLowerCase()}.webp`,
        external_url: `https://fry-reef.vercel.app`,
        attributes: [
          {
            trait_type: "Rarity",
            value: rarityName,
          },
          {
            trait_type: "Production Rate",
            value: productionRate,
            display_type: "number",
          },
          {
            trait_type: "Type",
            value: "Fish",
          },
        ],
      });
    }

    // Check if it's Egg NFT
    if (contractAddress === EGG_NFT_ADDRESS.toLowerCase()) {
      const eggContract = getContract({
        address: EGG_NFT_ADDRESS as `0x${string}`,
        abi: eggNftAbi,
        client,
      });

      const eggInfo = (await eggContract.read.getEggInfo([
        BigInt(tokenId),
      ])) as any;
      const isIncubating = eggInfo.isIncubating; // isIncubating boolean
      const status = isIncubating ? "Incubating" : "Ready to Incubate";

      return Response.json({
        name: `FryReef Egg #${tokenId}`,
        description: `A fish egg from FryReef. Incubate for 24 hours to hatch into a fish with random rarity (Common to Mythic)!`,
        image: `https://fry-reef.vercel.app/images/egg/egg.png`,
        external_url: `https://fry-reef.vercel.app`,
        attributes: [
          {
            trait_type: "Status",
            value: status,
          },
          {
            trait_type: "Type",
            value: "Egg",
          },
        ],
      });
    }

    return Response.json(
      { error: "Unknown contract address" },
      { status: 404 },
    );
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return Response.json(
      { error: "Failed to fetch NFT metadata" },
      { status: 500 },
    );
  }
}
