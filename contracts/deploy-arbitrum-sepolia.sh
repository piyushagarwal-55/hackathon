#!/bin/bash

# Deployment script for Arbitrum Sepolia
# Usage: ./deploy-arbitrum-sepolia.sh

echo "🚀 Deploying RepVote contracts to Arbitrum Sepolia..."
echo ""

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set"
    echo ""
    echo "To set it, run:"
    echo "  export PRIVATE_KEY=0x..."
    echo ""
    echo "⚠️  WARNING: Make sure you're using a testnet wallet with Arbitrum Sepolia ETH!"
    echo "   You can get testnet ETH from: https://faucet.quicknode.com/arbitrum/sepolia"
    exit 1
fi

# Run the deployment
echo "📝 Running deployment script..."
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url arbitrum_sepolia \
    --broadcast \
    --slow

echo ""
echo "✅ Deployment complete!"
echo "Check the broadcast folder for deployment details"

