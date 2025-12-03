const func = async function (hre) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying FryReef contracts with account:", deployer);

  // 1. Deploy EggNFT
  const eggNFT = await deploy("EggNFT", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("EggNFT deployed to:", eggNFT.address);

  // 2. Deploy FishNFT
  const fishNFT = await deploy("FishNFT", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("FishNFT deployed to:", fishNFT.address);

  // 3. Deploy FryReef (main contract)
  const fryReef = await deploy("FryReef", {
    from: deployer,
    args: [eggNFT.address, fishNFT.address],
    log: true,
    waitConfirmations: 1,
  });
  console.log("FryReef deployed to:", fryReef.address);

  // 4. Set game contract address in EggNFT and FishNFT
  const EggNFT = await hre.ethers.getContractAt("EggNFT", eggNFT.address);
  const FishNFT = await hre.ethers.getContractAt("FishNFT", fishNFT.address);

  console.log("Setting game contract in EggNFT...");
  const tx1 = await EggNFT.setGameContract(fryReef.address);
  await tx1.wait();
  console.log("EggNFT game contract set!");

  console.log("Setting game contract in FishNFT...");
  const tx2 = await FishNFT.setGameContract(fryReef.address);
  await tx2.wait();
  console.log("FishNFT game contract set!");

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("EggNFT:", eggNFT.address);
  console.log("FishNFT:", fishNFT.address);
  console.log("FryReef:", fryReef.address);
  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_FRYREEF_ADDRESS=${fryReef.address}`);
  console.log(`NEXT_PUBLIC_EGG_NFT_ADDRESS=${eggNFT.address}`);
  console.log(`NEXT_PUBLIC_FISH_NFT_ADDRESS=${fishNFT.address}`);
};

func.tags = ["FryReef", "DeployAll"];
func.dependencies = [];

module.exports = func;

