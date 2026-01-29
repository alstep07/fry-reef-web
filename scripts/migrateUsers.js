const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Migration script - restores user state after new contract deployment
 *
 * Steps:
 * 1. Load snapshot data
 * 2. Re-mint all Fish NFTs to original owners
 * 3. Re-mint all Egg NFTs to original owners
 * 4. No need to restore resources (handled by FryReef pointer update)
 */

async function main() {
  console.log("🔄 Starting user migration...\n");

  // Find latest snapshot
  const snapshotDir = path.join(__dirname, "../snapshots");
  if (!fs.existsSync(snapshotDir)) {
    console.error("❌ No snapshots directory found");
    process.exit(1);
  }

  const files = fs
    .readdirSync(snapshotDir)
    .filter((f) => f.startsWith("snapshot-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("❌ No snapshot files found");
    process.exit(1);
  }

  const snapshotPath = path.join(snapshotDir, files[0]);
  console.log(`📂 Using latest snapshot: ${files[0]}\n`);

  console.log(`📂 Loading snapshot from: ${snapshotPath}`);
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

  console.log(`📅 Snapshot date: ${snapshot.timestamp}`);
  console.log(`📦 Block number: ${snapshot.blockNumber}\n`);

  // Get new contract addresses
  const NEW_FISH_NFT = process.env.NEW_FISH_NFT_ADDRESS;
  const NEW_EGG_NFT = process.env.NEW_EGG_NFT_ADDRESS;
  const NEW_FRYREEF = process.env.NEW_FRYREEF_ADDRESS;

  if (!NEW_FISH_NFT || !NEW_EGG_NFT || !NEW_FRYREEF) {
    console.error("❌ Missing NEW contract addresses in .env");
    console.log(
      "Required: NEW_FISH_NFT_ADDRESS, NEW_EGG_NFT_ADDRESS, NEW_FRYREEF_ADDRESS",
    );
    process.exit(1);
  }

  console.log("🆕 New Contract Addresses:");
  console.log(`  FishNFT: ${NEW_FISH_NFT}`);
  console.log(`  EggNFT: ${NEW_EGG_NFT}`);
  console.log(`  FryReef: ${NEW_FRYREEF}\n`);

  // Get contracts
  const fishNFT = await hre.ethers.getContractAt("FishNFT", NEW_FISH_NFT);
  const eggNFT = await hre.ethers.getContractAt("EggNFT", NEW_EGG_NFT);
  const fryReef = await hre.ethers.getContractAt("FryReef", NEW_FRYREEF);

  const users = Object.keys(snapshot.users);
  console.log(`👥 Migrating ${users.length} users...\n`);

  let totalFishMinted = 0;
  let totalEggsMinted = 0;
  let totalUsersRestored = 0;

  // Process each user
  for (let i = 0; i < users.length; i++) {
    const userAddress = users[i];
    const userData = snapshot.users[userAddress];

    console.log(`[${i + 1}/${users.length}] Processing ${userAddress}...`);

    // Migrate Fish NFTs
    if (userData.fish.length > 0) {
      console.log(`  🐟 Migrating ${userData.fish.length} fish...`);

      for (const fish of userData.fish) {
        // Re-mint fish with same rarity via FryReef
        // Note: New tokenIds will be different, but owner and rarity preserved
        try {
          const tx = await fryReef.migrationMintFish(userAddress, fish.rarity);
          await tx.wait();
          totalFishMinted++;
          console.log(`    ✓ Minted ${getRarityName(fish.rarity)} fish`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
        } catch (error) {
          console.error(`    ❌ Failed to mint fish:`, error.message);
        }
      }
    }

    // Migrate Egg NFTs
    if (userData.eggs.length > 0) {
      console.log(`  🥚 Migrating ${userData.eggs.length} eggs...`);

      for (const egg of userData.eggs) {
        // Re-mint eggs via FryReef
        try {
          const tx = await fryReef.migrationMintEgg(userAddress);
          await tx.wait();
          totalEggsMinted++;
          console.log(`    ✓ Minted egg`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
        } catch (error) {
          console.error(`    ❌ Failed to mint egg:`, error.message);
        }
      }
    }

    // Restore user resources in FryReef
    console.log(`  💎 Restoring resources...`);
    try {
      const tx = await fryReef.restoreUserData(
        userAddress,
        userData.resources.pearlShards,
        userData.resources.spawnDust,
        userData.resources.reefCapacity,
        userData.stats.currentStreak,
        userData.stats.totalCheckIns,
        userData.stats.lastCheckIn,
        userData.stats.starterPackClaimed,
      );
      await tx.wait();
      totalUsersRestored++;
      console.log(
        `    ✓ PS: ${userData.resources.pearlShards}, SD: ${userData.resources.spawnDust}, Capacity: ${userData.resources.reefCapacity}`,
      );
    } catch (error) {
      console.error(`    ❌ Failed to restore resources:`, error.message);
    }

    console.log();
  }

  console.log("✅ Migration completed!\n");
  console.log("📊 Summary:");
  console.log(`  - Users migrated: ${users.length}`);
  console.log(`  - Fish minted: ${totalFishMinted}`);
  console.log(`  - Eggs minted: ${totalEggsMinted}`);
  console.log(`  - Resources restored: ${totalUsersRestored}`);
}

function getRarityName(rarity) {
  const names = ["Common", "Rare", "Epic", "Legendary", "Mythic"];
  return names[rarity] || "Unknown";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
