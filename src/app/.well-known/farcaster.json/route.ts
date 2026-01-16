const APP_URL = "https://fry-reef.vercel.app";

const manifest = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "FryReef",
    homeUrl: APP_URL,
    iconUrl: `${APP_URL}/images/common/logo.png`,
    splashImageUrl: `${APP_URL}/images/common/logo.png`,
    splashBackgroundColor: "#0a1628",
    subtitle: "Free-to-play NFT game on Base",
    description: "Collect, breed & merge fish NFTs. Hatch eggs, evolve rare species, earn daily rewards. No crypto needed to start!",
    primaryCategory: "games",
    tags: ["nft", "game", "base", "fish", "breeding", "free-to-play", "idle", "collectible"],
    heroImageUrl: `${APP_URL}/images/common/logo.png`,
    tagline: "Collect & evolve fish NFTs",
    ogTitle: "FryReef - Fish NFT Game",
    ogDescription: "Free-to-play fish breeding game on Base",
    ogImageUrl: `${APP_URL}/images/common/logo.png`,
  },
};

export async function GET() {
  return Response.json(manifest);
}
