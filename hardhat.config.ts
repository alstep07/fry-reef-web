import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // Local Hardhat network
    hardhat: {
      chainId: 31337,
    },
    // Base Sepolia testnet, align with Base Learn deployment docs: `https://docs.base.org/learn/welcome`
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
};

export default config;


