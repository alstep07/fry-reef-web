const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Complete snapshot from V1 contracts (production Base)
 * Captures: NFTs + ALL user resources
 */

// OLD V1 Contract Addresses (Base mainnet)
const OLD_FRYREEF_ADDRESS = "0xB0feb337d1E867FcB1b68bd438bb1fAC78b996EB";
const OLD_FISH_NFT_ADDRESS = "0xC73cB204010FF33Be2216766167f87e4BaeC0B6B";
const OLD_EGG_NFT_ADDRESS = "0x9Fa8dCcAb21aF36A9f06d78C80c5dB58BF9d4dE0";

async function main() {
  console.log("📸 Creating complete V1 snapshot from Base mainnet...\n");
  console.log("Old contracts:");
  console.log(`  FryReef: ${OLD_FRYREEF_ADDRESS}`);
  console.log(`  FishNFT: ${OLD_FISH_NFT_ADDRESS}`);
  console.log(`  EggNFT:  ${OLD_EGG_NFT_ADDRESS}\n`);

  // Get contract instances
  const fryReef = await hre.ethers.getContractAt(
    "FryReef",
    OLD_FRYREEF_ADDRESS,
  );
  const fishNFT = await hre.ethers.getContractAt(
    "FishNFT",
    OLD_FISH_NFT_ADDRESS,
  );
  const eggNFT = await hre.ethers.getContractAt("EggNFT", OLD_EGG_NFT_ADDRESS);

  // Get all users (from events or enumeration)
  const fishTransferFilter = fishNFT.filters.Transfer(null, null, null);
  const eggTransferFilter = eggNFT.filters.Transfer(null, null, null);

  console.log("🔍 Scanning transfer events to find all users...");
  // Use recent blocks only to avoid RPC limits (contracts deployed ~24 hours ago)
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  const startBlock = currentBlock - 50000; // ~7 days on Base

  console.log(`   Scanning blocks ${startBlock} to ${currentBlock}`);
  const [fishTransfers, eggTransfers] = await Promise.all([
    fishNFT.queryFilter(fishTransferFilter, startBlock, "latest"),
    eggNFT.queryFilter(eggTransferFilter, startBlock, "latest"),
  ]);

  const userSet = new Set();
  fishTransfers.forEach((event) => {
    if (event.args.to !== "0x0000000000000000000000000000000000000000") {
      userSet.add(event.args.to);
    }
  });
  eggTransfers.forEach((event) => {
    if (event.args.to !== "0x0000000000000000000000000000000000000000") {
      userSet.add(event.args.to);
    }
  });

  const users = Array.from(userSet);
  console.log(`✅ Found ${users.length} unique users\n`);

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

  console.log("📊 Capturing user data:\n");

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
        const tokenId = await fishNFT.tokenOfOwnerByIndex(userAddress, i);
        const fishData = await fishNFT.fish(tokenId);
        fishTokens.push({
          tokenId: tokenId.toString(),
          rarity: Number(fishData.rarity),
          lastDustCollectedAt: fishData.lastDustCollectedAt.toString(),
        });
      }

      // Get Egg NFTs
      const eggBalance = Number(await eggNFT.balanceOf(userAddress));
      const eggTokens = [];
      for (let i = 0; i < eggBalance; i++) {
        const tokenId = await eggNFT.tokenOfOwnerByIndex(userAddress, i);
        const eggData = await eggNFT.eggs(tokenId);
        eggTokens.push({
          tokenId: tokenId.toString(),
          incubationStartedAt: eggData.incubationStartedAt
            ? eggData.incubationStartedAt.toString()
            : "0",
        });
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

      process.stdout.write(`${fishBalance} fish, ${eggBalance} eggs ✓\n`);
    } catch (error) {
      process.stdout.write(`ERROR: ${error.message}\n`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`📈 Snapshot Summary:`);
  console.log(`  Users: ${users.length}`);
  console.log(`  Total Fish: ${totalFish}`);
  console.log(`  Total Eggs: ${totalEggs}`);
  console.log("=".repeat(80));

  // Save snapshot
  const snapshotDir = path.join(__dirname, "../snapshots");
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const filename = `snapshot-v1-complete-${new Date()
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
  console.log(`\n✅ Ready for V2 deployment and migration!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
