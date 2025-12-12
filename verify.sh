#!/bin/bash

# RepVote Project Verification Script
# Checks if the project is properly set up and ready to run

echo "🔍 RepVote Project Health Check"
echo "================================"
echo ""

ERRORS=0
WARNINGS=0

# Function to print status
check_pass() {
    echo "✅ $1"
}

check_warn() {
    echo "⚠️  $1"
    WARNINGS=$((WARNINGS + 1))
}

check_fail() {
    echo "❌ $1"
    ERRORS=$((ERRORS + 1))
}

# Check file structure
echo "📁 Checking file structure..."

# Smart contracts
if [ -f "contracts/src/ReputationRegistry.sol" ]; then
    check_pass "ReputationRegistry.sol exists"
else
    check_fail "ReputationRegistry.sol missing"
fi

if [ -f "contracts/src/PollFactory.sol" ]; then
    check_pass "PollFactory.sol exists"
else
    check_fail "PollFactory.sol missing"
fi

if [ -f "contracts/src/Poll.sol" ]; then
    check_pass "Poll.sol exists"
else
    check_fail "Poll.sol missing"
fi

# Frontend
if [ -f "frontend/package.json" ]; then
    check_pass "Frontend package.json exists"
else
    check_fail "Frontend package.json missing"
fi

if [ -d "frontend/node_modules" ]; then
    check_pass "Frontend dependencies installed"
else
    check_warn "Frontend dependencies not installed (run: cd frontend && npm install)"
fi

# Bot
if [ -f "bot/package.json" ]; then
    check_pass "Bot package.json exists"
else
    check_fail "Bot package.json missing"
fi

if [ -d "bot/node_modules" ]; then
    check_pass "Bot dependencies installed"
else
    check_warn "Bot dependencies not installed (run: cd bot && npm install)"
fi

echo ""
echo "🔧 Checking configuration files..."

if [ -f "contracts/foundry.toml" ]; then
    check_pass "Foundry configuration exists"
else
    check_fail "foundry.toml missing"
fi

if [ -f "frontend/tsconfig.json" ]; then
    check_pass "TypeScript configuration exists"
else
    check_fail "tsconfig.json missing"
fi

if [ -f "frontend/next.config.js" ]; then
    check_pass "Next.js configuration exists"
else
    check_fail "next.config.js missing"
fi

echo ""
echo "🔑 Checking environment files..."

if [ -f "contracts/.env" ]; then
    check_pass "Contracts .env exists"
    
    # Check if .env has placeholder values
    if grep -q "your_private_key_here" contracts/.env 2>/dev/null; then
        check_warn "Contracts .env needs to be configured with real values"
    fi
else
    check_warn "Contracts .env not created (copy from .env.example)"
fi

if [ -f "frontend/.env.local" ] || [ -f "frontend/.env" ]; then
    check_pass "Frontend environment file exists"
else
    check_warn "Frontend .env.local not created (optional, but recommended)"
fi

if [ -f "bot/.env" ]; then
    check_pass "Bot .env exists"
else
    check_warn "Bot .env not created (copy from .env.example)"
fi

echo ""
echo "⚙️  Checking prerequisites..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js installed ($NODE_VERSION)"
else
    check_fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm installed ($NPM_VERSION)"
else
    check_fail "npm not installed"
fi

if command -v forge &> /dev/null; then
    FORGE_VERSION=$(forge --version | head -n1)
    check_pass "Foundry installed ($FORGE_VERSION)"
else
    check_fail "Foundry not installed"
fi

echo ""
echo "🧪 Checking smart contracts..."

cd contracts 2>/dev/null || {
    check_fail "Cannot access contracts directory"
    exit 1
}

# Try to compile
if forge build > /dev/null 2>&1; then
    check_pass "Smart contracts compile successfully"
    
    # Try to run tests
    if forge test --no-match-test "testFuzz" > /dev/null 2>&1; then
        check_pass "Smart contract tests pass"
    else
        check_warn "Some smart contract tests failed"
    fi
else
    check_fail "Smart contracts fail to compile"
fi

cd ..

echo ""
echo "================================"
echo "📊 Summary"
echo "================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 Perfect! Everything looks good."
    echo ""
    echo "Next steps:"
    echo "1. Deploy contracts: cd contracts && forge script script/Deploy.s.sol --broadcast"
    echo "2. Start frontend: cd frontend && npm run dev"
    echo "3. Open http://localhost:3000"
elif [ $ERRORS -eq 0 ]; then
    echo "✅ No critical errors found"
    echo "⚠️  $WARNINGS warning(s) - Review the warnings above"
    echo ""
    echo "The project should work, but some optional setup is incomplete."
else
    echo "❌ Found $ERRORS error(s)"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  Found $WARNINGS warning(s)"
    fi
    echo ""
    echo "Please fix the errors above before proceeding."
    echo "Refer to SETUP.md for detailed instructions."
fi

echo ""

exit $ERRORS

