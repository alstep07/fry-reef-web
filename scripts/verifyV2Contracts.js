const hre = require("hardhat");

/**
 * Verify V2 contracts on Basescan
 */

// V2 Contract Addresses
const FRYREEF_ADDRESS = "0x63C3d6AA5213286Fc24bC23D0E75109DaF1163DF";
const EGG_NFT_ADDRESS = "0xf2170b4f6c3CC53A98b0b690F67434A724d4cB39";
const FISH_NFT_ADDRESS = "0x7F5F33928689160487bCA1C4849a6dF8223440b1";

async function main() {
  console.log("🔍 Verifying V2 contracts on Basescan...\n");

  // 1. Verify EggNFT (no constructor args)
  console.log("1️⃣ Verifying EggNFT...");
  console.log("   Address:", EGG_NFT_ADDRESS);
  try {
    await hre.run("verify:verify", {
      address: EGG_NFT_ADDRESS,
      constructorArguments: [],
    });
    console.log("   ✅ EggNFT verified!\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ✅ EggNFT already verified\n");
    } else {
      console.log("   ❌ Error:", error.message, "\n");
    }
  }

  // 2. Verify FishNFT (no constructor args)
  console.log("2️⃣ Verifying FishNFT...");
  console.log("   Address:", FISH_NFT_ADDRESS);
  try {
    await hre.run("verify:verify", {
      address: FISH_NFT_ADDRESS,
      constructorArguments: [],
    });
    console.log("   ✅ FishNFT verified!\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ✅ FishNFT already verified\n");
    } else {
      console.log("   ❌ Error:", error.message, "\n");
    }
  }

  // 3. Verify FryReef (with constructor args - placeholder addresses)
  console.log("3️⃣ Verifying FryReef...");
  console.log("   Address:", FRYREEF_ADDRESS);
  const placeholderAddr = "0x0000000000000000000000000000000000000001";
  try {
    await hre.run("verify:verify", {
      address: FRYREEF_ADDRESS,
      constructorArguments: [placeholderAddr, placeholderAddr],
    });
    console.log("   ✅ FryReef verified!\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ✅ FryReef already verified\n");
    } else {
      console.log("   ❌ Error:", error.message, "\n");
    }
  }

  console.log("=".repeat(60));
  console.log("✅ Verification complete!");
  console.log("=".repeat(60));
  console.log("\n📋 Verified Contracts:");
  console.log(`  EggNFT:  https://basescan.org/address/${EGG_NFT_ADDRESS}#code`);
  console.log(`  FishNFT: https://basescan.org/address/${FISH_NFT_ADDRESS}#code`);
  console.log(`  FryReef: https://basescan.org/address/${FRYREEF_ADDRESS}#code`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
