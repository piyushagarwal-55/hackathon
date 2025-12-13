# 💰 Mock Token Betting Implementation Guide

> ⚠️ **TESTNET DEMO ONLY**  
> This project uses Arbitrum Sepolia testnet with **FREE mock tokens (REP)**.
>
> - **No real money involved**
> - **Free tokens from faucet**
> - **For demonstration purposes only**

## Quick Summary

This system uses **MockRepToken** - a free-to-mint ERC20 token for testnet demonstration. Users can get unlimited tokens from the faucet and bet them on polls without any real financial risk.

## Contract Modifications Needed

### 1. Modify `Poll.sol`

```solidity
// Add at top
uint256 public constant CREDIT_PRICE = 0.01 ether; // 1 credit = 0.01 ETH
uint256 public totalBetAmount;
mapping(address => uint256) public userBets;

// Modify vote function
function vote(uint256 optionId) external payable {
    if (block.timestamp >= endTime) revert PollClosed();
    if (votes[msg.sender].timestamp > 0) revert AlreadyVoted();
    if (optionId >= options.length) revert InvalidOption();
    if (msg.value == 0) revert InvalidCredits();

    // Convert ETH to credits
    uint256 credits = msg.value / CREDIT_PRICE;
    if (credits == 0 || credits > MAX_CREDITS_PER_USER) revert InvalidCredits();

    // Store bet amount
    userBets[msg.sender] = msg.value;
    totalBetAmount += msg.value;

    // Rest of voting logic remains same
    uint256 weightedVotes = _calculateVoteWeight(msg.sender, credits);
    // ...
}

// Add withdrawal function for winners
function claimWinnings() external {
    require(block.timestamp >= endTime, "Poll not ended");
    require(votes[msg.sender].timestamp > 0, "Did not vote");

    (uint256 winningOption, ) = getWinner();
    require(votes[msg.sender].option == winningOption, "Not a winner");
    require(userBets[msg.sender] > 0, "Already claimed");

    // Calculate share: (user's weighted votes / total winning votes) * total bet amount
    uint256 winningOptionVotes = results[winningOption];
    uint256 userShare = (votes[msg.sender].weightedVotes * totalBetAmount) / winningOptionVotes;

    userBets[msg.sender] = 0;
    payable(msg.sender).transfer(userShare);

    emit WinningsClaimed(msg.sender, userShare);
}

event WinningsClaimed(address indexed user, uint256 amount);
```

### 2. Update `PollFactory.sol`

No changes needed - Factory just creates polls.

### 3. Redeploy Contracts

```bash
cd contracts

# Test changes
forge test

# Deploy to Sepolia
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ARBITRUM_SEPOLIA_RPC \
  --broadcast \
  --verify \
  -vvvv

# Save new addresses!
```

## Frontend Modifications

### 1. Update `contracts.ts` - Add new endpoints

```typescript
export const POLL_ABI = [
  // ... existing entries ...
  {
    inputs: [],
    name: "CREDIT_PRICE",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalBetAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "userBets",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Update vote function
  {
    inputs: [{ name: "optionId", type: "uint256" }],
    name: "vote",
    outputs: [],
    stateMutability: "payable", // Changed from nonpayable
    type: "function",
  },
] as const;
```

### 2. Update `PolymarketStyleVote.tsx`

```typescript
// Add ETH balance check
const { data: ethBalance } = useBalance({
  address: address,
  query: { enabled: !!address },
});

// Add credit price fetch
const { data: creditPrice } = useReadContract({
  address: pollAddress,
  abi: POLL_ABI,
  functionName: "CREDIT_PRICE",
  query: { enabled: !isZeroAddress },
});

// Add total bet amount
const { data: totalBetAmount } = useReadContract({
  address: pollAddress,
  abi: POLL_ABI,
  functionName: "totalBetAmount",
  query: { enabled: !isZeroAddress },
});

// Calculate ETH needed
const ethNeeded = creditPrice ? BigInt(creditsSpent) * creditPrice : BigInt(0);

// Update vote function
const handleVote = async () => {
  if (!isConnected) {
    toast.error("Please connect your wallet");
    return;
  }

  try {
    writeContract({
      address: pollAddress,
      abi: POLL_ABI,
      functionName: "vote",
      args: [BigInt(selectedOption)],
      value: ethNeeded, // Send ETH with transaction
    });

    toast.info("Transaction submitted...");
  } catch (error: any) {
    toast.error(error.shortMessage || "Failed to cast vote");
  }
};

// Update UI to show ETH amounts
<div className="mb-4">
  <label className="text-xs text-slate-400 mb-2 block">Bet Amount</label>
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
      Ξ
    </span>
    <input
      type="number"
      value={creditsSpent}
      onChange={(e) => setCreditsSpent(Number(e.target.value))}
      className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      placeholder="0"
      max="100"
      min="1"
    />
  </div>
  <div className="flex items-center justify-between mt-2 text-xs">
    <span className="text-slate-400">= {formatEther(ethNeeded)} ETH</span>
    <span className="text-slate-400">
      Balance: {ethBalance ? formatEther(ethBalance.value) : "0"} ETH
    </span>
  </div>
</div>;

// Add claim button after voting
{
  hasVoted && isEnded && (
    <button
      onClick={handleClaim}
      className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
    >
      Claim Winnings
    </button>
  );
}
```

### 3. Display Total Betting Pool

```typescript
// In the header section
<div className="flex items-center gap-2">
  <span className="text-slate-400">Prize Pool:</span>
  <span className="font-bold text-amber-400">
    Ξ {totalBetAmount ? formatEther(totalBetAmount) : "0"} ETH
  </span>
</div>
```

## Testing Checklist

### Before Redeployment

- [ ] Run all tests: `forge test`
- [ ] Test locally with Anvil
- [ ] Verify credit price calculation (0.01 ETH = 1 credit)
- [ ] Test winner calculation
- [ ] Test claiming logic

### After Deployment

- [ ] Verify contracts on Arbiscan
- [ ] Update frontend contract addresses
- [ ] Test creating poll
- [ ] Test voting with ETH
- [ ] Test multiple users voting
- [ ] Test claiming winnings after poll ends
- [ ] Check ETH balances are correct

## Advantages of Using ETH on Arbitrum

1. **Low Gas Fees**: Arbitrum L2 = ~$0.01 per transaction
2. **Fast**: 250ms block time vs 12s on Ethereum
3. **Native Token**: No need for custom tokens initially
4. **Easy Testing**: Free testnet ETH from faucets
5. **Familiar UX**: Users understand ETH

## Alternative: USDC on Arbitrum

If you want stablecoin backing instead:

```solidity
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Poll {
    IERC20 public immutable bettingToken;
    uint256 public constant CREDIT_PRICE = 1e16; // 0.01 USDC

    constructor(..., address _bettingToken) {
        bettingToken = IERC20(_bettingToken);
        // ...
    }

    function vote(uint256 optionId, uint256 amount) external {
        // Transfer USDC from user
        bettingToken.transferFrom(msg.sender, address(this), amount);
        uint256 credits = amount / CREDIT_PRICE;
        // ...
    }
}
```

## Estimated Implementation Time

- **Contract Changes**: 1-2 hours
- **Testing**: 1 hour
- **Redeployment**: 30 minutes
- **Frontend Updates**: 2-3 hours
- **End-to-End Testing**: 1 hour

**Total**: ~6 hours

## Quick Start (Fastest Path)

1. Modify `Poll.sol` vote function to accept ETH
2. Add `claimWinnings()` function
3. Redeploy to Sepolia
4. Update frontend contract addresses
5. Add ETH input to voting UI
6. Test on testnet

Done! You now have a real prediction market with actual betting.

## Notes

- Start with ETH for simplicity
- Can add USDC support later
- Consider adding house edge (small fee) for sustainability
- Add referral system for viral growth
- Consider time-weighted rewards for early voters

---

**Ready to implement?** Start with contract modifications, test thoroughly, then update the frontend!
