const hre = require("hardhat");

/**
 * Deploy only FryReef with existing NFT addresses
 */

async function main() {
  console.log("🚀 Deploying FryReef only...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Use deployed NFT addresses from env or hardcoded
  const EGG_NFT_ADDRESS = process.env.NEW_EGG_NFT_ADDRESS || "0x2BA03cc5bba362e60C105CF69071a2c9F3CBa4b2";
  const FISH_NFT_ADDRESS = process.env.NEW_FISH_NFT_ADDRESS || "0x71b1B20aa4AAF0eCf5f29465C7A76d12BfF389e6";

  console.log("📋 Using NFT addresses:");
  console.log(`  EggNFT:  ${EGG_NFT_ADDRESS}`);
  console.log(`  FishNFT: ${FISH_NFT_ADDRESS}\n`);

  // Deploy FryReef
  console.log("3️⃣ Deploying FryReef...");
  const FryReef = await hre.ethers.getContractFactory("FryReef");
  const fryReef = await FryReef.deploy(EGG_NFT_ADDRESS, FISH_NFT_ADDRESS);
  await fryReef.waitForDeployment();
  const fryReefAddress = await fryReef.getAddress();
  console.log("✅ FryReef deployed to:", fryReefAddress, "\n");

  // Set FryReef as game contract for NFTs
  console.log("4️⃣ Setting up permissions...");

  const eggNFT = await hre.ethers.getContractAt("EggNFT", EGG_NFT_ADDRESS);
  const fishNFT = await hre.ethers.getContractAt("FishNFT", FISH_NFT_ADDRESS);

  console.log("  Setting FryReef as game contract for EggNFT...");
  const setEggTx = await eggNFT.setGameContract(fryReefAddress);
  await setEggTx.wait();
  console.log("  ✅ EggNFT permissions set");

  console.log("  Setting FryReef as game contract for FishNFT...");
  const setFishTx = await fishNFT.setGameContract(fryReefAddress);
  await setFishTx.wait();
  console.log("  ✅ FishNFT permissions set\n");

  // Summary
  console.log("=".repeat(60));
  console.log("🎉 Deployment Complete!\n");
  console.log("📋 Contract Addresses:");
  console.log("  EggNFT:  ", EGG_NFT_ADDRESS);
  console.log("  FishNFT: ", FISH_NFT_ADDRESS);
  console.log("  FryReef: ", fryReefAddress);
  console.log("=".repeat(60));

  console.log("\n📝 Next Steps:");
  console.log("1. Add to .env:");
  console.log(`   NEW_EGG_NFT_ADDRESS=${EGG_NFT_ADDRESS}`);
  console.log(`   NEW_FISH_NFT_ADDRESS=${FISH_NFT_ADDRESS}`);
  console.log(`   NEW_FRYREEF_ADDRESS=${fryReefAddress}`);
  console.log("\n2. Run migration:");
  console.log(
    "   npx hardhat run scripts/migrateUsers.js --network base -- snapshots/snapshot-2026-01-29T11-00-03-100Z.json",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
