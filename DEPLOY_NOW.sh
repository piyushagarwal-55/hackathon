#!/bin/bash

# Complete deployment and configuration script
# This script will deploy contracts and update the frontend automatically

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  RepVote Deployment Script - Arbitrum Sepolia              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if running from correct directory
if [ ! -d "contracts" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: /Users/amrendravikramsingh/Desktop/mcz"
    exit 1
fi

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set"
    echo ""
    echo "Please set your private key first:"
    echo "  export PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE"
    echo ""
    echo "⚠️  Use a TESTNET wallet only!"
    echo "   Get Arbitrum Sepolia ETH from:"
    echo "   - https://faucet.quicknode.com/arbitrum/sepolia"
    exit 1
fi

# Confirm deployment
echo "⚠️  WARNING: You are about to deploy contracts to Arbitrum Sepolia testnet"
echo ""
echo "Network Details:"
echo "  - Network: Arbitrum Sepolia"
echo "  - Chain ID: 421614"
echo "  - RPC: https://sepolia-rollup.arbitrum.io/rpc"
echo ""
read -p "Continue with deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Step 1/4: Building contracts..."
echo "════════════════════════════════════════════════════════════"
cd contracts
forge build --skip test

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Step 2/4: Deploying contracts to Arbitrum Sepolia..."
echo "════════════════════════════════════════════════════════════"
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url https://sepolia-rollup.arbitrum.io/rpc \
    --broadcast \
    --slow

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Step 3/4: Extracting ABIs..."
echo "════════════════════════════════════════════════════════════"
./extract-abis.sh

cd ..

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Step 4/4: Updating frontend configuration..."
echo "════════════════════════════════════════════════════════════"
node update-frontend-config.js

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ DEPLOYMENT COMPLETE!                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Deployment Summary:"
echo "   - Contracts deployed to Arbitrum Sepolia"
echo "   - ABIs extracted and saved to frontend/lib/"
echo "   - Frontend configuration updated"
echo ""
echo "🚀 Next Steps:"
echo "   1. cd frontend"
echo "   2. npm run dev"
echo "   3. Open http://localhost:3000"
echo "   4. Connect MetaMask to Arbitrum Sepolia"
echo "   5. Start creating polls!"
echo ""
echo "📍 View your contracts on Arbiscan:"
cat contracts/broadcast/Deploy.s.sol/421614/run-latest.json | grep -o '"contractAddress":"[^"]*"' | head -3 | while read line; do
    addr=$(echo $line | cut -d'"' -f4)
    echo "   https://sepolia.arbiscan.io/address/$addr"
done
echo ""

