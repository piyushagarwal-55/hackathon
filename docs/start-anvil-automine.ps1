# Start Anvil with auto-mining for instant block production
# This ensures transactions confirm immediately

Write-Host "Starting Anvil with auto-mining enabled..." -ForegroundColor Cyan
Write-Host "This will mine a new block instantly when a transaction is submitted" -ForegroundColor Yellow
Write-Host ""

# Kill any existing anvil process
Get-Process -Name "anvil" -ErrorAction SilentlyContinue | Stop-Process -Force

# Start anvil with block time = 0 for instant mining
anvil --block-time 0

# Note: Leave this terminal running. Anvil will mine blocks instantly when transactions arrive.
