const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Complete migration - mint only missing NFTs
 */

async function main() {
  console.log("🔄 Completing migration (missing NFTs only)...\n");

  // Load snapshot
  const snapshotPath = path.join(__dirname, "../snapshots/snapshot-v2-migration-final.json");
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

  // Get new contract addresses
  const NEW_FISH_NFT = process.env.NEW_FISH_NFT_ADDRESS;
  const NEW_EGG_NFT = process.env.NEW_EGG_NFT_ADDRESS;
  const NEW_FRYREEF = process.env.NEW_FRYREEF_ADDRESS;

  console.log("🆕 Contract Addresses:");
  console.log(`  FishNFT: ${NEW_FISH_NFT}`);
  console.log(`  EggNFT: ${NEW_EGG_NFT}`);
  console.log(`  FryReef: ${NEW_FRYREEF}\n`);

  // Get contracts
  const fishNFT = await hre.ethers.getContractAt("FishNFT", NEW_FISH_NFT);
  const eggNFT = await hre.ethers.getContractAt("EggNFT", NEW_EGG_NFT);
  const fryReef = await hre.ethers.getContractAt("FryReef", NEW_FRYREEF);

  const users = Object.keys(snapshot.users);
  console.log(`👥 Checking ${users.length} users for missing NFTs...\n`);

  let totalFishMinted = 0;
  let totalEggsMinted = 0;

  // Process each user
  for (let i = 0; i < users.length; i++) {
    const userAddress = users[i];
    const userData = snapshot.users[userAddress];

    // Check current balances
    const currentFish = Number(await fishNFT.balanceOf(userAddress));
    const currentEggs = Number(await eggNFT.balanceOf(userAddress));
    
    const expectedFish = userData.fish.length;
    const expectedEggs = userData.eggs.length;
    
    const missingFish = expectedFish - currentFish;
    const missingEggs = expectedEggs - currentEggs;

    if (missingFish > 0 || missingEggs > 0) {
      console.log(`[${i + 1}/${users.length}] ${userAddress}`);
      console.log(`  Missing: ${missingFish} fish, ${missingEggs} eggs`);

      // Mint missing Fish
      if (missingFish > 0) {
        for (let j = 0; j < missingFish && j < userData.fish.length; j++) {
          const fish = userData.fish[currentFish + j];
          try {
            const tx = await fryReef.migrationMintFish(userAddress, fish.rarity);
            await tx.wait();
            totalFishMinted++;
            console.log(`    ✓ Minted ${getRarityName(fish.rarity)} fish`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
          } catch (error) {
            console.error(`    ❌ Failed to mint fish:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay on error
          }
        }
      }

      // Mint missing Eggs
      if (missingEggs > 0) {
        for (let j = 0; j < missingEggs; j++) {
          try {
            const tx = await fryReef.migrationMintEgg(userAddress);
            await tx.wait();
            totalEggsMinted++;
            console.log(`    ✓ Minted egg`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
          } catch (error) {
            console.error(`    ❌ Failed to mint egg:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay on error
          }
        }
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Migration completion finished!\n");
  console.log("📊 Additional NFTs minted:");
  console.log(`  Fish: ${totalFishMinted}`);
  console.log(`  Eggs: ${totalEggsMinted}`);
  console.log("=".repeat(60));
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
