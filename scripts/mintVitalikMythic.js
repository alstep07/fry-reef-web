const hre = require("hardhat");

/**
 * Mint a Mythic fish to Vitalik Buterin
 */

// Vitalik's address
const VITALIK_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

async function main() {
  console.log("🐟✨ Minting Mythic fish to Vitalik Buterin...\n");

  const NEW_FRYREEF = process.env.NEW_FRYREEF_ADDRESS;
  const fryReef = await hre.ethers.getContractAt("FryReef", NEW_FRYREEF);

  console.log("Recipient:", VITALIK_ADDRESS);
  console.log("Rarity: Mythic (4)");
  console.log("FryReef:", NEW_FRYREEF, "\n");

  console.log("Minting...");
  
  try {
    // Rarity.Mythic = 4
    const tx = await fryReef.migrationMintFish(VITALIK_ADDRESS, 4);
    console.log("Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("\n✅ Success! Vitalik now owns a Mythic fish!");
    console.log(`🔗 View on Basescan: https://basescan.org/tx/${tx.hash}`);
  } catch (error) {
    console.error("\n❌ Failed:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Done!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
