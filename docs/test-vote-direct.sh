#!/bin/bash

# Test script to verify voting works directly on the contract

echo "Testing direct vote on poll contract..."
echo "Poll Address: 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e"
echo ""

cd contracts

# Get current results before vote
echo "=== BEFORE VOTE ==="
cast call 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e "getResults()" --rpc-url http://localhost:8545

echo ""
echo "Total voters before:"
cast call 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e "totalVoters()" --rpc-url http://localhost:8545

echo ""
echo "=== SUBMITTING VOTE ==="
echo "Voting for option 0 with 25 credits..."

# Submit a vote (option 0, 25 credits) using the default anvil account
cast send 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e \
  "vote(uint256,uint256)" \
  0 25 \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

echo ""
echo "=== AFTER VOTE ==="
cast call 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e "getResults()" --rpc-url http://localhost:8545

echo ""
echo "Total voters after:"
cast call 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e "totalVoters()" --rpc-url http://localhost:8545

echo ""
echo "User's vote record:"
cast call 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e \
  "votes(address)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545
