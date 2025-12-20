const func = async function (hre) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying FryReef contracts with account:", deployer);

  const reuseEggNFT = process.env.REUSE_EGG_NFT_ADDRESS;
  const reuseFishNFT = process.env.REUSE_FISH_NFT_ADDRESS;

  let eggNFT;
  if (reuseEggNFT && hre.ethers.isAddress(reuseEggNFT)) {
    console.log("Reusing existing EggNFT at:", reuseEggNFT);
    eggNFT = { address: reuseEggNFT };
  } else {
    eggNFT = await deploy("EggNFT", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
    });
  }
  console.log("EggNFT address:", eggNFT.address);

  let fishNFT;
  if (reuseFishNFT && hre.ethers.isAddress(reuseFishNFT)) {
    console.log("Reusing existing FishNFT at:", reuseFishNFT);
    fishNFT = { address: reuseFishNFT };
  } else {
    fishNFT = await deploy("FishNFT", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
    });
  }
  console.log("FishNFT address:", fishNFT.address);

  const deployOptions = {
    from: deployer,
    args: [eggNFT.address, fishNFT.address],
    log: true,
    waitConfirmations: 1,
  };

  // ✅ ethers v6 — корректное увеличение gasPrice (опционально)
  const feeData = await hre.ethers.provider.getFeeData();
  if (feeData.gasPrice) {
    deployOptions.gasPrice = (feeData.gasPrice * 110n) / 100n;
  }

  const fryReef = await deploy("FryReef", deployOptions);
  console.log("FryReef deployed to:", fryReef.address);

  const EggNFT = await hre.ethers.getContractAt("EggNFT", eggNFT.address);
  const FishNFT = await hre.ethers.getContractAt("FishNFT", fishNFT.address);

  const currentEggGame = await EggNFT.gameContract();
  const currentFishGame = await FishNFT.gameContract();

  if (currentEggGame.toLowerCase() !== fryReef.address.toLowerCase()) {
    console.log("Setting game contract in EggNFT...");
    const tx = await EggNFT.setGameContract(fryReef.address);
    await tx.wait();
  }

  if (currentFishGame.toLowerCase() !== fryReef.address.toLowerCase()) {
    console.log("Setting game contract in FishNFT...");
    const tx = await FishNFT.setGameContract(fryReef.address);
    await tx.wait();
  }

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("EggNFT:", eggNFT.address);
  console.log("FishNFT:", fishNFT.address);
  console.log("FryReef:", fryReef.address);
};

func.tags = ["FryReef", "DeployAll"];
module.exports = func;
