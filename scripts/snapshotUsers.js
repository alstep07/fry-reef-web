const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Snapshot script - saves current state of all users before migration
 *
 * Captures:
 * - All Fish NFTs (tokenId, owner, rarity, stats)
 * - All Egg NFTs (tokenId, owner, incubation status)
 * - User resources (Pearl Shards, Spawn Dust, reef capacity)
 */

async function main() {
  console.log("📸 Starting user snapshot...\n");

  // Load contract addresses from deployments
  const fishDeployment = require("../deployments/base/FishNFT.json");
  const eggDeployment = require("../deployments/base/EggNFT.json");
  const fryReefDeployment = require("../deployments/base/FryReef.json");

  const FISH_NFT_ADDRESS = fishDeployment.address;
  const EGG_NFT_ADDRESS = eggDeployment.address;
  const FRYREEF_ADDRESS = fryReefDeployment.address;

  if (!FISH_NFT_ADDRESS || !EGG_NFT_ADDRESS || !FRYREEF_ADDRESS) {
    console.error("❌ Missing contract addresses in deployments");
    process.exit(1);
  }

  console.log("📋 Contract Addresses:");
  console.log(`  FishNFT: ${FISH_NFT_ADDRESS}`);
  console.log(`  EggNFT: ${EGG_NFT_ADDRESS}`);
  console.log(`  FryReef: ${FRYREEF_ADDRESS}\n`);

  // Get contracts
  const fishNFT = await hre.ethers.getContractAt("FishNFT", FISH_NFT_ADDRESS);
  const eggNFT = await hre.ethers.getContractAt("EggNFT", EGG_NFT_ADDRESS);
  const fryReef = await hre.ethers.getContractAt("FryReef", FRYREEF_ADDRESS);

  // Get total supply
  const totalFish = await fishNFT.totalSupply();
  const totalEggs = await eggNFT.totalSupply();

  console.log("📊 Total Supply:");
  console.log(`  Fish: ${totalFish}`);
  console.log(`  Eggs: ${totalEggs}\n`);

  // Collect all unique users
  const usersSet = new Set();

  // Get fish owners
  console.log("🐟 Collecting Fish NFT owners...");
  for (let i = 0; i < totalFish; i++) {
    const tokenId = await fishNFT.tokenByIndex(i);
    const owner = await fishNFT.ownerOf(tokenId);
    usersSet.add(owner.toLowerCase());
  }

  // Get egg owners
  console.log("🥚 Collecting Egg NFT owners...");
  for (let i = 0; i < totalEggs; i++) {
    const tokenId = await eggNFT.tokenByIndex(i);
    const owner = await eggNFT.ownerOf(tokenId);
    usersSet.add(owner.toLowerCase());
  }

  const users = Array.from(usersSet);
  console.log(`\n👥 Found ${users.length} unique users\n`);

  // Snapshot data structure
  const snapshot = {
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    contracts: {
      fishNFT: FISH_NFT_ADDRESS,
      eggNFT: EGG_NFT_ADDRESS,
      fryReef: FRYREEF_ADDRESS,
    },
    totalSupply: {
      fish: totalFish.toString(),
      eggs: totalEggs.toString(),
    },
    users: {},
  };

  // Collect data for each user
  console.log("💾 Collecting user data...");
  for (const userAddress of users) {
    console.log(`  Processing ${userAddress}...`);

    // Get user info from FryReef
    const userInfo = await fryReef.getUserInfo(userAddress);

    // Get user's fish
    const fishBalance = await fishNFT.balanceOf(userAddress);
    const userFish = [];

    for (let i = 0; i < fishBalance; i++) {
      const tokenId = await fishNFT.tokenOfOwnerByIndex(userAddress, i);
      const fishInfo = await fishNFT.getFishInfo(tokenId);

      userFish.push({
        tokenId: tokenId.toString(),
        rarity: fishInfo.rarity,
        mintedAt: fishInfo.mintedAt.toString(),
        lastDustCollectedAt: fishInfo.lastDustCollectedAt.toString(),
        lastEggLaidAt: fishInfo.lastEggLaidAt.toString(),
      });
    }

    // Get user's eggs
    const eggBalance = await eggNFT.balanceOf(userAddress);
    const userEggs = [];

    for (let i = 0; i < eggBalance; i++) {
      const tokenId = await eggNFT.tokenOfOwnerByIndex(userAddress, i);
      const eggInfo = await eggNFT.getEggInfo(tokenId);

      userEggs.push({
        tokenId: tokenId.toString(),
        isIncubating: eggInfo.isIncubating,
        incubationStartTime: eggInfo.incubationStartedAt
          ? eggInfo.incubationStartedAt.toString()
          : "0",
      });
    }

    // Store user data
    snapshot.users[userAddress] = {
      resources: {
        pearlShards: userInfo.pearlShards.toString(),
        spawnDust: userInfo.spawnDust.toString(),
        reefCapacity: userInfo.reefCapacity.toString(),
      },
      stats: {
        currentStreak: userInfo.currentStreak.toString(),
        totalCheckIns: userInfo.totalCheckIns.toString(),
        lastCheckIn: userInfo.lastCheckIn.toString(),
        starterPackClaimed: userInfo.starterPackClaimed,
      },
      fish: userFish,
      eggs: userEggs,
    };
  }

  // Save snapshot to file
  const snapshotDir = path.join(__dirname, "../snapshots");
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `snapshot-${timestamp}.json`;
  const filepath = path.join(snapshotDir, filename);

  // Custom replacer to handle BigInt
  const replacer = (key, value) => {
    return typeof value === "bigint" ? value.toString() : value;
  };

  fs.writeFileSync(filepath, JSON.stringify(snapshot, replacer, 2));

  console.log("\n✅ Snapshot completed!");
  console.log(`📁 Saved to: ${filepath}`);
  console.log(`\n📊 Summary:`);
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Total Fish: ${totalFish}`);
  console.log(`  - Total Eggs: ${totalEggs}`);
  console.log(`  - Block: ${snapshot.blockNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
