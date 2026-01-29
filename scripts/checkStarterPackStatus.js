const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Check starter pack status for all users
 */

async function main() {
  console.log("🔍 Checking starter pack status...\n");

  const FRYREEF_ADDRESS = process.env.NEXT_PUBLIC_FRYREEF_ADDRESS || process.env.NEW_FRYREEF_ADDRESS;
  const fryReef = await hre.ethers.getContractAt("FryReef", FRYREEF_ADDRESS);

  // Load snapshot
  const snapshotPath = path.join(__dirname, "../snapshots/snapshot-v2-migration-final.json");
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  const users = Object.keys(snapshot.users).slice(0, 10); // Check first 10 users

  console.log("USER | Expected | Actual");
  console.log("-".repeat(60));

  for (const userAddress of users) {
    const userData = snapshot.users[userAddress];
    const expected = userData.stats?.starterPackClaimed || false;
    
    try {
      const actual = await fryReef.hasClaimedStarterPack(userAddress.toLowerCase());
      const match = expected === actual ? "✅" : "❌";
      console.log(`${userAddress.slice(0, 10)}... | ${expected ? "YES" : "NO "}     | ${actual ? "YES" : "NO "}     ${match}`);
    } catch (error) {
      console.log(`${userAddress.slice(0, 10)}... | ${expected ? "YES" : "NO "}     | ERROR`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
