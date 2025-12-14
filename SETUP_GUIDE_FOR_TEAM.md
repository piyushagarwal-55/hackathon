# 🚀 RepVote - Team Setup Guide

## ✅ Contracts Already Deployed!

**Good news:** All smart contracts are deployed on **Arbitrum Sepolia Testnet** (public blockchain). Everyone will use the same contracts!

### Deployed Addresses:
- **MockRepToken**: `0xE407D9fd30d2E15038f0fe90A7CB3B466Ca51138`
- **ReputationRegistry**: `0x032FE3F6D81a9Baca0576110090869Efe81a6AA7`
- **PollFactory**: `0xB4c9c8bFdD29Fb6c727A1fd11b769BCA1988cb4B`
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Explorer**: https://sepolia.arbiscan.io/

---

## 📋 Prerequisites

Before starting, make sure you have:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Check version: `node --version`

2. **Git**
   - Download: https://git-scm.com/
   - Check version: `git --version`

3. **MetaMask Browser Extension**
   - Install: https://metamask.io/download/

---

## 🔧 Step-by-Step Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/piyushagarwal-55/hackathon.git

# Navigate to project folder
cd hackathon
```

### 2. Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd frontend

# Install all packages (this will take a few minutes)
npm install
```

### 3. Setup MetaMask

#### Add Arbitrum Sepolia Network to MetaMask:

1. Open MetaMask
2. Click on network dropdown (top center)
3. Click "Add Network" → "Add Network Manually"
4. Enter these details:

```
Network Name: Arbitrum Sepolia
RPC URL: https://sepolia-rollup.arbitrum.io/rpc
Chain ID: 421614
Currency Symbol: ETH
Block Explorer: https://sepolia.arbiscan.io
```

5. Click "Save"

#### Get Test ETH (for gas fees):

1. Visit: https://faucet.quicknode.com/arbitrum/sepolia
2. Paste your MetaMask wallet address
3. Click "Get ETH"
4. Wait 1-2 minutes for ETH to arrive

**Alternative Faucets:**
- https://www.alchemy.com/faucets/arbitrum-sepolia
- https://faucets.chain.link/arbitrum-sepolia

### 4. Start the Frontend

```bash
# Make sure you're in the frontend folder
# If not: cd frontend

# Start the development server
npm run dev
```

The app will open at: **http://localhost:3000**

### 5. Connect Wallet & Get REP Tokens

1. Open http://localhost:3000 in your browser
2. Click **"Connect Wallet"** (top right)
3. Select MetaMask and approve
4. Switch to **Arbitrum Sepolia** network if prompted
5. Click **"Get Free Tokens"** to mint 1000 REP tokens
6. Confirm the transaction in MetaMask

---

## 🎮 Usage

### Creating a Poll:

1. Click **"Create Poll"** button
2. Fill in:
   - Title
   - Description
   - Options (minimum 2)
   - Duration (in seconds, e.g., 3600 = 1 hour)
3. Click "Create" and confirm in MetaMask

### Voting:

1. Browse polls on the homepage
2. Click on a poll to open it
3. Select your option
4. Enter vote amount (tokens)
5. Click **"Approve"** first (one-time per poll)
6. Then click **"Vote"**
7. Confirm both transactions in MetaMask

### Claiming Winnings:

1. After poll ends, go to the poll page
2. If you voted for the winning option, click **"Claim Winnings"**
3. Confirm transaction to receive your share of the prize pool

---

## 🐛 Troubleshooting

### "Transaction Failed" or "Internal JSON-RPC Error"

**Solution:**
1. Go to MetaMask Settings → Advanced
2. Click **"Clear Activity Tab Data"** or **"Reset Account"**
3. Try the transaction again

### "Wrong Network"

**Solution:**
- Click on MetaMask network dropdown
- Select **"Arbitrum Sepolia"**

### "Insufficient Funds for Gas"

**Solution:**
- You need some test ETH for transaction fees
- Get free ETH from faucets (see Step 3 above)

### "Port 3000 Already in Use"

**Solution:**
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
npm run dev -- -p 3001
```

### Frontend Won't Start

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📁 Project Structure

```
hackathon/
├── frontend/           # Next.js frontend application
│   ├── app/           # Pages and routes
│   ├── components/    # React components
│   ├── lib/           # Contract ABIs and utilities
│   └── package.json
├── contracts/         # Smart contracts (Solidity)
│   ├── src/          # Contract source files
│   └── broadcast/    # Deployment records
└── docs/             # Documentation
```

---

## 🎯 Quick Commands Reference

```bash
# Clone project
git clone https://github.com/piyushagarwal-55/hackathon.git

# Install dependencies
cd hackathon/frontend
npm install

# Start frontend
npm run dev

# Update to latest code
git pull origin main

# Check if contracts are accessible
# Visit: https://sepolia.arbiscan.io/address/0x531bddf664d17d7c6eed945b4d9e48b4709df21e
```

---

## 💡 Important Notes

1. **Same Blockchain for Everyone**: All users interact with the same deployed contracts on Arbitrum Sepolia
2. **No Contract Deployment Needed**: Contracts are already deployed, just run the frontend
3. **Free to Use**: This is a testnet with free tokens, no real money involved
4. **MetaMask Required**: You must have MetaMask installed and connected
5. **Test ETH Needed**: Required for transaction gas fees (get from faucets)

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Make sure you're on **Arbitrum Sepolia** network
3. Ensure you have test ETH for gas fees
4. Clear MetaMask activity and try again

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Repository cloned
- [ ] Frontend dependencies installed (`npm install`)
- [ ] MetaMask installed
- [ ] Arbitrum Sepolia network added to MetaMask
- [ ] Test ETH received from faucet
- [ ] Frontend running (`npm run dev`)
- [ ] Wallet connected
- [ ] REP tokens received ("Get Free Tokens")
- [ ] Ready to create/vote on polls! 🎉

---

**Project Repository**: https://github.com/piyushagarwal-55/hackathon

**Network**: Arbitrum Sepolia (Chain ID: 421614)

**Explorer**: https://sepolia.arbiscan.io/
