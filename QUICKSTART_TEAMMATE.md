# 🚀 Quick Start for New Teammates

## TL;DR - Get Running in 2 Minutes (Testnet)

### 1. Clone & Install
```bash
git clone https://github.com/AmrendraTheCoder/mcz.git
cd mcz/frontend
npm install
```

### 2. Start Frontend
```bash
npm run dev
```

Visit **http://localhost:3000**

### 3. Setup MetaMask
- **Network:** Arbitrum Sepolia
- **RPC:** `https://sepolia-rollup.arbitrum.io/rpc`
- **Chain ID:** `421614`
- **Get testnet ETH:** https://www.alchemy.com/faucets/arbitrum-sepolia

### 4. Connect & Vote!
- Click "Connect Wallet"
- Switch to Arbitrum Sepolia
- Start voting on shared polls!

---

## 🔧 Alternative: Local Development

If you want to develop/test smart contracts:

### 1. Clone & Install (Same as above)

### 2. Start Blockchain (Terminal 1)
```powershell
# Windows
.\start-dev.ps1

# Mac/Linux
anvil --block-time 1
```

### 3. Deploy Contracts (Terminal 2)
```bash
cd contracts
forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Copy addresses** and update `frontend/lib/contracts.ts`

### 4. Start Frontend (Terminal 3)
```bash
cd frontend
npm run dev
```

### 5. Setup MetaMask (Local)
- **Network:** Anvil Local
- **RPC:** `http://localhost:8545`
- **Chain ID:** `31337`
- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 🎯 Which Should I Use?

### Use Testnet If:
- ✅ You just want to use the app
- ✅ Don't need to modify contracts
- ✅ Want to see shared data with team

### Use Local If:
- ✅ Developing smart contracts
- ✅ Need fast iterations
- ✅ Want isolated testing

---

## 🐛 Common Issues

**Can't get testnet ETH?**
- Try: https://faucets.chain.link/arbitrum-sepolia
- Or ask teammate who deployed

**Transaction failing?**
- Check you're on correct network (Arbitrum Sepolia)
- Ensure you have testnet ETH

**Full guide:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
