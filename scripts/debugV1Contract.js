const hre = require("hardhat");

/**
 * Debug V1 contract structure
 */

const OLD_FRYREEF_ADDRESS = "0xB0feb337d1E867FcB1b68bd438bb1fAC78b996EB";
const TEST_USER = "0x96B92Cd9C90A6184D67cD1964Fb33D1A18e23eA0"; // Checksummed address

async function main() {
  console.log("🔍 Debugging V1 contract structure...\n");

  const fryReef = await hre.ethers.getContractAt("FryReef", OLD_FRYREEF_ADDRESS);

  console.log("Testing with user:", TEST_USER);
  
  try {
    const userData = await fryReef.users(TEST_USER);
    console.log("\n✅ userData returned:", userData);
    console.log("\nField types:");
    console.log("  - Type:", typeof userData);
    console.log("  - Length:", userData.length);
    console.log("  - [0]:", userData[0], typeof userData[0]);
    console.log("  - [1]:", userData[1], typeof userData[1]);
    console.log("  - [2]:", userData[2], typeof userData[2]);
    console.log("  - [3]:", userData[3], typeof userData[3]);
    console.log("  - [4]:", userData[4], typeof userData[4]);
    
    // Try named properties
    console.log("\nNamed properties:");
    console.log("  - pearlShards:", userData.pearlShards);
    console.log("  - spawnDust:", userData.spawnDust);
    console.log("  - reefCapacity:", userData.reefCapacity);
    console.log("  - lastEggLaidAt:", userData.lastEggLaidAt);
    console.log("  - starterPackClaimed:", userData.starterPackClaimed);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
