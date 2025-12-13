# Kill any existing Anvil processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    wsl bash -c "sudo pkill -9 anvil 2>/dev/null || true"
    Start-Sleep -Seconds 1
} catch {}

# Start Anvil in background with CORS and auto-mining
Write-Host "Starting Anvil blockchain..." -ForegroundColor Green
Write-Host "  - CORS enabled for frontend" -ForegroundColor Cyan
Write-Host "  - Auto-mining every 1 second" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "wsl bash -c 'cd /mnt/c/Users/LENOVO/Desktop/mcz/contracts && ~/.foundry/bin/anvil --host 0.0.0.0 --block-time 1'"

# Wait for Anvil to start
Write-Host "Waiting for Anvil to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 7

# Deploy contracts
Write-Host "Deploying contracts..." -ForegroundColor Green
wsl bash -c "cd /mnt/c/Users/LENOVO/Desktop/mcz/contracts && ~/.foundry/bin/forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Green
cd frontend
npm run dev