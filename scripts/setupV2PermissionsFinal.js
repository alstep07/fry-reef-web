const hre = require("hardhat");

/**
 * Setup permissions for deployed V2 contracts
 */

const FRYREEF_ADDRESS = "0x63C3d6AA5213286Fc24bC23D0E75109DaF1163DF";
const EGG_NFT_ADDRESS = "0xf2170b4f6c3CC53A98b0b690F67434A724d4cB39";
const FISH_NFT_ADDRESS = "0x7F5F33928689160487bCA1C4849a6dF8223440b1";

async function main() {
  console.log("🔐 Setting up V2 permissions...\n");

  console.log("Contract addresses:");
  console.log("  FryReef:", FRYREEF_ADDRESS);
  console.log("  EggNFT: ", EGG_NFT_ADDRESS);
  console.log("  FishNFT:", FISH_NFT_ADDRESS, "\n");

  // Get contracts
  const fryReef = await hre.ethers.getContractAt("FryReef", FRYREEF_ADDRESS);
  const eggNFT = await hre.ethers.getContractAt("EggNFT", EGG_NFT_ADDRESS);
  const fishNFT = await hre.ethers.getContractAt("FishNFT", FISH_NFT_ADDRESS);

  // Step 1: Set FryReef as game contract for EggNFT
  console.log("1️⃣ Setting FryReef as game contract for EggNFT...");
  try {
    const setEggTx = await eggNFT.setGameContract(FRYREEF_ADDRESS);
    await setEggTx.wait();
    console.log("  ✅ EggNFT permissions set\n");
  } catch (error) {
    console.error("  ❌ Failed:", error.message, "\n");
  }

  await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay

  // Step 2: Set FryReef as game contract for FishNFT
  console.log("2️⃣ Setting FryReef as game contract for FishNFT...");
  try {
    const setFishTx = await fishNFT.setGameContract(FRYREEF_ADDRESS);
    await setFishTx.wait();
    console.log("  ✅ FishNFT permissions set\n");
  } catch (error) {
    console.error("  ❌ Failed:", error.message, "\n");
  }

  await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay

  // Step 3: Update FryReef with real NFT addresses
  console.log("3️⃣ Updating FryReef with real NFT addresses...");
  try {
    const updateTx = await fryReef.updateNFTContracts(
      EGG_NFT_ADDRESS,
      FISH_NFT_ADDRESS,
    );
    await updateTx.wait();
    console.log("  ✅ FryReef NFT addresses updated\n");
  } catch (error) {
    console.error("  ❌ Failed:", error.message, "\n");
  }

  console.log("=".repeat(60));
  console.log("🎉 Permissions setup complete!\n");
  console.log("📝 Next: Update .env and run migration");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
