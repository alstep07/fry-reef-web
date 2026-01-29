const hre = require("hardhat");

/**
 * Deploy only FishNFT (after FryReef and EggNFT are deployed)
 */

async function main() {
  console.log("🐟 Deploying FishNFT only...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Deploy FishNFT
  console.log("Deploying FishNFT...");
  const FishNFT = await hre.ethers.getContractFactory("FishNFT");
  const fishNFT = await FishNFT.deploy();
  await fishNFT.waitForDeployment();
  const fishNFTAddress = await fishNFT.getAddress();
  console.log("✅ FishNFT deployed to:", fishNFTAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
