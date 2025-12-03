# 🐟 FryReef

A blockchain-based idle game where you breed, hatch, and collect fish NFTs on Base.

## 🎮 Game Overview

FryReef is an on-chain idle game built on Base Sepolia testnet. Players collect eggs, incubate them into fish, and build their underwater reef.

### Core Mechanics

- **Starter Pack** — New players receive 1 Egg, 2 Pearl Shards, and 50 Spawn Dust
- **Daily Check-in** — Build a 7-day streak to earn Pearl Shards
- **Egg Incubation** — Use Pearl Shards to incubate eggs (24h duration)
- **Fish Rarities** — Common (50%), Rare (28%), Epic (14%), Legendary (6%), Mythic (2%)
- **Spawn Dust** — Fish produce Spawn Dust daily based on rarity
- **Breeding** — Use 100 Spawn Dust to lay a new egg

### Resources

| Resource    | Icon | Usage                      |
| ----------- | ---- | -------------------------- |
| Pearl Shard | 🫧    | Incubate eggs (1 per egg)  |
| Spawn Dust  | ✨   | Lay new eggs (100 per egg) |

### Fish Production (Spawn Dust/day)

| Rarity    | Chance | Production |
| --------- | ------ | ---------- |
| Common    | 50%    | 6/day      |
| Rare      | 28%    | 12/day     |
| Epic      | 14%    | 18/day     |
| Legendary | 6%     | 32/day     |
| Mythic    | 2%     | 48/day     |

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Web3**: Wagmi, Viem, RainbowKit
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Network**: Base Sepolia (testnet)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A wallet with Base Sepolia ETH ([Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fryreef.git
cd fryreef

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_FRYREEF_ADDRESS=0x...
NEXT_PUBLIC_EGG_NFT_ADDRESS=0x...
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x...
```

### Development

```bash
# Run the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Smart Contract Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat deploy --network baseSepolia
```

## 📁 Project Structure

```
├── contracts/          # Solidity smart contracts
│   ├── FryReef.sol     # Main game contract
│   ├── EggNFT.sol      # ERC-721 egg tokens
│   └── FishNFT.sol     # ERC-721 fish tokens
├── deploy/             # Hardhat deployment scripts
├── public/images/      # Game assets (fish, eggs)
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   │   ├── features/   # Feature-specific components
│   │   └── ui/         # Reusable UI components
│   ├── constants/      # Game configuration
│   ├── contracts/      # Contract ABIs and addresses
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities and providers
└── hardhat.config.ts   # Hardhat configuration
```

## 📜 Smart Contracts

| Contract      | Description                           |
| ------------- | ------------------------------------- |
| `FryReef.sol` | Main game logic, check-ins, resources |
| `EggNFT.sol`  | ERC-721 for egg NFTs with incubation  |
| `FishNFT.sol` | ERC-721 for fish NFTs with rarity     |

## 🔗 Links

- [FAQ](/faq)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)

## 📄 License

MIT
