# 🗳️ RepVote - Decentralized Voting Platform

A modern, Polymarket-style decentralized voting platform built on Arbitrum Sepolia testnet with reputation-based token mechanics.

## ⚡ Quick Start

**For team members setting up the project:**

👉 **See [QUICK_START.md](./QUICK_START.md)** for 5-minute setup

👉 **See [SETUP_GUIDE_FOR_TEAM.md](./SETUP_GUIDE_FOR_TEAM.md)** for detailed instructions

## ✅ Smart Contracts (Already Deployed!)

All contracts are deployed on **Arbitrum Sepolia Testnet** - everyone uses the same blockchain:

- **PollFactory**: `0xB4c9c8bFdD29Fb6c727A1fd11b769BCA1988cb4B`
- **MockRepToken**: `0xE407D9fd30d2E15038f0fe90A7CB3B466Ca51138`
- **ReputationRegistry**: `0x032FE3F6D81a9Baca0576110090869Efe81a6AA7`
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Explorer**: https://sepolia.arbiscan.io/

**No deployment needed** - just clone and run!

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/piyushagarwal-55/hackathon.git

# Navigate to frontend
cd hackathon/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MetaMask** browser extension ([Install](https://metamask.io/download/))
- **Arbitrum Sepolia** network added to MetaMask
- **Free test ETH** from [faucet](https://faucet.quicknode.com/arbitrum/sepolia)

## 🎮 Features

- ✅ Create prediction markets/polls
- ✅ Vote with REP tokens (Simple/Quadratic/Weighted)
- ✅ Real-time results with charts
- ✅ Reputation-based rewards
- ✅ Claim winnings after poll ends
- ✅ Modern Polymarket-style UI
- ✅ Free tokens from faucet

## 🔧 MetaMask Setup

Add Arbitrum Sepolia network to MetaMask:

| Setting | Value |
|---------|-------|
| Network Name | Arbitrum Sepolia |
| RPC URL | https://sepolia-rollup.arbitrum.io/rpc |
| Chain ID | 421614 |
| Currency Symbol | ETH |
| Block Explorer | https://sepolia.arbiscan.io |

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - 5-minute setup
- [Team Setup Guide](./SETUP_GUIDE_FOR_TEAM.md) - Detailed instructions
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md) - Contract details
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

## 🏗️ Project Structure

```
hackathon/
├── frontend/              # Next.js frontend application
│   ├── app/              # Pages and routes
│   ├── components/       # React components
│   ├── lib/              # Contract ABIs and utilities
│   └── hooks/            # Custom React hooks
├── contracts/            # Smart contracts (Solidity)
│   ├── src/             # Contract source files
│   ├── script/          # Deployment scripts
│   └── test/            # Contract tests
└── docs/                # Additional documentation
```

## 🤝 For Team Members

**Cloning this repo for the first time?**

1. Follow the [Quick Start Guide](./QUICK_START.md)
2. No contract deployment needed - they're already live!
3. Just run `npm install` and `npm run dev`
4. All users interact with the same contracts on Arbitrum Sepolia

## 🐛 Troubleshooting

**Transaction failed?**
- Clear MetaMask activity data: Settings → Advanced → Clear Activity Tab Data

**Wrong network?**
- Switch to Arbitrum Sepolia in MetaMask

**Need test ETH?**
- Get free ETH: https://faucet.quicknode.com/arbitrum/sepolia

**More help?** See [SETUP_GUIDE_FOR_TEAM.md](./SETUP_GUIDE_FOR_TEAM.md#troubleshooting)

## 🌟 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Blockchain**: Solidity, Foundry
- **Network**: Arbitrum Sepolia Testnet
- **Web3**: Wagmi, Viem, RainbowKit
- **Charts**: Recharts

## 📄 License

MIT License - feel free to use for educational purposes

## 🔗 Links

- **Repository**: https://github.com/piyushagarwal-55/hackathon
- **Explorer**: https://sepolia.arbiscan.io/
- **Faucet**: https://faucet.quicknode.com/arbitrum/sepolia

---

**Ready to start?** → [QUICK_START.md](./QUICK_START.md)
