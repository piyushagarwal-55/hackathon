#!/usr/bin/env node

/**
 * Script to automatically update frontend configuration with deployed contract addresses
 * Run this after deploying contracts to Arbitrum Sepolia
 */

const fs = require('fs');
const path = require('path');

const BROADCAST_FILE = path.join(__dirname, 'contracts/broadcast/Deploy.s.sol/421614/run-latest.json');
const FRONTEND_CONFIG = path.join(__dirname, 'frontend/lib/contracts.ts');

// ABI files
const MOCK_TOKEN_ABI = path.join(__dirname, 'frontend/lib/MockRepToken.abi.json');
const REP_REGISTRY_ABI = path.join(__dirname, 'frontend/lib/ReputationRegistry.abi.json');
const POLL_FACTORY_ABI = path.join(__dirname, 'frontend/lib/PollFactory.abi.json');
const POLL_ABI = path.join(__dirname, 'frontend/lib/Poll.abi.json');

console.log('🔍 Reading deployment data from broadcast...');

// Read the broadcast file
if (!fs.existsSync(BROADCAST_FILE)) {
  console.error('❌ Broadcast file not found!');
  console.error('   Expected at:', BROADCAST_FILE);
  console.error('   Make sure you have deployed the contracts first.');
  process.exit(1);
}

const broadcastData = JSON.parse(fs.readFileSync(BROADCAST_FILE, 'utf8'));

// Extract contract addresses from transactions
let mockTokenAddress, repRegistryAddress, pollFactoryAddress;

console.log('📦 Extracting contract addresses...');

for (const tx of broadcastData.transactions) {
  if (tx.transactionType === 'CREATE') {
    const contractName = tx.contractName;
    const address = tx.contractAddress;
    
    if (contractName === 'MockRepToken') {
      mockTokenAddress = address;
      console.log(`   MockRepToken: ${address}`);
    } else if (contractName === 'ReputationRegistry') {
      repRegistryAddress = address;
      console.log(`   ReputationRegistry: ${address}`);
    } else if (contractName === 'PollFactory') {
      pollFactoryAddress = address;
      console.log(`   PollFactory: ${address}`);
    }
  }
}

if (!mockTokenAddress || !repRegistryAddress || !pollFactoryAddress) {
  console.error('❌ Could not find all contract addresses in broadcast file');
  process.exit(1);
}

// Read ABIs
console.log('\n📖 Reading ABIs...');
const mockTokenAbi = JSON.parse(fs.readFileSync(MOCK_TOKEN_ABI, 'utf8'));
const repRegistryAbi = JSON.parse(fs.readFileSync(REP_REGISTRY_ABI, 'utf8'));
const pollFactoryAbi = JSON.parse(fs.readFileSync(POLL_FACTORY_ABI, 'utf8'));
const pollAbi = JSON.parse(fs.readFileSync(POLL_ABI, 'utf8'));

// Generate new contracts.ts file
console.log('\n📝 Generating new contracts.ts...');

const contractsContent = `/**
 * Contract addresses and ABIs for RepVote system
 * Deployed on Arbitrum Sepolia Testnet
 * 
 * Generated automatically by update-frontend-config.js
 * Last updated: ${new Date().toISOString()}
 */

// Deployed contract addresses (Arbitrum Sepolia - Chain ID: 421614)
export const MOCK_TOKEN_ADDRESS = "${mockTokenAddress}" as \`0x\${string}\`;
export const REPUTATION_REGISTRY_ADDRESS = "${repRegistryAddress}" as \`0x\${string}\`;
export const POLL_FACTORY_ADDRESS = "${pollFactoryAddress}" as \`0x\${string}\`;

// Full ABIs from compiled contracts
export const MOCK_TOKEN_ABI = ${JSON.stringify(mockTokenAbi, null, 2)} as const;

export const REPUTATION_REGISTRY_ABI = ${JSON.stringify(repRegistryAbi, null, 2)} as const;

export const POLL_FACTORY_ABI = ${JSON.stringify(pollFactoryAbi, null, 2)} as const;

export const POLL_ABI = ${JSON.stringify(pollAbi, null, 2)} as const;

// Convenience exports
export const ERC20_ABI = MOCK_TOKEN_ABI;
`;

// Write the new file
fs.writeFileSync(FRONTEND_CONFIG, contractsContent);

console.log('✅ Successfully updated frontend configuration!');
console.log(`\n📍 Contract addresses saved to: ${FRONTEND_CONFIG}`);
console.log('\n🎉 Your frontend is now configured to use the deployed contracts on Arbitrum Sepolia!');
console.log('\n📋 Summary:');
console.log(`   Network: Arbitrum Sepolia (Chain ID: 421614)`);
console.log(`   MockRepToken: ${mockTokenAddress}`);
console.log(`   ReputationRegistry: ${repRegistryAddress}`);
console.log(`   PollFactory: ${pollFactoryAddress}`);
console.log('\n🚀 Next steps:');
console.log('   1. Start your frontend: cd frontend && npm run dev');
console.log('   2. Connect MetaMask to Arbitrum Sepolia');
console.log('   3. Test creating and voting on polls!');

