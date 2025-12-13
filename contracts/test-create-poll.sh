#!/bin/bash
# Test script to create a poll

cd /mnt/c/Users/LENOVO/Desktop/mcz/contracts

~/.foundry/bin/cast send \
  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "createPoll(string,string[],uint256,uint256)" \
  "What feature should we prioritize?" \
  '["Feature A","Feature B","Feature C"]' \
  604800 \
  10 \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

echo ""
echo "Checking poll count..."
~/.foundry/bin/cast call \
  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "getPollCount()" \
  --rpc-url http://localhost:8545
