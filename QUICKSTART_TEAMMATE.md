# 🚀 Quick Start for New Teammates

## TL;DR - Get Running in 5 Minutes

### 1. Clone & Install
```bash
git clone https://github.com/AmrendraTheCoder/mcz.git
cd mcz
cd contracts && forge install && cd ..
cd frontend && npm install && cd ..
```

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
wsl bash -c "forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
```

**Copy the addresses** and update `frontend/lib/contracts.ts`

### 4. Start Frontend (Terminal 3)
```bash
cd frontend
npm run dev
```

Visit **http://localhost:3000**

### 5. Setup MetaMask
- **Network:** Anvil Local
- **RPC:** `http://localhost:8545`
- **Chain ID:** `31337`
- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 🐛 Common Issues

**Port 8545 not accessible (Windows)?**
```powershell
# Run as Admin
.\setup-port-forward.ps1
```

**Transaction failing?**
- Restart Anvil: `.\start-dev.ps1`
- Redeploy contracts
- Update addresses in `contracts.ts`

**Full guide:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
