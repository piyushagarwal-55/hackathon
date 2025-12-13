# RepVote Setup Guide

Complete setup instructions to get RepVote running locally.

## Prerequisites

Before you begin, install the following:

1. **Node.js v18+** - Download from [nodejs.org](https://nodejs.org/)
2. **Foundry** - Smart contract development toolkit
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```
3. **Git** - Version control
4. **MetaMask** - Browser wallet extension

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd mcz

# Install frontend dependencies
cd frontend
npm install

# Install bot dependencies
cd ../bot
npm install
```

## Step 2: Setup Smart Contracts

```bash
cd contracts

# Install Foundry dependencies
forge install foundry-rs/forge-std --no-commit

# Compile contracts
forge build

# Run tests to verify everything works
forge test
```

Expected output: ✅ All 14 tests passing

## Step 3: Get Sepolia Testnet ETH

You'll need Sepolia ETH for deployment and testing:

1. Visit these faucets:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - https://faucet.quicknode.com/ethereum/sepolia

2. Enter your wallet address
3. Request ~0.1 ETH (you'll need ~0.02 ETH for deployment)

## Step 4: Get API Keys

### 4.1 Alchemy/Infura RPC Provider

1. Sign up at [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
2. Create a new app for Sepolia testnet
3. Copy the RPC URL (looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`)

### 4.2 Etherscan API Key

1. Create account at [Etherscan](https://etherscan.io/)
2. Go to API Keys section
3. Create new API key
4. Copy the key

### 4.3 WalletConnect Project ID (Optional, Frontend)

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create new project
3. Copy Project ID
4. (Note: A fallback is provided, so this is optional)

## Step 5: Configure Environment Variables

### Contracts (.env)

```bash
cd contracts
cp .env.example .env
```

Edit `.env`:
```bash
PRIVATE_KEY=your_metamask_private_key_without_0x
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ SECURITY WARNING**: Never commit your `.env` file or share your private key!

### Frontend (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Step 6: Deploy Smart Contracts

```bash
cd contracts

# Load environment variables
source .env

# Deploy to Sepolia
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Save the contract addresses from the output!**

Expected output:
```
ReputationRegistry deployed at: 0x1234...
PollFactory deployed at: 0x5678...
Demo Poll deployed at: 0x9abc...
```

## Step 7: Update Frontend Configuration

Edit `frontend/lib/contracts.ts`:

```typescript
export const REPUTATION_REGISTRY_ADDRESS = '0x1234...' as `0x${string}`;
export const POLL_FACTORY_ADDRESS = '0x5678...' as `0x${string}`;
```

Edit `frontend/app/page.tsx`:

```typescript
const DEMO_POLL_ADDRESS = '0x9abc...' as `0x${string}`;
```

## Step 8: Start Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser!

## Step 9: Test the Application

### 9.1 Connect Wallet

1. Click "Connect Wallet"
2. Select MetaMask
3. Ensure you're on Sepolia testnet
4. Approve connection

### 9.2 Check Reputation

You should see your reputation display (likely 0 for new users).

### 9.3 Cast a Vote

1. Adjust credit slider
2. Select an option
3. Click "Cast Vote"
4. Approve transaction in MetaMask
5. Wait for confirmation
6. View results updating in real-time!

### 9.4 Bootstrap Reputation (Optional)

To test with higher reputation:

```bash
cd contracts

cast send $REPUTATION_REGISTRY_ADDRESS \
  "bootstrapReputation(address[],uint256[])" \
  "[YOUR_WALLET_ADDRESS]" \
  "[1000]" \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

Refresh frontend - you should now see 3x multiplier!

## Step 10: Run Hunter Bot (Optional)

```bash
cd bot

# Create .env file
echo "SEPOLIA_RPC_URL=$SEPOLIA_RPC_URL" > .env
echo "POLL_ADDRESS=0x9abc..." >> .env
echo "REP_REGISTRY_ADDRESS=0x1234..." >> .env

# Start monitoring
npm start
```

The bot will now monitor for suspicious voting patterns!

## Troubleshooting

### "Transaction reverted" when voting
- You may have already voted (can only vote once per poll)
- Check poll is still active (7 days from creation)
- Ensure you have Sepolia ETH for gas

### "Cannot connect wallet"
- Switch MetaMask to Sepolia network
- Clear browser cache and try again
- Make sure MetaMask is unlocked

### "Contract not found" error
- Double-check contract addresses in `lib/contracts.ts`
- Verify deployment was successful on Etherscan
- Ensure you're on Sepolia network

### Frontend compilation errors
- Run `npm install` again in frontend directory
- Delete `node_modules` and `.next` folders, then reinstall
- Check Node.js version is 18+

### Foundry tests failing
- Run `forge clean && forge build`
- Verify Foundry is installed: `forge --version`
- Check you're in `contracts/` directory

### "Insufficient funds" when deploying
- Get more Sepolia ETH from faucets
- Deployment needs ~0.02 ETH total

## Quick Reference Commands

### Contracts
```bash
cd contracts
forge build          # Compile
forge test           # Run tests
forge test -vv       # Verbose tests
forge clean          # Clean cache
```

### Frontend
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Check for errors
```

### Bot
```bash
cd bot
npm start            # Start monitoring
```

## Project Structure

```
mcz/
├── contracts/          # Smart contracts (Solidity)
│   ├── src/           # Contract source files
│   ├── test/          # Test files
│   ├── script/        # Deployment scripts
│   └── foundry.toml   # Foundry config
│
├── frontend/          # Next.js frontend
│   ├── app/           # Pages and layouts
│   ├── components/    # React components
│   ├── lib/           # Utilities and config
│   └── package.json   # Dependencies
│
├── bot/               # Sybil detection bot
│   ├── hunter.js      # Main bot script
│   └── package.json   # Dependencies
│
└── docs/              # Documentation
    ├── SETUP.md       # This file
    ├── QUICKSTART.md  # Quick reference
    └── DEMO_SCRIPT.md # Demo presentation
```

## Next Steps

After successful setup:

1. ✅ Read [QUICKSTART.md](./QUICKSTART.md) for quick deployment
2. ✅ Review [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for presentation
3. ✅ Explore [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for details
4. ✅ Check [contracts/DEPLOYMENT.md](./contracts/DEPLOYMENT.md) for advanced deployment

## Getting Help

- Check the documentation files in this repository
- Review code comments (heavily documented)
- Test locally with `forge test` for contracts
- Use `console.log` in frontend components for debugging

## Production Deployment

For production deployment to mainnet:

1. **DO NOT use the same private key** as testnet
2. Get a fresh security audit for contracts
3. Test thoroughly on testnet first
4. Use hardware wallet for deployment
5. Deploy frontend to Vercel or IPFS
6. Monitor with the Hunter bot

---

**🎉 You're all set! Start building with RepVote.**

For questions or issues, refer to the comprehensive documentation in this repository.

