# OpenSea Integration Setup

## ✅ What's Done

Created API endpoints for NFT metadata:

### Endpoints Created

1. **Token Metadata** (for individual NFTs)

   - `https://fryreef.com/api/token/base/[contract]/[tokenId]`
   - Returns JSON with name, description, image, attributes
   - Works for both Fish and Egg NFTs

2. **Collection Metadata** (for collection pages)
   - `https://fryreef.com/api/collection/fish`
   - `https://fryreef.com/api/collection/egg`
   - Returns collection info (name, description, logo, royalty)

### Contract Addresses

- **FishNFT**: `0xC73cB204010FF33Be2216766167f87e4BaeC0B6B`
- **EggNFT**: `0x9Fa8dCcAb21aF36A9f06d78C80c5dB58BF9d4dE0`
- **FryReef**: `0xB0feb337d1E867FcB1b68bd438bb1fAC78b996EB`

## 📝 What You Need To Do

### Step 1: Update Royalty Address

Edit these files and replace `0xYourWalletAddress` with your actual wallet:

1. `src/app/api/collection/fish/route.ts` (line 8)
2. `src/app/api/collection/egg/route.ts` (line 8)

To find your owner address, run:

```bash
npx hardhat run scripts/getOwnerAddress.js --network base
```

### Step 2: Deploy to Production

```bash
# Build and deploy to Vercel
npm run build
vercel --prod
```

Make sure your domain is `fryreef.com` or update URLs in:

- `src/app/api/token/base/[contract]/[tokenId]/route.ts` (lines 37, 50, 76, 82)
- `src/app/api/collection/fish/route.ts` (lines 5, 6)
- `src/app/api/collection/egg/route.ts` (lines 5, 6)

### Step 3: Test API Endpoints

After deployment, test in browser:

**Fish NFT #1:**

```
https://fryreef.com/api/token/base/0xC73cB204010FF33Be2216766167f87e4BaeC0B6B/1
```

**Egg NFT #1:**

```
https://fryreef.com/api/token/base/0x9Fa8dCcAb21aF36A9f06d78C80c5dB58BF9d4dE0/1
```

**Fish Collection:**

```
https://fryreef.com/api/collection/fish
```

Should return JSON with metadata.

### Step 4: Register on OpenSea

OpenSea will auto-discover your NFTs, but you can force refresh:

**Via OpenSea Website:**

1. Go to `https://opensea.io/assets/base/0xC73cB204010FF33Be2216766167f87e4BaeC0B6B/1`
2. Click "Refresh metadata" button

**Via API:**

```bash
# Refresh Fish collection
curl -X POST "https://api.opensea.io/api/v2/chain/base/contract/0xC73cB204010FF33Be2216766167f87e4BaeC0B6B/refresh"

# Refresh Egg collection
curl -X POST "https://api.opensea.io/api/v2/chain/base/contract/0x9Fa8dCcAb21aF36A9f06d78C80c5dB58BF9d4dE0/refresh"
```

### Step 5: Verify on OpenSea

1. Go to OpenSea
2. Search for your Fish NFT contract: `0xC73cB204010FF33Be2216766167f87e4BaeC0B6B`
3. Check that:
   - ✅ Images appear correctly
   - ✅ Attributes (Rarity, Production Rate) are shown
   - ✅ Collection name is "FryReef Fish"
   - ✅ NFTs are listable for sale

## 🎯 How It Works

**Without contract changes:**

1. User visits OpenSea page for Fish #5
2. OpenSea tries `tokenURI(5)` on contract → function doesn't exist
3. OpenSea fallback: calls `https://fryreef.com/api/token/base/0xC73...B6B/5`
4. Your API:
   - Reads fish data from blockchain (rarity, production rate)
   - Returns JSON with image URL and attributes
5. OpenSea displays image + metadata ✅

**Benefits:**

- ✅ No contract redeployment needed
- ✅ No NFT migration required
- ✅ Users keep all their NFTs
- ✅ Can update metadata anytime (just redeploy API)

## 🐛 Troubleshooting

### Images not showing on OpenSea

Check that image files exist at:

- `/public/images/fish/common.webp`
- `/public/images/fish/rare.webp`
- `/public/images/fish/epic.webp`
- `/public/images/fish/legendary.webp`
- `/public/images/fish/mythic.webp`
- `/public/images/egg/egg.png`

### API returns 500 error

Check that:

1. RPC URL works: `https://mainnet.base.org`
2. Contract addresses are correct
3. ABI is correct (`fishNftAbi` and `eggNftAbi` exported from `@/contracts`)

### OpenSea says "metadata unavailable"

1. Test API endpoint directly in browser
2. Check CORS settings (should be open for OpenSea)
3. Wait 15-30 minutes for OpenSea cache to update
4. Force refresh using OpenSea API

## 📊 What Users Will See

### Fish NFT Card

- **Name**: "FryReef Fish #5"
- **Image**: Fish with rarity color
- **Attributes**:
  - Rarity: Epic
  - Production Rate: 18
  - Type: Fish

### Egg NFT Card

- **Name**: "FryReef Egg #3"
- **Image**: Egg icon
- **Attributes**:
  - Status: Incubating / Ready to Incubate
  - Type: Egg

## ✅ Next Steps

After OpenSea is working:

1. Share collection links on social media
2. List a few NFTs for sale to test marketplace
3. Monitor trading volume
4. Move to Phase 2: FRY Token integration

---

**Need Help?**

- Check API logs in Vercel dashboard
- Test endpoints with curl or Postman
- Read OpenSea metadata docs: https://docs.opensea.io/docs/metadata-standards
