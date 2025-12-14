#!/bin/bash

# RepVote Installation Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 RepVote Installation Script"
echo "================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi
echo "✅ npm $(npm --version) found"

# Check Foundry
if ! command -v forge &> /dev/null; then
    echo "⚠️  Foundry not found. Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true
    foundryup
    
    if ! command -v forge &> /dev/null; then
        echo "❌ Foundry installation failed. Please install manually: https://book.getfoundry.sh/"
        exit 1
    fi
fi
echo "✅ Foundry $(forge --version | head -n1) found"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install frontend dependencies
echo "1️⃣  Installing frontend dependencies..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..

# Install bot dependencies
echo ""
echo "2️⃣  Installing bot dependencies..."
cd bot
npm install
echo "✅ Bot dependencies installed"
cd ..

# Setup contracts
echo ""
echo "3️⃣  Setting up smart contracts..."
cd contracts

# Install Foundry dependencies
echo "   Installing forge-std..."
forge install foundry-rs/forge-std --no-commit 2>/dev/null || echo "   (forge-std already installed)"

# Compile contracts
echo "   Compiling contracts..."
forge build

# Run tests
echo "   Running tests..."
if forge test --no-match-test "testFuzz" > /dev/null 2>&1; then
    echo "✅ Smart contracts compiled and tested successfully"
else
    echo "⚠️  Some tests failed, but contracts compiled. Review with: forge test"
fi

cd ..

# Setup .env examples
echo ""
echo "4️⃣  Setting up environment files..."

if [ ! -f "contracts/.env" ]; then
    if [ -f "contracts/.env.example" ]; then
        echo "   Creating contracts/.env from template..."
        cp contracts/.env.example contracts/.env
        echo "   ⚠️  Remember to edit contracts/.env with your keys!"
    fi
fi

if [ ! -f "frontend/.env.local" ]; then
    if [ -f "frontend/.env.example" ]; then
        echo "   Creating frontend/.env.local from template..."
        cp frontend/.env.example frontend/.env.local
        echo "   ⚠️  Remember to edit frontend/.env.local with your WalletConnect ID!"
    fi
fi

if [ ! -f "bot/.env" ]; then
    if [ -f "bot/.env.example" ]; then
        echo "   Creating bot/.env from template..."
        cp bot/.env.example bot/.env
        echo "   ⚠️  Remember to edit bot/.env with contract addresses!"
    fi
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "================================"
echo "📚 Next Steps:"
echo "================================"
echo ""
echo "1. Get Sepolia testnet ETH:"
echo "   - https://sepoliafaucet.com/"
echo "   - https://www.alchemy.com/faucets/ethereum-sepolia"
echo ""
echo "2. Edit contracts/.env with your keys:"
echo "   - PRIVATE_KEY (MetaMask private key)"
echo "   - SEPOLIA_RPC_URL (Alchemy/Infura URL)"
echo "   - ETHERSCAN_API_KEY (for verification)"
echo ""
echo "3. Deploy smart contracts:"
echo "   cd contracts"
echo "   source .env"
echo "   forge script script/Deploy.s.sol --rpc-url \$SEPOLIA_RPC_URL --broadcast --verify"
echo ""
echo "4. Update frontend/lib/contracts.ts with deployed addresses"
echo ""
echo "5. Start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "6. Open http://localhost:3000 in your browser"
echo ""
echo "================================"
echo "📖 For detailed instructions, see SETUP.md"
echo "🎬 For demo preparation, see DEMO_SCRIPT.md"
echo "================================"
echo ""
echo "Happy hacking! 🎉"

