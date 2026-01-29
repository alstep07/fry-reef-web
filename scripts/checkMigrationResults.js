const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Check migration results - compare snapshot vs current state
 */

async function main() {
  console.log("🔍 Checking migration results...\n");

  // Load snapshot
  const snapshotDir = path.join(__dirname, "../snapshots");
  const files = fs
    .readdirSync(snapshotDir)
    .filter((f) => f.startsWith("snapshot-") && f.endsWith(".json"))
    .sort()
    .reverse();

  const snapshotPath = path.join(snapshotDir, files[0]);
  console.log(`📂 Loading snapshot: ${files[0]}\n`);
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

  // Get contracts
  const FISH_NFT_ADDRESS = process.env.NEW_FISH_NFT_ADDRESS;
  const EGG_NFT_ADDRESS = process.env.NEW_EGG_NFT_ADDRESS;

  const fishNFT = await hre.ethers.getContractAt("FishNFT", FISH_NFT_ADDRESS);
  const eggNFT = await hre.ethers.getContractAt("EggNFT", EGG_NFT_ADDRESS);

  console.log("📊 Comparing snapshot vs current state:\n");
  console.log("USER | FISH (expected → actual) | EGGS (expected → actual)");
  console.log("-".repeat(80));

  const users = Object.keys(snapshot.users);
  let totalExpectedFish = 0;
  let totalActualFish = 0;
  let totalExpectedEggs = 0;
  let totalActualEggs = 0;
  let usersWithExtra = [];

  for (const userAddress of users) {
    const userData = snapshot.users[userAddress];
    const expectedFish = userData.fish.length;
    const expectedEggs = userData.eggs.length;

    const actualFish = Number(await fishNFT.balanceOf(userAddress));
    const actualEggs = Number(await eggNFT.balanceOf(userAddress));

    totalExpectedFish += expectedFish;
    totalActualFish += actualFish;
    totalExpectedEggs += expectedEggs;
    totalActualEggs += actualEggs;

    const fishDiff = actualFish - expectedFish;
    const eggsDiff = actualEggs - expectedEggs;

    if (fishDiff > 0 || eggsDiff > 0) {
      usersWithExtra.push({
        address: userAddress,
        fishDiff,
        eggsDiff,
        expectedFish,
        actualFish,
        expectedEggs,
        actualEggs,
      });
    }

    const fishStr =
      fishDiff > 0
        ? `${expectedFish} → ${actualFish} (+${fishDiff})`
        : `${expectedFish} → ${actualFish}`;
    const eggsStr =
      eggsDiff > 0
        ? `${expectedEggs} → ${actualEggs} (+${eggsDiff})`
        : `${expectedEggs} → ${actualEggs}`;

    console.log(
      `${userAddress.slice(0, 8)}... | ${fishStr.padEnd(20)} | ${eggsStr}`,
    );
  }

  console.log("-".repeat(80));
  console.log(`\n📈 Summary:`);
  console.log(
    `  Fish: ${totalExpectedFish} expected → ${totalActualFish} actual (${
      totalActualFish - totalExpectedFish > 0 ? "+" : ""
    }${totalActualFish - totalExpectedFish})`,
  );
  console.log(
    `  Eggs: ${totalExpectedEggs} expected → ${totalActualEggs} actual (${
      totalActualEggs - totalExpectedEggs > 0 ? "+" : ""
    }${totalActualEggs - totalExpectedEggs})`,
  );

  if (usersWithExtra.length > 0) {
    console.log(`\n⚠️  ${usersWithExtra.length} users have EXTRA NFTs:`);
    for (const user of usersWithExtra) {
      console.log(
        `  ${user.address.slice(0, 10)}... +${user.fishDiff} fish, +${
          user.eggsDiff
        } eggs`,
      );
    }
  } else {
    console.log(`\n✅ All users have correct NFT counts!`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
