import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_WALLETCONNECT_PROJECT_ID";

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: "FryReef",
      preference: "all", // shows both mobile app and browser extension
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "FryReef",
        description: "Breed, merge, evolve on Base",
        url: "https://fryreef.com",
        icons: ["https://fryreef.com/favicon.ico"],
      },
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

