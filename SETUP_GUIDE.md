# 🚀 RepVote Setup Guide - For New Team Members

This guide will help you set up the RepVote project on your local machine after cloning from Git.

---

## Prerequisites

Before starting, ensure you have:

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

3. **Foundry** (for Solidity development)
   - Install: `curl -L https://foundry.paradigm.xyz | bash`
   - Then run: `foundryup`
   - Verify: `forge --version`

### For Windows Users Only

4. **WSL2** (Windows Subsystem for Linux)
   - Install: `wsl --install` in PowerShell (as Administrator)
   - Restart your computer
   - Set up Ubuntu from Microsoft Store

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/AmrendraTheCoder/mcz.git
cd mcz
```

---

## 🔧 Step 2: Install Dependencies

### Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Smart Contract Dependencies

```bash
cd contracts
forge install
cd ..
```

---

## ⚙️ Step 3: Set Up Anvil (Local Blockchain)

### Option A: Windows (PowerShell)

Run the provided script that handles everything:

```powershell
.\start-dev.ps1
```

This script will:
- Kill any existing Anvil processes
- Start Anvil with auto-mining (1 block per second)
- Enable CORS for frontend communication
- Set up port forwarding (WSL → Windows)

### Option B: Mac/Linux (Terminal)

```bash
# Start Anvil with auto-mining
anvil --host 0.0.0.0 --block-time 1
```

Keep this terminal open (Anvil must run in the background).

---

## 📜 Step 4: Deploy Smart Contracts

Open a **new terminal** and run:

### Windows (PowerShell from project root):

```powershell
cd contracts
wsl bash -c "cd /mnt/c/Users/YOUR_USERNAME/Desktop/mcz/contracts && forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://172.24.150.133:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
```

**Replace** `YOUR_USERNAME` with your Windows username.

### Mac/Linux:

```bash
cd contracts
forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Expected Output:

You should see:
```
ReputationRegistry deployed at: 0x...
PollFactory deployed at: 0x...
Demo Poll deployed at: 0x...
```

**Copy these addresses!** You'll need them in the next step.

---

## 🔑 Step 5: Update Contract Addresses

Open `frontend/lib/contracts.ts` and update the addresses:

```typescript
export const REPUTATION_REGISTRY_ADDRESS =
  "0xYOUR_DEPLOYED_ADDRESS_HERE" as `0x${string}`;
export const POLL_FACTORY_ADDRESS =
  "0xYOUR_DEPLOYED_ADDRESS_HERE" as `0x${string}`;
```

Paste the addresses you copied from the deployment output.

---

## 🌐 Step 6: Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at: **http://localhost:3000**

---

## 💼 Step 7: Connect Your Wallet

1. Open **MetaMask** (or any Web3 wallet)
2. Add a **Custom Network**:
   - **Network Name**: Anvil Local
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH

3. **Import Test Account**:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This is Anvil's default test account with 10,000 ETH

4. **Connect to the App**:
   - Visit http://localhost:3000
   - Click "Connect Wallet"
   - Select your Anvil network

---

## ✅ Step 8: Verify It Works

### Test Voting:

1. Go to the dashboard
2. You should see the demo poll: "What should we prioritize for the next quarter?"
3. Select an option
4. Adjust credits (1-100)
5. Click "Cast Vote"
6. Approve the transaction in MetaMask
7. Wait 1-2 seconds for the block to mine
8. **Results should update automatically!**

### Test Poll Creation:

1. Click "Create Poll"
2. Enter a question and options
3. Set duration and vote cap
4. Submit and approve the transaction
5. The new poll should appear in the poll list

---

## 🐛 Troubleshooting

### Problem: "ERR_CONNECTION_REFUSED" when voting

**Solution (Windows only):**

Run the port forwarding script as Administrator:

```powershell
.\setup-port-forward.ps1
```

This creates a tunnel from Windows localhost:8545 → WSL Anvil.

### Problem: "Transaction failed" when voting on new polls

**Solution:**

Redeploy contracts (they may not be authorized):

```bash
cd contracts
forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Then update the addresses in `frontend/lib/contracts.ts`.

### Problem: "Vote weight shows 0.00"

**Solution:**

This was a display bug that's been fixed. Pull the latest changes:

```bash
git pull origin main
```

### Problem: Anvil not mining blocks

**Solution:**

Restart Anvil with auto-mining:

```bash
# Windows
.\start-dev.ps1

# Mac/Linux
anvil --host 0.0.0.0 --block-time 1
```

---

## 📁 Project Structure

```
mcz/
├── contracts/              # Solidity smart contracts
│   ├── src/
│   │   ├── Poll.sol
│   │   ├── PollFactory.sol
│   │   └── ReputationRegistry.sol
│   └── script/
│       └── DeployLocal.s.sol
│
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── page.tsx       # Main dashboard
│   │   └── vote/          # Share route
│   ├── components/
│   │   ├── VoteCard.tsx
│   │   ├── ResultsChart.tsx
│   │   ├── PollList.tsx
│   │   ├── ShareModal.tsx
│   │   └── ...
│   └── lib/
│       ├── contracts.ts   # Contract addresses & ABIs
│       └── wagmi.ts       # Blockchain config
│
└── start-dev.ps1          # Quick start script (Windows)
```

---

## 🎯 Quick Start Summary

For experienced developers:

```bash
# 1. Clone & Install
git clone https://github.com/AmrendraTheCoder/mcz.git
cd mcz
cd frontend && npm install && cd ..
cd contracts && forge install && cd ..

# 2. Start Anvil
.\start-dev.ps1  # Windows
# OR
anvil --host 0.0.0.0 --block-time 1  # Mac/Linux

# 3. Deploy Contracts (new terminal)
cd contracts
forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# 4. Update addresses in frontend/lib/contracts.ts

# 5. Start Frontend
cd frontend
npm run dev

# 6. Open http://localhost:3000
```

---

## 🆘 Need Help?

- **Smart Contract Issues**: Check `contracts/test/` for examples
- **Frontend Issues**: See `frontend/components/` for component code
- **Network Issues**: Ensure Anvil is running and port forwarding is set up
- **General Questions**: Open an issue on GitHub

---

## 🎉 You're Ready!

Once you can vote on polls and see results update, you're all set! Start building and experimenting with the RepVote system.

**Happy coding!** 🚀
