# RepVote Quick Start Guide

## 🚀 Get Up and Running in 15 Minutes

This guide will help you deploy and demo RepVote as quickly as possible.

---

## Prerequisites

✅ Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

✅ Install Node.js v18+ from https://nodejs.org

✅ Get Sepolia testnet ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

---

## Step 1: Deploy Smart Contracts (5 minutes)

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies (Foundry will handle this)
forge install

# Run tests to verify everything works
forge test

# All tests should pass! ✅
```

**Expected output:**
```
Ran 14 tests for test/RepVote.t.sol:RepVoteTest
[PASS] testNewUserLowMultiplier() (gas: 8850)
[PASS] testExpertHighMultiplier() (gas: 13468)
...
Suite result: ok. 14 passed; 0 failed
```

### Deploy to Sepolia

Create `.env` file in `contracts/` directory:
```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

Deploy:
```bash
source .env
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify -vvvv
```

**SAVE THE CONTRACT ADDRESSES!** You'll see:
```
ReputationRegistry deployed at: 0x1234...
PollFactory deployed at: 0x5678...
Demo Poll deployed at: 0x9abc...
```

---

## Step 2: Setup Frontend (5 minutes)

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Update contract addresses in lib/contracts.ts
# Replace these lines with your deployed addresses:
export const REPUTATION_REGISTRY_ADDRESS = '0x1234...' as `0x${string}`;
export const POLL_FACTORY_ADDRESS = '0x5678...' as `0x${string}`;

# Also update DEMO_POLL_ADDRESS in app/page.tsx:
const DEMO_POLL_ADDRESS = '0x9abc...' as `0x${string}`;

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser!

---

## Step 3: Test Voting Flow (5 minutes)

### Test Scenario: Cast a Vote

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask
   - Ensure you're on Sepolia testnet

2. **Check Your Reputation**
   - You'll see your reputation score (likely 0 if new)
   - Your vote multiplier will be 0.3x (new user)

3. **Cast a Vote**
   - Adjust the credit slider (try 9 credits)
   - See your vote weight preview: √9 × 0.3x = 0.9 votes
   - Select an option (e.g., "Security Audit")
   - Click "Cast Vote"
   - Approve transaction in MetaMask
   - Wait for confirmation

4. **View Results**
   - Results update automatically
   - Your vote is now recorded on-chain!

### Test Scenario: Bootstrap Reputation (Optional)

If you want to test with higher reputation:

```bash
cd contracts

# Use cast to bootstrap your reputation
cast send $REP_REGISTRY_ADDRESS \
  "bootstrapReputation(address[],uint256[])" \
  "[YOUR_ADDRESS]" \
  "[1000]" \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

Now refresh the frontend and see your multiplier increase to 3x!

---

## Step 4: Run Hunter Bot (Optional, 3 minutes)

```bash
cd ../bot

# Install dependencies
npm install

# Create .env file
echo "SEPOLIA_RPC_URL=$SEPOLIA_RPC_URL" > .env
echo "POLL_ADDRESS=0x9abc..." >> .env  # Your demo poll address
echo "REP_REGISTRY_ADDRESS=0x1234..." >> .env  # Your registry address

# Start bot
npm start
```

The bot will now monitor for suspicious voting patterns!

---

## Quick Demo Checklist

For your 10-minute hackathon demo:

### Before Demo
- [ ] Contracts deployed to Sepolia
- [ ] Frontend running on localhost or Vercel
- [ ] Test wallet with Sepolia ETH
- [ ] Test one vote end-to-end
- [ ] Open research dashboard: http://localhost:3000/research
- [ ] Have backup video ready

### Demo Flow (10 minutes)
1. **(1 min)** Problem: Show real governance failures
2. **(1 min)** Solution: Explain reputation + quadratic voting
3. **(5 min)** Live Demo:
   - Show reputation display
   - Cast vote with high multiplier
   - Show vote weight calculation
   - Display live results
   - Explain Sybil resistance
4. **(2 min)** Research: Open `/research` page, show 5 scenarios
5. **(1 min)** Close: GitHub link, Q&A

---

## Troubleshooting

### "Transaction reverted"
- You may have already voted - can only vote once per poll
- Check poll is still active (7 days from creation)

### "Insufficient funds"
- Get more Sepolia ETH from faucets
- Need ~0.01 ETH for several transactions

### "Cannot connect wallet"
- Switch MetaMask to Sepolia network
- Clear browser cache and reconnect

### "Contract not found"
- Double-check contract addresses in `lib/contracts.ts`
- Verify deployment was successful on Etherscan

### Tests failing
- Ensure you're in the `contracts/` directory
- Run `forge clean && forge build` first
- Check Foundry is installed: `forge --version`

---

## Next Steps

### Deploy to Production
```bash
cd frontend
npm run build
vercel --prod  # or deploy to IPFS
```

### Create More Polls
```javascript
// In frontend, or using cast:
cast send $POLL_FACTORY_ADDRESS \
  "createPoll(string,string[],uint256,uint256)" \
  "Should we migrate to Cardano?" \
  "[\"Yes\",\"No\",\"Need more info\"]" \
  604800 \  # 7 days
  10 \      # 10x max weight cap
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### Monitor with Hunter Bot
Keep the bot running during your demo to show real-time Sybil detection!

---

## File Structure Reference

```
mcz/
├── contracts/           ← Deploy these first
│   ├── src/            ← Smart contracts
│   ├── test/           ← Tests (run with `forge test`)
│   └── script/         ← Deploy.s.sol
│
├── frontend/           ← Run with `npm run dev`
│   ├── app/            ← Pages
│   ├── components/     ← React components
│   └── lib/            ← Config (UPDATE CONTRACT ADDRESSES HERE!)
│
└── bot/                ← Run with `npm start`
    └── hunter.js       ← Monitoring script
```

---

## Essential Commands

### Smart Contracts
```bash
cd contracts
forge test              # Run tests
forge build             # Compile
forge script script/Deploy.s.sol --broadcast  # Deploy
```

### Frontend
```bash
cd frontend
npm install             # Install
npm run dev             # Development
npm run build           # Production build
```

### Bot
```bash
cd bot
npm install             # Install
npm start               # Run bot
```

---

## Quick Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Foundry Book**: https://book.getfoundry.sh/
- **wagmi Docs**: https://wagmi.sh/

---

## Success Indicators

You know everything is working when:

✅ All 14 contract tests pass
✅ Frontend loads without errors
✅ Wallet connects successfully
✅ You can cast a vote and see results
✅ Research dashboard displays 5 scenarios
✅ Bot detects and logs votes (if running)

---

## Need Help?

1. **Check the full documentation:**
   - `IMPLEMENTATION_SUMMARY.md` - Complete overview
   - `DEMO_SCRIPT.md` - Presentation guide
   - `README.md` - Project overview

2. **Review the code:**
   - Contracts are heavily commented
   - Frontend components have inline docs
   - Bot includes console logging

3. **Test locally first:**
   - Run `forge test` to verify contracts
   - Test frontend before deploying
   - Use bot on testnet first

---

**You're ready to demo RepVote!** 🚀

**Time from zero to working demo: ~15 minutes**

Good luck at the hackathon! 🏆
