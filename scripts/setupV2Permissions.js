const hre = require("hardhat");

/**
 * Setup V2 permissions - separate from deployment
 */

async function main() {
  console.log("🔧 Setting up V2 permissions...\n");

  const FRYREEF_ADDRESS = "0x05cAD6d1e26e3c6398860e32Ed6ce636279c4EC0";
  const EGG_NFT_ADDRESS = "0xfBC9e630AA2A6285634B184eCfd6432bFBa1B6fa";
  const FISH_NFT_ADDRESS = "0x285ea5BCC9907dA941863129B5b608Cd6e3D581e";

  console.log("📋 Contract Addresses:");
  console.log(`  FryReef: ${FRYREEF_ADDRESS}`);
  console.log(`  EggNFT: ${EGG_NFT_ADDRESS}`);
  console.log(`  FishNFT: ${FISH_NFT_ADDRESS}\n`);

  const eggNFT = await hre.ethers.getContractAt("EggNFT", EGG_NFT_ADDRESS);
  const fishNFT = await hre.ethers.getContractAt("FishNFT", FISH_NFT_ADDRESS);
  const fryReef = await hre.ethers.getContractAt("FryReef", FRYREEF_ADDRESS);

  // Step 1: Set FryReef as game contract for NFTs
  console.log("1️⃣ Setting FryReef as game contract for EggNFT...");
  try {
    const setEggTx = await eggNFT.setGameContract(FRYREEF_ADDRESS);
    await setEggTx.wait();
    console.log("  ✅ EggNFT permissions set\n");
  } catch (error) {
    console.log(`  ⚠️  ${error.message}\n`);
  }

  console.log("2️⃣ Setting FryReef as game contract for FishNFT...");
  try {
    const setFishTx = await fishNFT.setGameContract(FRYREEF_ADDRESS);
    await setFishTx.wait();
    console.log("  ✅ FishNFT permissions set\n");
  } catch (error) {
    console.log(`  ⚠️  ${error.message}\n`);
  }

  // Step 2: Update FryReef with NFT addresses
  console.log("3️⃣ Updating FryReef with real NFT addresses...");
  try {
    const updateTx = await fryReef.updateNFTContracts(
      EGG_NFT_ADDRESS,
      FISH_NFT_ADDRESS,
    );
    await updateTx.wait();
    console.log("  ✅ FryReef NFT addresses updated\n");
  } catch (error) {
    console.log(`  ⚠️  ${error.message}\n`);
  }

  console.log("✅ Setup complete!");
  console.log("\n📝 Next step: Run migration");
  console.log("   npx hardhat run scripts/migrateUsers.js --network base");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
