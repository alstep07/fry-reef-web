const hre = require("hardhat");

/**
 * Script to transfer fish to another address (admin only)
 * 
 * Usage:
 *   npx hardhat run scripts/transferFish.js --network baseSepolia -- --from 0x... --to 0x... --tokenId 1
 * 
 * Or batch transfer:
 *   npx hardhat run scripts/transferFish.js --network baseSepolia -- --from 0x... --to 0x... --tokenIds 1,2,3
 */

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let fromAddress = null;
  let toAddress = null;
  let tokenId = null;
  let tokenIds = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--from" && args[i + 1]) {
      fromAddress = args[i + 1];
      i++;
    } else if (args[i] === "--to" && args[i + 1]) {
      toAddress = args[i + 1];
      i++;
    } else if (args[i] === "--tokenId" && args[i + 1]) {
      tokenId = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === "--tokenIds" && args[i + 1]) {
      tokenIds = args[i + 1].split(",").map(id => parseInt(id.trim()));
      i++;
    }
  }

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Get contract address from deployments
  const FishNFT = await hre.deployments.get("FishNFT");
  const fishNFT = await hre.ethers.getContractAt("FishNFT", FishNFT.address);

  console.log("\nFishNFT address:", FishNFT.address);

  // Check if deployer is owner
  const owner = await fishNFT.owner();
  console.log("Contract owner:", owner);
  
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ Error: Deployer is not the contract owner!");
    console.error("   Deployer:", deployer.address);
    console.error("   Owner:", owner);
    process.exit(1);
  }

  // If no arguments provided, show usage
  if (!fromAddress || !toAddress || (!tokenId && !tokenIds)) {
    console.log("\n📖 Usage:");
    console.log("  # Transfer single fish:");
    console.log("  npx hardhat run scripts/transferFish.js --network baseSepolia -- --from <fromAddress> --to <toAddress> --tokenId <tokenId>");
    console.log("\n  # Transfer multiple fish:");
    console.log("  npx hardhat run scripts/transferFish.js --network baseSepolia -- --from <fromAddress> --to <toAddress> --tokenIds <id1,id2,id3>");
    console.log("\nExamples:");
    console.log("  # Transfer fish #5 from 0x1234... to 0x5678...");
    console.log("  npx hardhat run scripts/transferFish.js --network baseSepolia -- --from 0x1234... --to 0x5678... --tokenId 5");
    console.log("\n  # Transfer fish #1, #2, #3 from 0x1234... to 0x5678...");
    console.log("  npx hardhat run scripts/transferFish.js --network baseSepolia -- --from 0x1234... --to 0x5678... --tokenIds 1,2,3");
    process.exit(0);
  }

  // Validate addresses
  if (!hre.ethers.isAddress(fromAddress)) {
    console.error("❌ Error: Invalid from address:", fromAddress);
    process.exit(1);
  }

  if (!hre.ethers.isAddress(toAddress)) {
    console.error("❌ Error: Invalid to address:", toAddress);
    process.exit(1);
  }

  try {
    if (tokenId !== null) {
      // Single transfer
      console.log("\n🎣 Transferring fish:");
      console.log("  From:", fromAddress);
      console.log("  To:", toAddress);
      console.log("  Token ID:", tokenId);

      // Check current owner
      const currentOwner = await fishNFT.ownerOf(tokenId);
      console.log("  Current owner:", currentOwner);
      
      if (currentOwner.toLowerCase() !== fromAddress.toLowerCase()) {
        console.error("❌ Error: Fish is not owned by the 'from' address!");
        console.error("   Expected:", fromAddress);
        console.error("   Actual:", currentOwner);
        process.exit(1);
      }

      console.log("\n⏳ Transferring...");
      const tx = await fishNFT.adminTransfer(fromAddress, toAddress, tokenId);
      console.log("  Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("  ✅ Transaction confirmed in block:", receipt.blockNumber);
      
      // Verify transfer
      const newOwner = await fishNFT.ownerOf(tokenId);
      console.log("  New owner:", newOwner);
      
      if (newOwner.toLowerCase() === toAddress.toLowerCase()) {
        console.log("\n✅ Success! Fish transferred successfully.");
      } else {
        console.error("\n❌ Error: Transfer verification failed!");
      }
    } else if (tokenIds && tokenIds.length > 0) {
      // Batch transfer
      console.log("\n🎣 Transferring fish batch:");
      console.log("  From:", fromAddress);
      console.log("  To:", toAddress);
      console.log("  Token IDs:", tokenIds.join(", "));

      // Check current owners
      console.log("\n  Checking ownership...");
      for (const id of tokenIds) {
        const currentOwner = await fishNFT.ownerOf(id);
        if (currentOwner.toLowerCase() !== fromAddress.toLowerCase()) {
          console.error(`❌ Error: Fish #${id} is not owned by the 'from' address!`);
          console.error("   Expected:", fromAddress);
          console.error("   Actual:", currentOwner);
          process.exit(1);
        }
      }

      console.log("\n⏳ Transferring batch...");
      const tx = await fishNFT.adminTransferBatch(fromAddress, toAddress, tokenIds);
      console.log("  Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("  ✅ Transaction confirmed in block:", receipt.blockNumber);
      
      // Verify transfers
      console.log("\n  Verifying transfers...");
      let allSuccess = true;
      for (const id of tokenIds) {
        const newOwner = await fishNFT.ownerOf(id);
        if (newOwner.toLowerCase() !== toAddress.toLowerCase()) {
          console.error(`  ❌ Fish #${id}: Transfer verification failed!`);
          allSuccess = false;
        } else {
          console.log(`  ✅ Fish #${id}: Transferred successfully`);
        }
      }
      
      if (allSuccess) {
        console.log("\n✅ Success! All fish transferred successfully.");
      } else {
        console.error("\n❌ Error: Some transfers failed verification!");
      }
    }
  } catch (error) {
    console.error("\n❌ Error transferring fish:", error.message);
    if (error.reason) {
      console.error("   Reason:", error.reason);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

