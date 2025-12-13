# WSL2 Port Forwarding Script for Anvil
# This makes WSL's Anvil accessible on Windows localhost:8545

$wslIP = (wsl hostname -I).Trim()
$port = 8545

Write-Host "Setting up port forwarding..." -ForegroundColor Cyan
Write-Host "  WSL IP: $wslIP" -ForegroundColor Yellow
Write-Host "  Port: $port" -ForegroundColor Yellow

# Remove existing port proxy if any
Write-Host ""
Write-Host "Removing old port forwarding rules..." -ForegroundColor Yellow
try {
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=127.0.0.1 2>$null
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null
} catch {}

# Add new port proxy
Write-Host "Adding new port forwarding rule..." -ForegroundColor Yellow
netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIP

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Port forwarding set up successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Windows localhost:8545 -> WSL $wslIP:8545" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now access Anvil from Windows via http://localhost:8545" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Failed to set up port forwarding" -ForegroundColor Red
    Write-Host "  This script needs to run as Administrator" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Right-click PowerShell and select Run as Administrator, then run:" -ForegroundColor Yellow
    Write-Host "  .\setup-port-forward.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "To view current port forwarding rules:" -ForegroundColor Gray
Write-Host "  netsh interface portproxy show all" -ForegroundColor White
