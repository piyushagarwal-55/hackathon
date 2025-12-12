# RepVote Contract Deployment Guide

## Prerequisites

1. **Foundry installed** (already done via `foundryup`)
2. **Sepolia testnet ETH** - Get from faucets:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - https://faucet.quicknode.com/ethereum/sepolia

3. **RPC Provider** (choose one):
   - Alchemy: https://www.alchemy.com/
   - Infura: https://infura.io/
   - Public RPC: https://chainlist.org/chain/11155111

## Deployment Steps

### 1. Setup Environment Variables

```bash
cd contracts
cp .env.example .env
```

Edit `.env` and add:
- Your private key (account with Sepolia ETH)
- Sepolia RPC URL
- Etherscan API key (for verification)

### 2. Deploy Contracts

```bash
# Deploy to Sepolia testnet
forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC_URL --broadcast --verify -vvvv

# Or deploy without verification (faster)
forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC_URL --broadcast
```

### 3. Verify Contracts (if not done in step 2)

```bash
# Get the deployment addresses from the output, then verify each:

forge verify-contract \
  --chain-id 11155111 \
  --compiler-version v0.8.19 \
  <CONTRACT_ADDRESS> \
  src/ReputationRegistry.sol:ReputationRegistry

forge verify-contract \
  --chain-id 11155111 \
  --compiler-version v0.8.19 \
  --constructor-args $(cast abi-encode "constructor(address)" <REP_REGISTRY_ADDRESS>) \
  <FACTORY_ADDRESS> \
  src/PollFactory.sol:PollFactory
```

### 4. Save Contract Addresses

After deployment, you'll see output like:

```
ReputationRegistry: 0x1234...
PollFactory: 0x5678...
Demo Poll: 0x9abc...
```

**Copy these addresses!** You'll need them for:
- Frontend configuration
- Demo script
- Documentation

### 5. Bootstrap Reputation (Optional)

If you want to set up test accounts with reputation:

```bash
cast send <REP_REGISTRY_ADDRESS> \
  "bootstrapReputation(address[],uint256[])" \
  "[0xYourAddress1,0xYourAddress2]" \
  "[1000,500]" \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Deployment Checklist

- [ ] Contracts compiled successfully (`forge build`)
- [ ] All tests pass (`forge test`)
- [ ] Have Sepolia ETH in deployment account
- [ ] `.env` file configured
- [ ] Deployed to Sepolia
- [ ] Contracts verified on Etherscan
- [ ] Addresses saved for frontend
- [ ] Test poll created and verified

## Troubleshooting

### "Insufficient funds"
- Get more Sepolia ETH from faucets
- Each deployment costs ~0.02 ETH

### "RPC error"
- Check your RPC URL is correct
- Try a different provider (Alchemy, Infura, public)

### "Verification failed"
- Wait a few minutes and try again
- Ensure correct compiler version (0.8.19)
- Check constructor arguments match deployment

## Estimated Costs

- ReputationRegistry: ~0.006 ETH
- PollFactory: ~0.008 ETH
- Demo Poll: ~0.004 ETH
- **Total: ~0.02 ETH** (Sepolia testnet)

## Post-Deployment

1. **Test the contracts** by voting through Etherscan
2. **Update frontend config** with contract addresses
3. **Create demo polls** for presentation
4. **Document addresses** in README

## Contract Addresses (Sepolia)

> **TODO:** Add deployed contract addresses here after deployment

- **ReputationRegistry**: `0x...`
- **PollFactory**: `0x...`
- **Demo Poll**: `0x...`

## Verification Links

- Sepolia Etherscan: https://sepolia.etherscan.io/
- Contract verification: https://sepolia.etherscan.io/verifyContract

## Next Steps

After deployment:
1. Move to frontend development
2. Configure frontend with contract addresses
3. Test voting flow end-to-end
4. Prepare demo script
