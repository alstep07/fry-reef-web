const hre = require("hardhat");

async function main() {
  const EGG_NFT_ADDRESS = "0x9Fa8dCcAb21aF36A9f06d78C80c5dB58BF9d4dE0";
  const FISH_NFT_ADDRESS = "0xC73cB204010FF33Be2216766167f87e4BaeC0B6B";
  const FRYREEF_ADDRESS = "0xB0feb337d1E867FcB1b68bd438bb1fAC78b996EB";

  const EggNFT = await hre.ethers.getContractAt("EggNFT", EGG_NFT_ADDRESS);
  const FishNFT = await hre.ethers.getContractAt("FishNFT", FISH_NFT_ADDRESS);

  const eggGameContract = await EggNFT.gameContract();
  const fishGameContract = await FishNFT.gameContract();

  console.log("Expected FryReef:", FRYREEF_ADDRESS);
  console.log("");
  console.log("EggNFT gameContract:", eggGameContract);
  console.log("EggNFT status:", eggGameContract.toLowerCase() === FRYREEF_ADDRESS.toLowerCase() ? "✅ OK" : "❌ NOT SET");
  console.log("");
  console.log("FishNFT gameContract:", fishGameContract);
  console.log("FishNFT status:", fishGameContract.toLowerCase() === FRYREEF_ADDRESS.toLowerCase() ? "✅ OK" : "❌ NOT SET");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
