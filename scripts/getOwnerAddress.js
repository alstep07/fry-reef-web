// Get owner address from deployed contract
const hre = require("hardhat");

async function main() {
  const fishNFT = await hre.ethers.getContractAt(
    "FishNFT",
    "0xC73cB204010FF33Be2216766167f87e4BaeC0B6B",
  );

  const owner = await fishNFT.owner();
  console.log("Owner address:", owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
