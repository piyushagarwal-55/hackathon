# 🚀 Deploy to Arbitrum Sepolia Testnet

## Step 1: Get Testnet ETH

1. Visit: https://www.alchemy.com/faucets/arbitrum-sepolia
2. Sign up for free Alchemy account
3. Enter your MetaMask wallet address
4. Receive 0.1 Sepolia ETH (~30 seconds)

## Step 2: Get Alchemy RPC URL

1. Go to https://dashboard.alchemy.com/
2. Create new app:
   - **Chain:** Arbitrum
   - **Network:** Arbitrum Sepolia
3. Click "View Key"
4. Copy the **HTTPS URL** (looks like: `https://arb-sepolia.g.alchemy.com/v2/YOUR_KEY`)

## Step 3: Setup Environment

Create `contracts/.env`:

```bash
cd contracts
cp .env.example .env
```

Edit `.env`:

```bash
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
ARBITRUM_SEPOLIA_RPC=https://arb-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**Get your private key:**
- MetaMask → Account → ... → Account Details → Export Private Key
- ⚠️ **NEVER share this or commit to Git!**

## Step 4: Deploy Contracts

```bash
cd contracts

# Deploy to Arbitrum Sepolia
forge script script/Deploy.s.sol:DeployScript --rpc-url $ARBITRUM_SEPOLIA_RPC --broadcast --verify -vvvv

# OR on Windows PowerShell:
$env:PRIVATE_KEY="0xYOUR_KEY"
$env:ARBITRUM_SEPOLIA_RPC="https://arb-sepolia.g.alchemy.com/v2/YOUR_KEY"
forge script script/Deploy.s.sol:DeployScript --rpc-url %ARBITRUM_SEPOLIA_RPC% --broadcast -vvvv
```

**Expected output:**
```
ReputationRegistry deployed at: 0x...
PollFactory deployed at: 0x...
Demo Poll deployed at: 0x...
```

**Save these addresses!**

## Step 5: Update Frontend

Edit `frontend/lib/contracts.ts`:

```typescript
// Deployed on Arbitrum Sepolia
export const REPUTATION_REGISTRY_ADDRESS =
  "0xYOUR_REPUTATION_REGISTRY_ADDRESS" as `0x${string}`;
export const POLL_FACTORY_ADDRESS =
  "0xYOUR_POLL_FACTORY_ADDRESS" as `0x${string}`;
```

## Step 6: Test on Testnet

```bash
cd frontend
npm run dev
```

1. Open http://localhost:3000
2. Connect MetaMask
3. **Switch to Arbitrum Sepolia** network in MetaMask
4. Test voting (transactions take ~2 seconds)

## Step 7: Add Network to MetaMask (If Not Present)

- **Network Name:** Arbitrum Sepolia
- **RPC URL:** `https://sepolia-rollup.arbitrum.io/rpc`
- **Chain ID:** `421614`
- **Currency Symbol:** ETH
- **Block Explorer:** https://sepolia.arbiscan.io/

## ✅ Verification

Check your contracts on Arbiscan:
- Visit: https://sepolia.arbiscan.io/
- Search for your contract addresses
- You can see all transactions

## 🎉 Done!

Your teammates can now:
1. Clone the repo
2. `npm install`
3. Connect to Arbitrum Sepolia
4. Start voting!

**No Anvil/Foundry needed for them!**

---

## 🔄 Redeploy (If Needed)

```bash
# Just run deployment again
forge script script/Deploy.s.sol:DeployScript --rpc-url $ARBITRUM_SEPOLIA_RPC --broadcast -vvvv

# Update addresses in contracts.ts
```

---

## 💰 Cost Estimate

- **Deployment:** ~0.002 ETH (~$0 on testnet)
- **Per Vote:** ~0.0001 ETH
- **Create Poll:** ~0.0003 ETH

With 0.1 ETH from faucet = **~300 transactions**
