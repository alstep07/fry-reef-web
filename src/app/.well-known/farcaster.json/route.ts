const APP_URL = "https://fry-reef.vercel.app";

const manifest = {
  accountAssociation: {
    header: "eyJmaWQiOjE0NjYwMzcsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg1RDVjNmUzNDA3QTU3MUMxNjgxQmFlNTBhNzlCN0ZiYWJDNzk0NzRDIn0",
    payload: "eyJkb21haW4iOiJmcnktcmVlZi52ZXJjZWwuYXBwIn0",
    signature: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABp8dZkDr1sL8RBaJt3iCoS0I06RJwQ4r_Y1FlOM9YtPRkok14sU0k_1j_RWjzzqEW0gcGpmOvAfnKJHzSKim6RAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAl8ZgIay2xclZzG8RWZzuWvO8j9R0fus3XxDee9lRlVy8dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKeyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoidHY1bHd6THd1eTV1NXk4Q0J3QV9MeGR1RXFieGJHaXhnZFNEaWJGZXh0WSIsIm9yaWdpbiI6Imh0dHBzOi8va2V5cy5jb2luYmFzZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  },
  miniapp: {
    version: "1",
    name: "FryReef",
    homeUrl: APP_URL,
    iconUrl: `${APP_URL}/images/common/logo.png`,
    splashImageUrl: `${APP_URL}/images/common/logo.png`,
    splashBackgroundColor: "#0a1628",
    subtitle: "Breed, merge, and evolve fish NFTs",
    description: "Collect, breed & merge fish NFTs. Hatch eggs, evolve rare species, earn daily rewards. No crypto needed to start!",
    primaryCategory: "games",
    tags: ["nft", "game", "breeding", "onchain", "evolution"],
    screenshotUrls: [
      `${APP_URL}/images/screenshots/screen_1.png`,
      `${APP_URL}/images/screenshots/screen_2.png`,
      `${APP_URL}/images/screenshots/screen_3.png`,
    ],
    heroImageUrl: `${APP_URL}/images/screenshots/hero_image.png`,
    tagline: "Breed, merge, evolve onchain",
    ogTitle: "FryReef",
    ogDescription: "Build your underwater reef by breeding and evolving fish NFTs",
    ogImageUrl: `${APP_URL}/images/common/logo.png`,
    noindex: false,
  },
};

export async function GET() {
  return Response.json(manifest);
}
