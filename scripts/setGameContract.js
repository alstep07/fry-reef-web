const hre = require("hardhat");

async function main() {
  const FISH_NFT_ADDRESS = "0xC73cB204010FF33Be2216766167f87e4BaeC0B6B";
  const FRYREEF_ADDRESS = "0xB0feb337d1E867FcB1b68bd438bb1fAC78b996EB";

  console.log("Setting game contract in FishNFT...");

  const FishNFT = await hre.ethers.getContractAt("FishNFT", FISH_NFT_ADDRESS);
  
  const tx = await FishNFT.setGameContract(FRYREEF_ADDRESS);
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ FishNFT game contract set to:", FRYREEF_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
