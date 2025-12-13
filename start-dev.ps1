# Start Anvil in background
Write-Host "Starting Anvil blockchain..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "wsl bash -c 'cd /mnt/c/Users/LENOVO/Desktop/mcz/contracts && ~/.foundry/bin/anvil --host 0.0.0.0 --no-cors'"

# Wait for Anvil to start
Start-Sleep -Seconds 5

# Deploy contracts
Write-Host "Deploying contracts..." -ForegroundColor Green
wsl bash -c "cd /mnt/c/Users/LENOVO/Desktop/mcz/contracts && ~/.foundry/bin/forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Green
cd frontend
npm run dev