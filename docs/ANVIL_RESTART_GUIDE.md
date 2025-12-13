# ⚡ QUICK FIX - Start Anvil Properly

## The Issue
Transaction failing because Anvil needs to:
1. **Mine blocks** to confirm transactions
2. **Enable CORS** to allow frontend connections

## The Solution (3 Steps)

### Step 1: Find Your Anvil Terminal
Look for the terminal window where Anvil is running. It should show:
```
Listening on 127.0.0.1:8545
```

### Step 2: Stop Anvil
In that terminal, press `Ctrl+C` to stop Anvil

### Step 3: Restart Anvil with Correct Settings

**Copy and paste this command:**
```powershell
anvil --host 0.0.0.0 --cors-origins "*" --block-time 1
```

**Or run the script:**
```powershell
.\start-anvil-fixed.ps1
```

### Step 4: Redeploy Contracts

**In a NEW terminal:**
```powershell
cd contracts
forge script script/DeployLocal.s.sol --broadcast --rpc-url http://localhost:8545
```

**Copy the new Poll address** from the output and update `frontend/lib/contracts.ts` if needed.

### Step 5: Test Voting

1. **Reload browser** (`Ctrl + Shift + R`)
2. **Cast a vote**
3. **Wait 1-2 seconds** for block to mine
4. **Results should update!** ✅

## What Each Flag Does

| Flag | Purpose |
|------|---------|
| `--host 0.0.0.0` | Allow connections from any interface |
| `--cors-origins "*"` | Enable CORS for frontend |
| `--block-time 1` | Mine a block every 1 second |

## Troubleshooting

### "anvil: command not found"

Foundry isn't installed. Install it:
```powershell
# Open PowerShell as Administrator
irm https://github.com/foundry-rs/foundry/releases/latest/download/foundryup-init.ps1 | iex
```

Then restart your terminal and try again.

### Transaction still failing?

Check Anvil logs in the terminal. You should see:
```
eth_sendRawTransaction
...
Mined empty block
```

### Results not updating?

1. Check Anvil is mining blocks (should see "Mined empty block" every second)
2. Check browser console for errors
3. Verify contract addresses match in `frontend/lib/contracts.ts`

---

**That's it!** Once Anvil is restarted with these flags, voting will work perfectly.
