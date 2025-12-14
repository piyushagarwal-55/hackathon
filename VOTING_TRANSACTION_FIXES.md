# Voting Transaction Failure Fixes

## Problem Summary
Intermittent voting transaction failures with "Internal JSON-RPC error" even when:
- Allowance is sufficient
- Balance is sufficient  
- Gas estimation succeeds
- User hasn't voted yet

## Root Causes Identified

### 1. **Race Conditions**
State changes between gas estimation and transaction submission:
- Allowance becomes stale
- User votes in another tab/session
- Poll ends between checks

### 2. **Insufficient Error Reporting**
"Internal JSON-RPC error" masks the actual revert reason from the contract

### 3. **State Synchronization Issues**
Cached data in React Query not reflecting blockchain state

### 4. **Gas Estimation Edge Cases**
Gas estimate may not account for all execution paths

## Fixes Implemented

### ✅ 1. Pre-Flight Validation
Added comprehensive state checks immediately before vote submission:

```typescript
// Re-validate critical state before transaction
const currentVoteStatus = await publicClient?.readContract({...});
const currentAllowance = await publicClient?.readContract({...});  
const pollActive = await publicClient?.readContract({...});
```

**Benefits:**
- Catches race conditions
- Validates fresh blockchain state
- Prevents failed transactions

### ✅ 2. Enhanced Gas Handling
```typescript
// Add 20% buffer to gas estimate
gasEstimate = (estimate * 120n) / 100n;
```

**Benefits:**
- Prevents out-of-gas failures
- Accounts for state changes
- More reliable execution

### ✅ 3. Better Error Capture
```typescript
console.error('Error data:', error.data);
console.error('Error cause:', error.cause);
console.error('Error metaMessages:', error.metaMessages);
console.error('Error walk:', error.walk ? error.walk() : 'N/A');
```

**Benefits:**
- Exposes actual revert reasons
- Aids debugging
- Better user feedback

### ✅ 4. Transaction Delay
```typescript
// Add 500ms delay to ensure state propagation
await new Promise(resolve => setTimeout(resolve, 500));
```

**Benefits:**
- Allows state to propagate
- Reduces nonce conflicts
- Prevents race conditions

### ✅ 5. Manual State Refresh
Added UI button to manually refresh all state:

```typescript
<button onClick={() => {
  refetchBalance();
  refetchAllowance();
  refetchVote();
}}>
  🔄 Refresh State
</button>
```

**Benefits:**
- User can recover from errors
- Forces fresh data fetch
- No page reload needed

### ✅ 6. Status Indicator
Added real-time status display showing:
- Current balance
- Current allowance
- Required amount
- Vote status

**Benefits:**
- User visibility
- Easier debugging
- Clear state indication

### ✅ 7. Improved Error Handling
Specific handlers for common errors:
- Internal JSON-RPC errors
- Nonce errors
- Allowance errors
- Vote status errors

```typescript
} else if (errorMessage.includes('Internal JSON-RPC')) {
  toast.error('🔍 Transaction failed. Check console for details.');
  // Force full state refresh
  setTimeout(() => {
    refetchBalance();
    refetchAllowance();
    refetchVote();
  }, 1000);
}
```

## Testing Checklist

### Before Voting
- [ ] Check balance is sufficient
- [ ] Check allowance is approved
- [ ] Verify you haven't voted yet
- [ ] Confirm poll is still active

### If Transaction Fails
1. **Check Console Logs**
   - Look for specific revert reasons
   - Check pre-flight validation results
   - Review gas estimation logs

2. **Use Refresh Button**
   - Click "🔄 Refresh State"
   - Wait 2-3 seconds
   - Try voting again

3. **Re-approve if Needed**
   - Allowance might be stale
   - Approve again with buffer
   - Wait for approval confirmation

4. **Check MetaMask**
   - Look for pending transactions
   - Check nonce isn't stuck
   - Verify network is correct

## Common Error Messages & Solutions

### "Internal JSON-RPC error"
**Possible Causes:**
1. Poll ended between checks → Refresh page
2. Already voted (race condition) → Click refresh button
3. Insufficient allowance (stale) → Re-approve tokens
4. Network/RPC issue → Try again in 30 seconds

**Solution:**
1. Click "🔄 Refresh State" button
2. Check status indicator shows green checkmarks
3. Try voting again
4. If fails again, refresh entire page

### "User denied transaction"
**Cause:** Transaction rejected in MetaMask

**Solution:** Review transaction details and approve

### "Nonce too high/low"
**Cause:** MetaMask nonce out of sync

**Solution:**
1. Click "🔄 Refresh State"
2. Wait 5 seconds
3. Reset MetaMask account (Settings → Advanced → Reset Account)
4. Try again

### "Insufficient allowance"
**Cause:** Approval didn't complete or allowance consumed

**Solution:**
1. Click approve button again
2. Wait for confirmation (check status indicator)
3. Ensure allowance shows >= required amount
4. Try voting

### "Already voted"
**Cause:** Vote was successful but UI didn't update

**Solution:**
1. Click "🔄 Refresh State"
2. Page will update to show your vote
3. Check "Voted" status shows "✅ Yes"

## Debug Logs Explanation

### Pre-Flight Checks
```
🔍 Re-validating state before vote submission...
Current allowance (final check): 11000000000000000000
✅ All pre-flight checks passed
```
All validations passed - safe to proceed

### Gas Estimation
```
Estimating gas...
Gas estimate: 200489 → with buffer: 240587
```
Gas calculated with 20% safety buffer

### Vote Submission
```
Submitting vote transaction with gas: 240587
📝 Vote transaction submitted...
```
Transaction sent to network

### Error Logs
```
=== VOTE ERROR ===
Error cause: { code: -32603, message: "..." }
```
Check error cause for actual revert reason

## Prevention Best Practices

### For Users
1. **Don't rush** - Wait for each transaction to confirm
2. **Check status** - Use status indicator before voting
3. **Refresh if unsure** - Use refresh button liberally
4. **One tab only** - Don't vote from multiple tabs
5. **Wait for approvals** - Ensure approval confirms before voting

### For Developers
1. **Always validate state** - Don't trust cached data
2. **Add gas buffers** - Account for state changes
3. **Log everything** - More logs = easier debugging
4. **Provide manual refresh** - Let users recover from errors
5. **Show state clearly** - Status indicators prevent confusion

## Metrics to Monitor

After these fixes, we should see:
- ✅ Lower transaction failure rate
- ✅ Better error messages in console
- ✅ Fewer "Internal JSON-RPC" errors
- ✅ Successful recovery via refresh button
- ✅ Clear user feedback on state

## Next Steps if Issues Persist

1. **Check RPC Node**
   - Try different RPC endpoint
   - Check node sync status
   - Monitor node errors

2. **Contract Review**
   - Add detailed revert messages
   - Add events for debugging
   - Review transferFrom logic

3. **Frontend Improvements**
   - Add transaction simulation
   - Implement optimistic updates
   - Add retry logic with exponential backoff

4. **Network Issues**
   - Check chain congestion
   - Verify gas prices
   - Monitor mempool

## Files Modified
- `frontend/components/PolymarketStyleVote.tsx` - Main voting component with all fixes

## Key Code Changes

1. **Pre-flight validation** (lines ~250-290)
2. **Enhanced gas estimation** (lines ~290-350)
3. **Improved error handling** (lines ~360-420)
4. **Status indicator UI** (lines ~875-915)
5. **Manual refresh button** (lines ~870-885)

---

**Last Updated:** December 14, 2025
**Status:** ✅ Implemented and Ready for Testing
