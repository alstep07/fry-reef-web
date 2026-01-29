// OpenSea collection metadata for Fish NFT
export async function GET() {
  return Response.json({
    name: "FryReef Fish",
    description:
      "Collectible fish NFTs from FryReef. Each fish produces Spawn Dust over time based on its rarity. Breed, merge, and evolve your fish to reach higher rarities!",
    image: "https://fry-reef.vercel.app/images/apple-touch-icon.png",
    external_link: "https://fry-reef.vercel.app",
    seller_fee_basis_points: 500, // 5% royalty
    fee_recipient: "0x9Ff507683E602590ad1eD484cb3D62CBb564f99A", // TODO: Replace with your wallet
  });
}
