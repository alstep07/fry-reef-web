# Deploy to Vercel

This guide explains how to deploy the Based Analytics app to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your WalletConnect Project ID
3. Your deployed contract address on Base Sepolia

## Step 1: Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

## Step 3: Configure Environment Variables

After creating the project, you need to add environment variables in Vercel:

1. Go to your project settings in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Your WalletConnect Project ID | `fd40a4be3e42536634699d084ea113cb` |
| `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` | Deployed contract address on Base Sepolia | `0x68a298f481353864Fc3bD2C8fbf1027D509B321D` |

### How to Add Variables

1. Click **Add New**
2. Enter the variable name (e.g., `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`)
3. Enter the variable value
4. Select environments:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development** (optional)
5. Click **Save**

### Important Notes

- **`NEXT_PUBLIC_` prefix**: Variables with this prefix are exposed to the browser. Only use it for public data (like contract addresses and WalletConnect Project ID).
- **Never commit private keys**: The `.env` file with `PRIVATE_KEY` and `BASE_SEPOLIA_RPC_URL` is for local development only and should NOT be deployed to Vercel.

## Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Or trigger a new deployment by pushing to your Git repository

## Step 5: Verify Deployment

1. Visit your deployed URL (e.g., `https://your-app.vercel.app`)
2. Connect your wallet
3. Test the check-in functionality
4. Verify that the contract address is correctly loaded

## Troubleshooting

### Environment Variables Not Working

- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing environment variables
- Check that variable names match exactly (case-sensitive)

### Build Errors

- Check the build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Vercel auto-detects, but you can set it in `package.json`)

### Contract Not Found

- Verify `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` is set correctly
- Ensure the contract is deployed on Base Sepolia
- Check that the address starts with `0x` and is 42 characters long

## Additional Configuration

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### Environment-Specific Variables

You can set different values for Production, Preview, and Development environments in Vercel.

## Security Best Practices

- ✅ Use `NEXT_PUBLIC_` prefix only for public data
- ❌ Never expose private keys or API secrets
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use Vercel's environment variables for sensitive data

## Support

For issues with:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **WalletConnect**: Check [WalletConnect Cloud](https://cloud.walletconnect.com)
- **Base**: Check [Base Documentation](https://docs.base.org)

