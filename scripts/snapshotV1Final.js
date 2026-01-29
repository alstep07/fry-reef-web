const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Final V1 snapshot - use known user addresses from previous snapshot
 * Capture ALL current data from V1 contracts
 */

// OLD V1 Contract Addresses (Base mainnet)
const OLD_FRYREEF_ADDRESS = "0xB0feb337d1E867FcB1b68bd438bb1fAC78b996EB";
const OLD_FISH_NFT_ADDRESS = "0xC73cB204010FF33Be2216766167f87e4BaeC0B6B";
const OLD_EGG_NFT_ADDRESS = "0x9Fa8dCcAb21aF36A9f06d78C80c5dB58BF9d4dE0";

async function main() {
  console.log("📸 Creating final V1 snapshot from Base mainnet...\n");

  // Load previous snapshot to get user addresses
  const snapshotDir = path.join(__dirname, "../snapshots");
  const files = fs
    .readdirSync(snapshotDir)
    .filter((f) => f.startsWith("snapshot-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error("No previous snapshot found!");
  }

  const oldSnapshotPath = path.join(snapshotDir, files[0]);
  console.log(`📂 Loading user addresses from: ${files[0]}`);
  const oldSnapshot = JSON.parse(fs.readFileSync(oldSnapshotPath, "utf8"));
  const users = Object.keys(oldSnapshot.users).map(addr => hre.ethers.getAddress(addr.toLowerCase()));
  console.log(`✅ Found ${users.length} users to snapshot (addresses normalized)\n`);

  // Get contract instances
  console.log("Old V1 contracts:");
  console.log(`  FryReef: ${OLD_FRYREEF_ADDRESS}`);
  console.log(`  FishNFT: ${OLD_FISH_NFT_ADDRESS}`);
  console.log(`  EggNFT:  ${OLD_EGG_NFT_ADDRESS}\n`);

  const fryReef = await hre.ethers.getContractAt(
    "FryReef",
    OLD_FRYREEF_ADDRESS,
  );
  const fishNFT = await hre.ethers.getContractAt(
    "FishNFT",
    OLD_FISH_NFT_ADDRESS,
  );
  const eggNFT = await hre.ethers.getContractAt("EggNFT", OLD_EGG_NFT_ADDRESS);

  const snapshot = {
    timestamp: new Date().toISOString(),
    network: "base",
    oldContracts: {
      fryReef: OLD_FRYREEF_ADDRESS,
      fishNFT: OLD_FISH_NFT_ADDRESS,
      eggNFT: OLD_EGG_NFT_ADDRESS,
    },
    users: {},
  };

  console.log("📊 Capturing current V1 user data:\n");

  let totalFish = 0;
  let totalEggs = 0;

  for (const userAddress of users) {
    process.stdout.write(`  ${userAddress.slice(0, 10)}... `);

    try {
      // Get user data from FryReef
      const userData = await fryReef.users(userAddress);

      // Get Fish NFTs
      const fishBalance = Number(await fishNFT.balanceOf(userAddress));
      const fishTokens = [];
      for (let i = 0; i < fishBalance; i++) {
        try {
          const tokenId = await fishNFT.tokenOfOwnerByIndex(userAddress, i);
          const fishData = await fishNFT.fish(tokenId);
          fishTokens.push({
            tokenId: tokenId.toString(),
            rarity: Number(fishData.rarity),
            lastDustCollectedAt: fishData.lastDustCollectedAt
              ? fishData.lastDustCollectedAt.toString()
              : "0",
          });
        } catch (e) {
          console.error(`\n    Error reading fish ${i}:`, e.message);
        }
      }

      // Get Egg NFTs
      const eggBalance = Number(await eggNFT.balanceOf(userAddress));
      const eggTokens = [];
      for (let i = 0; i < eggBalance; i++) {
        try {
          const tokenId = await eggNFT.tokenOfOwnerByIndex(userAddress, i);
          // Try to get egg data, but if it fails just store tokenId
          try {
            const eggData = await eggNFT.eggs(tokenId);
            eggTokens.push({
              tokenId: tokenId.toString(),
              incubationStartedAt: eggData.incubationStartedAt
                ? eggData.incubationStartedAt.toString()
                : "0",
            });
          } catch {
            // Fallback if eggs() mapping doesn't exist in old contract
            eggTokens.push({
              tokenId: tokenId.toString(),
              incubationStartedAt: "0",
            });
          }
        } catch (e) {
          console.error(`\n    Error reading egg ${i}:`, e.message);
        }
      }

      snapshot.users[userAddress] = {
        pearlShards: Number(userData.pearlShards),
        spawnDust: userData.spawnDust.toString(),
        reefCapacity: Number(userData.reefCapacity),
        lastEggLaidAt: userData.lastEggLaidAt.toString(),
        starterPackClaimed: userData.starterPackClaimed,
        fish: fishTokens,
        eggs: eggTokens,
      };

      totalFish += fishBalance;
      totalEggs += eggBalance;

      const ps = Number(userData.pearlShards);
      const sd = Math.floor(Number(userData.spawnDust) / 1e18);
      const cap = Number(userData.reefCapacity);

      process.stdout.write(
        `${fishBalance}🐟 ${eggBalance}🥚 | ${ps}PS ${sd}SD cap:${cap} ✓\n`,
      );
    } catch (error) {
      process.stdout.write(`ERROR: ${error.message}\n`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`📈 Final V1 Snapshot Summary:`);
  console.log(`  Users: ${users.length}`);
  console.log(`  Total Fish NFTs: ${totalFish}`);
  console.log(`  Total Egg NFTs: ${totalEggs}`);
  console.log("=".repeat(80));

  // Save snapshot
  const filename = `snapshot-v1-final-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json`;
  const filepath = path.join(snapshotDir, filename);

  // Custom JSON replacer for BigInt
  const replacer = (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };

  fs.writeFileSync(filepath, JSON.stringify(snapshot, replacer, 2));
  console.log(`\n💾 Snapshot saved: ${filename}`);
  console.log(`\n✅ Ready for clean V2 deployment and migration!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
