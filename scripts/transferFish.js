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
  // Get arguments from environment variables
  let fromAddress = process.env.TRANSFER_FROM || null;
  let toAddress = process.env.TRANSFER_TO || null;
  let tokenId = process.env.TRANSFER_TOKEN_ID ? parseInt(process.env.TRANSFER_TOKEN_ID) : null;
  let tokenIds = process.env.TRANSFER_TOKEN_IDS ? process.env.TRANSFER_TOKEN_IDS.split(",").map(id => parseInt(id.trim())) : null;
  
  console.log("Environment variables:");
  console.log("  TRANSFER_FROM:", fromAddress || "not set");
  console.log("  TRANSFER_TO:", toAddress || "not set");
  console.log("  TRANSFER_TOKEN_ID:", tokenId !== null ? tokenId : "not set");
  console.log("  TRANSFER_TOKEN_IDS:", tokenIds ? tokenIds.join(", ") : "not set");

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
    console.log("\n📖 Usage with environment variables (PowerShell):");
    console.log("  # Transfer single fish:");
    console.log('  $env:TRANSFER_FROM="0x..."; $env:TRANSFER_TO="0x..."; $env:TRANSFER_TOKEN_ID="5"; npx hardhat run scripts/transferFish.js --network baseSepolia');
    console.log("\n  # Transfer multiple fish:");
    console.log('  $env:TRANSFER_FROM="0x..."; $env:TRANSFER_TO="0x..."; $env:TRANSFER_TOKEN_IDS="1,2,3"; npx hardhat run scripts/transferFish.js --network baseSepolia');
    console.log("\nExamples:");
    console.log("  # Transfer fish #5 from 0x1234... to 0x5678...");
    console.log('  $env:TRANSFER_FROM="0x1234..."; $env:TRANSFER_TO="0x5678..."; $env:TRANSFER_TOKEN_ID="5"; npx hardhat run scripts/transferFish.js --network baseSepolia');
    console.log("\n  # Transfer fish #1, #2, #3 from 0x1234... to 0x5678...");
    console.log('  $env:TRANSFER_FROM="0x1234..."; $env:TRANSFER_TO="0x5678..."; $env:TRANSFER_TOKEN_IDS="1,2,3"; npx hardhat run scripts/transferFish.js --network baseSepolia');
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
      console.log("  Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("  ✅ Transaction confirmed in block:", receipt.blockNumber);
      console.log("  Gas used:", receipt.gasUsed.toString());
      
      // Wait a bit for state to update
      console.log("  Waiting for state to update...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify transfer
      const newOwner = await fishNFT.ownerOf(tokenId);
      console.log("\n  Verification:");
      console.log("    Expected owner:", toAddress);
      console.log("    Actual owner:", newOwner);
      
      if (newOwner.toLowerCase() === toAddress.toLowerCase()) {
        console.log("\n✅ Success! Fish transferred successfully.");
      } else {
        console.error("\n❌ Error: Transfer verification failed!");
        console.error("   Expected:", toAddress);
        console.error("   Got:", newOwner);
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
      console.log("  Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("  ✅ Transaction confirmed in block:", receipt.blockNumber);
      console.log("  Gas used:", receipt.gasUsed.toString());
      
      // Wait a bit for state to update
      console.log("\n  Waiting for state to update...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify transfers
      console.log("\n  Verifying transfers...");
      let allSuccess = true;
      for (const id of tokenIds) {
        const newOwner = await fishNFT.ownerOf(id);
        const expectedLower = toAddress.toLowerCase();
        const actualLower = newOwner.toLowerCase();
        
        console.log(`  Fish #${id}:`);
        console.log(`    Expected owner: ${toAddress}`);
        console.log(`    Actual owner: ${newOwner}`);
        
        if (actualLower !== expectedLower) {
          console.error(`    ❌ Transfer verification failed!`);
          allSuccess = false;
        } else {
          console.log(`    ✅ Transferred successfully`);
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

