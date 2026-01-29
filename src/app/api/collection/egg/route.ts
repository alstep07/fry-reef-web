// OpenSea collection metadata for Egg NFT
export async function GET() {
  return Response.json({
    name: "FryReef Eggs",
    description:
      "Fish eggs from FryReef. Incubate for 24 hours to hatch into fish with random rarity (Common, Rare, Epic, Legendary, or Mythic)!",
    image: "https://fryreef.com/images/apple-touch-icon.png",
    external_link: "https://fryreef.com",
    seller_fee_basis_points: 500, // 5% royalty
    fee_recipient: "0x9Ff507683E602590ad1eD484cb3D62CBb564f99A", // TODO: Replace with your wallet
  });
}
