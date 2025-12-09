const hre = require("hardhat");

/**
 * Script to mint fish with specified rarity for testing (admin only)
 * 
 * Usage:
 *   npx hardhat run scripts/mintFish.js --network baseSepolia
 * 
 * Or with parameters:
 *   npx hardhat run scripts/mintFish.js --network baseSepolia -- --to 0x... --rarity 0 --amount 1
 */

async function main() {
  // Get arguments from environment variables first
  let toAddress = process.env.MINT_TO || null;
  let rarity = process.env.MINT_RARITY ? parseInt(process.env.MINT_RARITY) : null;
  let amount = process.env.MINT_AMOUNT ? parseInt(process.env.MINT_AMOUNT) : 1;
  
  console.log("Environment variables:");
  console.log("  MINT_TO:", toAddress || "not set");
  console.log("  MINT_RARITY:", rarity !== null ? rarity : "not set");
  console.log("  MINT_AMOUNT:", amount);
  
  // If env vars not set, show usage
  if (!toAddress || rarity === null) {
    console.log("\n📖 Usage with environment variables (PowerShell):");
    console.log('  $env:MINT_TO="0x..."; $env:MINT_RARITY="0"; $env:MINT_AMOUNT="1"; npx hardhat run scripts/mintFish.js --network baseSepolia');
    console.log("\n📖 Usage with environment variables (Bash):");
    console.log('  MINT_TO=0x... MINT_RARITY=0 MINT_AMOUNT=1 npx hardhat run scripts/mintFish.js --network baseSepolia');
    console.log("\nRarity values:");
    console.log("  0 = Common");
    console.log("  1 = Rare");
    console.log("  2 = Epic");
    console.log("  3 = Legendary");
    console.log("  4 = Mythic");
    console.log("\nExamples:");
    console.log("  # Mint 1 Common fish");
    console.log('  $env:MINT_TO="0x1234..."; $env:MINT_RARITY="0"; npx hardhat run scripts/mintFish.js --network baseSepolia');
    console.log("\n  # Mint 5 Rare fish");
    console.log('  $env:MINT_TO="0x1234..."; $env:MINT_RARITY="1"; $env:MINT_AMOUNT="5"; npx hardhat run scripts/mintFish.js --network baseSepolia');
    process.exit(0);
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
  if (!toAddress || rarity === null) {
    console.log("\n📖 Usage:");
    console.log("  npx hardhat run scripts/mintFish.js --network baseSepolia -- --to <address> --rarity <0-4> [--amount <number>]");
    console.log("\nRarity values:");
    console.log("  0 = Common");
    console.log("  1 = Rare");
    console.log("  2 = Epic");
    console.log("  3 = Legendary");
    console.log("  4 = Mythic");
    console.log("\nExamples:");
    console.log("  # Mint 1 Common fish to address");
    console.log("  npx hardhat run scripts/mintFish.js --network baseSepolia -- --to 0x1234... --rarity 0");
    console.log("\n  # Mint 5 Rare fish to address");
    console.log("  npx hardhat run scripts/mintFish.js --network baseSepolia -- --to 0x1234... --rarity 1 --amount 5");
    process.exit(0);
  }

  // Validate rarity
  if (rarity < 0 || rarity > 4) {
    console.error("❌ Error: Rarity must be between 0 and 4");
    process.exit(1);
  }

  // Validate address
  if (!hre.ethers.isAddress(toAddress)) {
    console.error("❌ Error: Invalid address:", toAddress);
    process.exit(1);
  }

  const rarityNames = ["Common", "Rare", "Epic", "Legendary", "Mythic"];
  console.log("\n🎣 Minting fish:");
  console.log("  To:", toAddress);
  console.log("  Rarity:", rarityNames[rarity], `(${rarity})`);
  console.log("  Amount:", amount);

  try {
    if (amount === 1) {
      // Single mint
      console.log("\n⏳ Minting...");
      const tx = await fishNFT.adminMint(toAddress, rarity);
      console.log("  Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("  ✅ Transaction confirmed in block:", receipt.blockNumber);
      
      // Get the token ID from events
      const event = receipt.logs.find(log => {
        try {
          const parsed = fishNFT.interface.parseLog(log);
          return parsed && parsed.name === "FishMinted";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = fishNFT.interface.parseLog(event);
        console.log("  🐟 Fish minted! Token ID:", parsed.args.tokenId.toString());
      }
    } else {
      // Batch mint
      console.log("\n⏳ Minting batch...");
      const tx = await fishNFT.adminMintBatch(toAddress, rarity, amount);
      console.log("  Transaction hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("  ✅ Transaction confirmed in block:", receipt.blockNumber);
      
      // Get token IDs from events
      const events = receipt.logs.filter(log => {
        try {
          const parsed = fishNFT.interface.parseLog(log);
          return parsed && parsed.name === "FishMinted";
        } catch {
          return false;
        }
      });
      
      if (events.length > 0) {
        console.log("  🐟 Fish minted! Token IDs:");
        events.forEach((event, index) => {
          const parsed = fishNFT.interface.parseLog(event);
          console.log(`    ${index + 1}. Token ID: ${parsed.args.tokenId.toString()}`);
        });
      }
    }
    
    console.log("\n✅ Success! Fish minted successfully.");
  } catch (error) {
    console.error("\n❌ Error minting fish:", error.message);
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

