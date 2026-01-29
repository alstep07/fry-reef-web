// OpenSea collection metadata for Fish NFT
export async function GET() {
  return Response.json({
    name: "FryReef Fish",
    description:
      "Collectible fish NFTs from FryReef. Each fish produces Spawn Dust over time based on its rarity. Breed, merge, and evolve your fish to reach higher rarities!",
    image: "https://fryreef.com/images/common/logo.png",
    external_link: "https://fryreef.com",
    seller_fee_basis_points: 500, // 5% royalty
    fee_recipient: "0x9Ff507683E602590ad1eD484cb3D62CBb564f99A", // TODO: Replace with your wallet
  });
}
