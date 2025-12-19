# Deploy Daily Check-In Contract

## Prerequisites

1. Install dependencies:
```bash
npm install --save-dev hardhat-deploy @nomicfoundation/hardhat-toolbox dotenv
```

2. Set up environment variables in `.env`:
```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
```

3. Get testnet ETH on Base Sepolia:
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

## Deploy Contract

1. Compile the contract:
```bash
npx hardhat compile
```

2. Deploy to Base Sepolia:
```bash
npx hardhat deploy --network baseSepolia --tags DeployAll
```

3. Copy the deployed contract address from the output

4. Add to `.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS=0x68a298f481353864Fc3bD2C8fbf1027D509B321D
```

5. Restart the Next.js dev server:
```bash
npm run dev
```

## Contract Features

- **Daily Check-in**: Users can check in once per day
- **Current Month Streak**: Tracks consecutive days in current month
- **Best Month Streak**: Records the best streak ever achieved
- **Total Check-ins**: Counts all check-ins

## Current Deployment

- **Address**: `0x68a298f481353864Fc3bD2C8fbf1027D509B321D`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Gas Used**: 536,146

## Admin Functions (Testing)

After deployment, the contract owner can mint and transfer fish for testing purposes.

### Mint Fish

Mint fish with specified rarity to any address:

**PowerShell:**
```powershell
# Mint 1 Common fish
$env:MINT_TO="0xYourAddress"; $env:MINT_RARITY="0"; npx hardhat run scripts/mintFish.js --network baseSepolia

# Mint 5 Rare fish
$env:MINT_TO="0xYourAddress"; $env:MINT_RARITY="1"; $env:MINT_AMOUNT="5"; npx hardhat run scripts/mintFish.js --network baseSepolia
```

**Bash:**
```bash
# Mint 1 Common fish
MINT_TO=0xYourAddress MINT_RARITY=0 npx hardhat run scripts/mintFish.js --network baseSepolia

# Mint 5 Rare fish
MINT_TO=0x9Ff507683E602590ad1eD484cb3D62CBb564f99A MINT_RARITY=0 MINT_AMOUNT=4 npx hardhat run scripts/mintFish.js --network baseSepolia
```

**Rarity values:**
- `0` = Common
- `1` = Rare
- `2` = Epic
- `3` = Legendary
- `4` = Mythic

### Transfer Fish

Transfer fish from one address to another (admin only):

**PowerShell:**
```powershell
# Transfer single fish
$env:TRANSFER_FROM="0xFromAddress"; $env:TRANSFER_TO="0xToAddress"; $env:TRANSFER_TOKEN_ID="5"; npx hardhat run scripts/transferFish.js --network baseSepolia

# Transfer multiple fish
$env:TRANSFER_FROM="0xC88fA5aB592d2EAC7350c6444CF08012f6d22357"; $env:TRANSFER_TO="0x31437C81fCc48c50DfE7c89E928b81CFA4931Cf0"; $env:TRANSFER_TOKEN_IDS="1,2,3"; npx hardhat run scripts/transferFish.js --network baseSepolia
```

**Bash:**
```bash
# Transfer single fish
TRANSFER_FROM=0xFromAddress TRANSFER_TO=0xToAddress TRANSFER_TOKEN_ID=5 npx hardhat run scripts/transferFish.js --network baseSepolia

# Transfer multiple fish
TRANSFER_FROM=0x9Ff507683E602590ad1eD484cb3D62CBb564f99A TRANSFER_TO=0x31437C81fCc48c50DfE7c89E928b81CFA4931Cf0 TRANSFER_TOKEN_IDS=15,16 npx hardhat run scripts/transferFish.js --network baseSepolia
```

**Note:** Only the contract owner (deployer) can use these admin functions.

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed information about the codebase organization.
