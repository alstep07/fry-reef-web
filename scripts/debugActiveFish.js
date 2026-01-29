const hre = require("hardhat");

async function main() {
  // Your wallet address
  const userAddress = "YOUR_WALLET_ADDRESS"; // Replace with your actual address

  const fryReefAddress = process.env.NEW_FRYREEF_ADDRESS;
  const fishNFTAddress = process.env.NEW_FISH_NFT_ADDRESS;

  console.log("Checking active fish for:", userAddress);
  console.log("FryReef:", fryReefAddress);
  console.log("FishNFT:", fishNFTAddress);
  console.log("---");

  const fryReef = await hre.ethers.getContractAt("FryReef", fryReefAddress);
  const fishNFT = await hre.ethers.getContractAt("FishNFT", fishNFTAddress);

  // Get user data
  const userData = await fryReef.getUserData(userAddress);
  console.log("User reef capacity:", userData.reefCapacity.toString());

  // Get fish owned
  const fishIds = await fishNFT.getFishByOwner(userAddress);
  console.log(
    "Fish IDs owned:",
    fishIds.map((id) => id.toString()),
  );
  console.log("Total fish count:", fishIds.length);

  // Get active fish count
  const activeFishCount = await fryReef.getActiveFishCount(userAddress);
  console.log("Active fish count from contract:", activeFishCount.toString());

  // Get active fish IDs
  const activeFishIds = await fryReef.getActiveFish(userAddress);
  console.log(
    "Active fish IDs:",
    activeFishIds.map((id) => id.toString()),
  );

  // Check each fish
  console.log("\n--- Individual Fish Check ---");
  for (let i = 0; i < fishIds.length; i++) {
    const fishId = fishIds[i];
    const isActive = await fryReef.isFishActive(userAddress, fishId);
    const fishInfo = await fishNFT.getFishInfo(fishId);
    console.log(
      `Fish #${fishId}: ${isActive ? "ACTIVE" : "INACTIVE"} (rarity: ${
        fishInfo.rarity
      })`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
