# RepVote Troubleshooting Guide

## 🔧 Common Issues and Solutions

### 1. New Markets Not Showing Up

**Symptoms:**
- Created a new market but it doesn't appear in the list
- Refresh button doesn't update the list

**Solutions:**

#### A. Check Anvil is Running
```bash
# Terminal 1: Start Anvil
anvil --host 0.0.0.0 --cors-origins "*"
```

#### B. Verify Contracts are Deployed
```bash
# Terminal 2: Deploy contracts
cd contracts
forge script script/DeployLocal.s.sol --broadcast --rpc-url http://localhost:8545
```

#### C. Manual Refresh
- Click the refresh button (🔄) next to the search bar
- Wait 1-2 seconds for the blockchain to update
- Markets should appear after auto-refresh (every 5 seconds)

#### D. Check Browser Console
- Open DevTools (F12)
- Look for errors in Console tab
- Common errors:
  - `Failed to fetch` → Anvil not running
  - `ECONNREFUSED` → Wrong RPC port
  - `Transaction reverted` → Check contract state

### 2. Hydration Errors

**Symptoms:**
```
Warning: Expected server HTML to contain a matching <div>
Hydration failed because the initial UI does not match
```

**Solutions:**
- ✅ **FIXED**: `NetworkHealth` component now waits for client-side mount
- Clear Next.js cache: `rm -rf .next && npm run dev`
- Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### 3. High Gas Fees

**Symptoms:**
- Transactions cost too much gas
- MetaMask shows high estimated fees

**Solutions:**
- ✅ **FIXED**: Added explicit gas limits to all transactions
  - `approve`: 50,000 gas
  - `vote`: 200,000 gas
  - `claimWinnings`: 150,000 gas
  - `createPoll`: 1,000,000 gas
- ✅ **FIXED**: Moved reputation award from `vote()` to `claimWinnings()`

### 4. MetaMask RPC Error: Failed to fetch

**Symptoms:**
```
MetaMask - RPC Error: Failed to fetch {code: -32603}
```

**Solutions:**

#### A. Verify Anvil Connection
```bash
# Test RPC endpoint
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### B. Check MetaMask Network Settings
1. Open MetaMask
2. Settings → Networks → Anvil
3. Verify settings:
   - **RPC URL**: `http://localhost:3000/api/rpc`
   - **Chain ID**: `31337`
   - **Currency**: `ETH`

#### C. Restart Development Server
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

#### D. Clear MetaMask Activity
1. MetaMask → Settings → Advanced
2. Click "Clear activity tab data"
3. Reconnect to the site

### 5. Slow Market Updates

**Symptoms:**
- Markets take >10 seconds to appear
- Data feels stale

**Current Settings:**
- ✅ Auto-refresh every **5 seconds** (`refetchInterval: 5000`)
- ✅ No caching (`staleTime: 0`)
- ✅ Manual refresh button available
- ✅ 1-second delay after poll creation for blockchain sync

**To Speed Up Further:**
```typescript
// In PollList.tsx, reduce refetch interval
query: {
  refetchInterval: 3000, // 3 seconds instead of 5
  staleTime: 0,
}
```

### 6. Transaction Fails: "Insufficient Funds"

**Solutions:**
1. **Fund Your Wallet with Test ETH:**
   ```bash
   # Anvil provides test accounts with ETH
   # Import private key from Anvil output into MetaMask
   ```

2. **Get Mock Tokens:**
   - Click "Get Test Tokens" button in the app
   - Or use the TokenFaucet component

### 7. Cannot Connect Wallet

**Solutions:**
1. **Install MetaMask**
   - Chrome: [MetaMask Extension](https://metamask.io)

2. **Add Anvil Network**
   - Network Name: `Anvil`
   - RPC URL: `http://localhost:3000/api/rpc`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

3. **Import Test Account**
   - Copy private key from Anvil terminal
   - MetaMask → Import Account → Paste key

## 🚀 Performance Optimization

### Current Optimizations
- ✅ Gas limits on all transactions
- ✅ 5-second auto-refresh
- ✅ No data caching for real-time updates
- ✅ Optimized contract calls (moved reputation to claim)
- ✅ Client-side filtering and sorting
- ✅ Skeleton loaders for better UX

### Future Optimizations
- [ ] Implement event listeners for instant updates
- [ ] Add WebSocket support for real-time data
- [ ] Batch multiple contract reads
- [ ] Add query result caching with smart invalidation
- [ ] Consider Layer 2 deployment for lower fees

## 📊 Monitoring

### Check System Health
```bash
# 1. Anvil is running
ps aux | grep anvil

# 2. Frontend is running
lsof -i :3000

# 3. Check recent blocks
cast block-number --rpc-url http://localhost:8545

# 4. Check contract deployment
cast call POLL_FACTORY_ADDRESS "getPollCount()" --rpc-url http://localhost:8545
```

### Debug Logs
The app logs useful information to the browser console:
- `🔄 Refetching polls due to trigger:` - Manual refresh triggered
- `📊 Polls updated, count:` - Poll data received
- `Poll creation transaction confirmed!` - New poll mined
- `Triggering poll list refresh...` - Refresh initiated

## 🆘 Emergency Reset

If nothing works, perform a full reset:

```bash
# 1. Stop all processes (Ctrl+C in all terminals)

# 2. Clean everything
cd /Users/amrendravikramsingh/Desktop/mcz
rm -rf frontend/.next
rm -rf frontend/node_modules
rm -rf contracts/out
rm -rf contracts/cache

# 3. Restart Anvil (new blockchain)
anvil --host 0.0.0.0 --cors-origins "*"

# 4. Redeploy contracts (new terminal)
cd contracts
forge script script/DeployLocal.s.sol --broadcast --rpc-url http://localhost:8545

# 5. Update contract addresses in frontend/lib/contracts.ts

# 6. Reinstall and restart frontend (new terminal)
cd frontend
npm install
npm run dev

# 7. Reset MetaMask
# - Clear activity data
# - Remove and re-add Anvil network
# - Reimport test account
```

## 📞 Getting Help

When reporting issues, include:
1. **Browser console errors** (F12 → Console)
2. **Network tab** (F12 → Network) showing failed requests
3. **Anvil terminal output** showing transactions
4. **Steps to reproduce** the issue
5. **Expected vs actual behavior**

Example issue report:
```
Issue: New market not showing up
Browser: Chrome 120
Console Error: "Failed to fetch"
Steps:
1. Connected wallet
2. Created poll "Test Poll"
3. Transaction confirmed
4. Poll not in list after 30 seconds
Expected: Poll appears within 5 seconds
Actual: Poll never appears
```

