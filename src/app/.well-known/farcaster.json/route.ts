const URL = process.env.NEXT_PUBLIC_URL || "https://fryreef.vercel.app";

const manifest = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "FryReef",
    homeUrl: URL,
    iconUrl: `${URL}/images/common/logo.png`,
    splashImageUrl: `${URL}/images/common/logo.png`,
    splashBackgroundColor: "#0a1628",
    subtitle: "Breed, merge, evolve on Base",
    description: "Collect fish NFTs, breed eggs, merge for rare species. Free-to-play game on Base.",
    primaryCategory: "games",
    tags: ["nft", "game", "base", "fish", "breeding"],
    heroImageUrl: `${URL}/images/common/logo.png`,
    tagline: "Collect & evolve fish NFTs",
    ogTitle: "FryReef - Fish NFT Game",
    ogDescription: "Breed, merge, evolve fish NFTs on Base",
    ogImageUrl: `${URL}/images/common/logo.png`,
  },
};

export async function GET() {
  return Response.json(manifest);
}
