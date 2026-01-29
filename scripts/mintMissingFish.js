const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Mint only the 2 missing fish - no duplicates
 */

async function main() {
  console.log("🐟 Minting 2 missing fish...\n");

  // Load snapshot
  const snapshotPath = path.join(__dirname, "../snapshots/snapshot-v2-migration-final.json");
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

  const NEW_FISH_NFT = process.env.NEW_FISH_NFT_ADDRESS;
  const NEW_FRYREEF = process.env.NEW_FRYREEF_ADDRESS;

  const fishNFT = await hre.ethers.getContractAt("FishNFT", NEW_FISH_NFT);
  const fryReef = await hre.ethers.getContractAt("FryReef", NEW_FRYREEF);

  // User 1: 0x31437c81fcc48c50dfe7c89e928b81cfa4931cf0 - missing 1 fish (second fish)
  const user1 = "0x31437c81fcc48c50dfe7c89e928b81cfa4931cf0";
  const user1Data = snapshot.users[user1];
  
  console.log("User 1:", user1);
  console.log("  Expected:", user1Data.fish.length, "fish");
  
  const user1Current = Number(await fishNFT.balanceOf(user1));
  console.log("  Current:", user1Current, "fish");
  console.log("  Missing:", user1Data.fish.length - user1Current);
  
  if (user1Current < user1Data.fish.length) {
    // Mint the second fish (index 1)
    const missingFish = user1Data.fish[user1Current];
    console.log(`  → Minting ${getRarityName(missingFish.rarity)} fish...`);
    
    try {
      const tx = await fryReef.migrationMintFish(user1, missingFish.rarity);
      await tx.wait();
      console.log("  ✅ Success!\n");
    } catch (error) {
      console.error("  ❌ Failed:", error.message, "\n");
    }
  } else {
    console.log("  ✅ Already has all fish\n");
  }

  await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay

  // User 2: 0x9ff507683e602590ad1ed484cb3d62cbb564f99a - missing 1 fish (first fish)
  const user2 = "0x9ff507683e602590ad1ed484cb3d62cbb564f99a";
  const user2Data = snapshot.users[user2];
  
  console.log("User 2:", user2);
  console.log("  Expected:", user2Data.fish.length, "fish");
  
  const user2Current = Number(await fishNFT.balanceOf(user2));
  console.log("  Current:", user2Current, "fish");
  console.log("  Missing:", user2Data.fish.length - user2Current);
  
  if (user2Current < user2Data.fish.length) {
    // Mint the first fish (index 0)
    const missingFish = user2Data.fish[0];
    console.log(`  → Minting ${getRarityName(missingFish.rarity)} fish...`);
    
    try {
      const tx = await fryReef.migrationMintFish(user2, missingFish.rarity);
      await tx.wait();
      console.log("  ✅ Success!\n");
    } catch (error) {
      console.error("  ❌ Failed:", error.message, "\n");
    }
  } else {
    console.log("  ✅ Already has all fish\n");
  }

  console.log("=".repeat(60));
  console.log("✅ Done!");
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
