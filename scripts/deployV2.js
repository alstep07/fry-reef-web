const hre = require("hardhat");

/**
 * Deploy V2 contracts with OpenSea support + inactive fish logic
 * 
 * Deploys:
 * 1. New FishNFT (with contractURI/tokenURI + collectSpawnDustFromFish)
 * 2. New EggNFT (with contractURI/tokenURI)
 * 3. New FryReef (with active/inactive fish logic)
 */

async function main() {
  console.log("🚀 Deploying V2 contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Step 1: Deploy EggNFT
  console.log("1️⃣ Deploying EggNFT...");
  const EggNFT = await hre.ethers.getContractFactory("EggNFT");
  const eggNFT = await EggNFT.deploy();
  await eggNFT.waitForDeployment();
  const eggNFTAddress = await eggNFT.getAddress();
  console.log("✅ EggNFT deployed to:", eggNFTAddress, "\n");

  // Step 2: Deploy FishNFT
  console.log("2️⃣ Deploying FishNFT...");
  const FishNFT = await hre.ethers.getContractFactory("FishNFT");
  const fishNFT = await FishNFT.deploy();
  await fishNFT.waitForDeployment();
  const fishNFTAddress = await fishNFT.getAddress();
  console.log("✅ FishNFT deployed to:", fishNFTAddress, "\n");

  // Step 3: Deploy FryReef
  console.log("3️⃣ Deploying FryReef...");
  const FryReef = await hre.ethers.getContractFactory("FryReef");
  const fryReef = await FryReef.deploy(eggNFTAddress, fishNFTAddress);
  await fryReef.waitForDeployment();
  const fryReefAddress = await fryReef.getAddress();
  console.log("✅ FryReef deployed to:", fryReefAddress, "\n");

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

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 Deployment Complete!\n");
  console.log("📋 Contract Addresses:");
  console.log("  EggNFT:  ", eggNFTAddress);
  console.log("  FishNFT: ", fishNFTAddress);
  console.log("  FryReef: ", fryReefAddress);
  console.log("=" .repeat(60));

  console.log("\n📝 Next Steps:");
  console.log("1. Save these addresses to .env:");
  console.log(`   NEW_EGG_NFT_ADDRESS=${eggNFTAddress}`);
  console.log(`   NEW_FISH_NFT_ADDRESS=${fishNFTAddress}`);
  console.log(`   NEW_FRYREEF_ADDRESS=${fryReefAddress}`);
  console.log("\n2. Run snapshot (if not done yet):");
  console.log("   npx hardhat run scripts/snapshotUsers.js --network base");
  console.log("\n3. Run migration:");
  console.log("   npx hardhat run scripts/migrateUsers.js --network base -- snapshots/snapshot-XXX.json");
  console.log("\n4. Update frontend .env.local:");
  console.log(`   NEXT_PUBLIC_EGG_NFT_ADDRESS=${eggNFTAddress}`);
  console.log(`   NEXT_PUBLIC_FISH_NFT_ADDRESS=${fishNFTAddress}`);
  console.log(`   NEXT_PUBLIC_FRYREEF_ADDRESS=${fryReefAddress}`);
  console.log("\n5. Update contracts ABI in frontend (copy from deployments/)");
  console.log("\n6. Deploy frontend to Vercel");
  console.log("\n7. Test on OpenSea (wait 15-30 min for metadata refresh)");

  // Save deployment info
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

  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `v2-${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
