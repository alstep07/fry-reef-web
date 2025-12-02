# Deploy Daily Check-In Contract

## Prerequisites

1. Install dependencies:
```bash
npm install --save-dev hardhat-deploy @nomicfoundation/hardhat-toolbox
```

2. Set up environment variables in `.env`:
```
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
npx hardhat deploy --network base_sepolia --tags DeployAll
```

3. Copy the deployed contract address from the output

4. Add to `.env.local`:
```
NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS=0x...
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

## Contract Address

After deployment, the contract address will be displayed in the terminal. Add it to your `.env.local` file for the frontend to connect.

