#!/bin/bash

# Test script to verify deployment and check contract functions
# Run this AFTER deploying contracts

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Testing Arbitrum Sepolia Deployment                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if broadcast file exists
BROADCAST_FILE="contracts/broadcast/Deploy.s.sol/421614/run-latest.json"

if [ ! -f "$BROADCAST_FILE" ]; then
    echo "❌ Error: Deployment broadcast file not found"
    echo "   Expected: $BROADCAST_FILE"
    echo ""
    echo "   Please deploy the contracts first:"
    echo "   ./DEPLOY_NOW.sh"
    exit 1
fi

echo "✅ Deployment broadcast file found"
echo ""

# Extract contract addresses
echo "📍 Deployed Contract Addresses:"
echo "────────────────────────────────────────────────────────────"

MOCK_TOKEN=$(cat "$BROADCAST_FILE" | jq -r '.transactions[] | select(.contractName == "MockRepToken") | .contractAddress' | head -1)
REP_REGISTRY=$(cat "$BROADCAST_FILE" | jq -r '.transactions[] | select(.contractName == "ReputationRegistry") | .contractAddress' | head -1)
POLL_FACTORY=$(cat "$BROADCAST_FILE" | jq -r '.transactions[] | select(.contractName == "PollFactory") | .contractAddress' | head -1)

echo "MockRepToken:        $MOCK_TOKEN"
echo "ReputationRegistry:  $REP_REGISTRY"
echo "PollFactory:         $POLL_FACTORY"
echo ""

# Check frontend configuration
echo "🔍 Checking Frontend Configuration:"
echo "────────────────────────────────────────────────────────────"

FRONTEND_CONFIG="frontend/lib/contracts.ts"

if grep -q "$POLL_FACTORY" "$FRONTEND_CONFIG" 2>/dev/null; then
    echo "✅ Frontend is configured with deployed addresses"
else
    echo "⚠️  Frontend configuration doesn't match deployment"
    echo "   Run: node update-frontend-config.js"
fi
echo ""

# Test contract calls using cast
echo "🧪 Testing Contract Functions:"
echo "────────────────────────────────────────────────────────────"

RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"

echo "Testing PollFactory.getPollCount()..."
POLL_COUNT=$(cast call $POLL_FACTORY "getPollCount()" --rpc-url $RPC_URL 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ getPollCount() works: $POLL_COUNT"
else
    echo "❌ getPollCount() failed"
fi

echo ""
echo "Testing PollFactory.getRecentPolls(10)..."
RECENT_POLLS=$(cast call $POLL_FACTORY "getRecentPolls(uint256)" 10 --rpc-url $RPC_URL 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ getRecentPolls() works"
    echo "   Output: ${RECENT_POLLS:0:100}..."
else
    echo "❌ getRecentPolls() failed"
fi

echo ""
echo "Testing MockRepToken.name()..."
TOKEN_NAME=$(cast call $MOCK_TOKEN "name()" --rpc-url $RPC_URL 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ Token name: $TOKEN_NAME"
else
    echo "❌ Token name() failed"
fi

echo ""
echo "────────────────────────────────────────────────────────────"
echo "📊 Deployment Status Summary:"
echo "────────────────────────────────────────────────────────────"
echo ""
echo "✅ Contracts deployed to Arbitrum Sepolia"
echo "✅ Contract addresses extracted"
echo "✅ Contract functions callable"
echo ""
echo "🌐 View on Arbiscan:"
echo "   MockRepToken:       https://sepolia.arbiscan.io/address/$MOCK_TOKEN"
echo "   ReputationRegistry: https://sepolia.arbiscan.io/address/$REP_REGISTRY"
echo "   PollFactory:        https://sepolia.arbiscan.io/address/$POLL_FACTORY"
echo ""
echo "🚀 Next Steps:"
echo "   1. Make sure frontend is updated: node update-frontend-config.js"
echo "   2. Start frontend: cd frontend && npm run dev"
echo "   3. Open http://localhost:3000"
echo "   4. Connect MetaMask to Arbitrum Sepolia"
echo "   5. Start voting! 🎉"
echo ""

