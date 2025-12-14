#!/bin/bash

# Extract ABIs from compiled contracts and save to frontend

echo "📦 Extracting ABIs from compiled contracts..."

FRONTEND_DIR="../frontend/lib"
OUT_DIR="./out"

# Create output directory if it doesn't exist
mkdir -p "$FRONTEND_DIR"

# Extract each contract ABI
echo "Extracting MockRepToken ABI..."
jq '.abi' "$OUT_DIR/MockRepToken.sol/MockRepToken.json" > "$FRONTEND_DIR/MockRepToken.abi.json"

echo "Extracting ReputationRegistry ABI..."
jq '.abi' "$OUT_DIR/ReputationRegistry.sol/ReputationRegistry.json" > "$FRONTEND_DIR/ReputationRegistry.abi.json"

echo "Extracting PollFactory ABI..."
jq '.abi' "$OUT_DIR/PollFactory.sol/PollFactory.json" > "$FRONTEND_DIR/PollFactory.abi.json"

echo "Extracting Poll ABI..."
jq '.abi' "$OUT_DIR/Poll.sol/Poll.json" > "$FRONTEND_DIR/Poll.abi.json"

echo "✅ ABIs extracted successfully to $FRONTEND_DIR"
echo ""
echo "Files created:"
ls -lh "$FRONTEND_DIR"/*.abi.json

