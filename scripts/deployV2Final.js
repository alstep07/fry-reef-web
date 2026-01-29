const hre = require("hardhat");

/**
 * Final V2 deployment - correct order
 * 1. Deploy FryReef (placeholder NFT addresses)
 * 2. Deploy EggNFT
 * 3. Deploy FishNFT
 * 4. Update FryReef with real NFT addresses
 * 5. Set FryReef as gameContract in NFTs
 */

async function main() {
  console.log("🚀 Final V2 Deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Step 1: Deploy FryReef with placeholder addresses
  console.log("1️⃣ Deploying FryReef (with placeholders)...");
  const FryReef = await hre.ethers.getContractFactory("FryReef");
  const placeholderAddr = "0x0000000000000000000000000000000000000001";
  const fryReef = await FryReef.deploy(placeholderAddr, placeholderAddr);
  await fryReef.waitForDeployment();
  const fryReefAddress = await fryReef.getAddress();
  console.log("✅ FryReef deployed to:", fryReefAddress, "\n");

  // Step 2: Deploy EggNFT
  console.log("2️⃣ Deploying EggNFT...");
  const EggNFT = await hre.ethers.getContractFactory("EggNFT");
  const eggNFT = await EggNFT.deploy();
  await eggNFT.waitForDeployment();
  const eggNFTAddress = await eggNFT.getAddress();
  console.log("✅ EggNFT deployed to:", eggNFTAddress, "\n");

  // Step 3: Deploy FishNFT
  console.log("3️⃣ Deploying FishNFT...");
  const FishNFT = await hre.ethers.getContractFactory("FishNFT");
  const fishNFT = await FishNFT.deploy();
  await fishNFT.waitForDeployment();
  const fishNFTAddress = await fishNFT.getAddress();
  console.log("✅ FishNFT deployed to:", fishNFTAddress, "\n");

  // Step 4: Set FryReef as game contract for NFTs
  console.log("4️⃣ Setting up permissions...");

  console.log("  Setting FryReef as game contract for EggNFT...");
  const setEggTx = await eggNFT.setGameContract(fryReefAddress);
  await setEggTx.wait();
  console.log("  ✅ EggNFT permissions set");

  console.log("  Setting FryReef as game contract for FishNFT...");
  const setFishTx = await fishNFT.setGameContract(fryReefAddress);
  await setFishTx.wait();
  console.log("  ✅ FishNFT permissions set\n");

  // Step 5: Update FryReef with real NFT addresses
  console.log("5️⃣ Updating FryReef with real NFT addresses...");
  const updateTx = await fryReef.updateNFTContracts(
    eggNFTAddress,
    fishNFTAddress,
  );
  await updateTx.wait();
  console.log("  ✅ FryReef NFT addresses updated\n");

  // Summary
  console.log("=".repeat(60));
  console.log("🎉 Deployment Complete!\n");
  console.log("📋 Contract Addresses:");
  console.log("  EggNFT:  ", eggNFTAddress);
  console.log("  FishNFT: ", fishNFTAddress);
  console.log("  FryReef: ", fryReefAddress);
  console.log("=".repeat(60));

  console.log("📝 Next Steps:");
  console.log("1. Update .env:");
  console.log(`   NEW_EGG_NFT_ADDRESS=${eggNFTAddress}`);
  console.log(`   NEW_FISH_NFT_ADDRESS=${fishNFTAddress}`);
  console.log(`   NEW_FRYREEF_ADDRESS=${fryReefAddress}`);
  console.log("\n2. Run migration:");
  console.log("   npx hardhat run scripts/migrateUsers.js --network base");

  // Save deployment info
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      eggNFT: eggNFTAddress,
      fishNFT: fishNFTAddress,
      fryReef: fryReefAddress,
    },
  };

  const deploymentFile = path.join(
    deploymentsDir,
    `v2-final-${hre.network.name}.json`,
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
