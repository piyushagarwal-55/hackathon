# Restart Anvil with proper configuration for the frontend
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Starting Anvil for RepVote" -ForegroundColor Cyan  
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing Anvil process
Write-Host "1. Stopping existing Anvil instances..." -ForegroundColor Yellow
$anvilProcesses = Get-Process | Where-Object { $_.ProcessName -like "*anvil*" -or $_.MainWindowTitle -like "*anvil*" }
if ($anvilProcesses) {
    $anvilProcesses | Stop-Process -Force
    Write-Host "   ✓ Stopped existing Anvil" -ForegroundColor Green
} else {
    Write-Host "   ℹ No existing Anvil process found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Starting new Anvil instance with:" -ForegroundColor Yellow
Write-Host "   ✓ CORS enabled (allows frontend connections)" -ForegroundColor Green
Write-Host "   ✓ Auto-mining every 1 second" -ForegroundColor Green
Write-Host "   ✓ Listening on all interfaces" -ForegroundColor Green
Write-Host ""

Write-Host "3. Attempting to start Anvil..." -ForegroundColor Yellow

# Try to find anvil in common locations
$anvilPaths = @(
    "anvil",
    "$env:USERPROFILE\.foundry\bin\anvil.exe",
    "$env:USERPROFILE\.cargo\bin\anvil.exe",
    "C:\Users\$env:USERNAME\.foundry\bin\anvil.exe"
)

$anvilFound = $false
foreach ($path in $anvilPaths) {
    try {
        if (Get-Command $path -ErrorAction SilentlyContinue) {
            Write-Host "   ✓ Found Anvil at: $path" -ForegroundColor Green
            Write-Host ""
            Write-Host "======================================" -ForegroundColor Cyan
            Write-Host "  Anvil is running!" -ForegroundColor Green
            Write-Host "  RPC: http://localhost:8545" -ForegroundColor Yellow
            Write-Host "  Keep this window open" -ForegroundColor Yellow
            Write-Host "======================================" -ForegroundColor Cyan
            Write-Host ""
            
            & $path --host 0.0.0.0 --cors-origins "*" --block-time 1
            $anvilFound = $true
            break
        }
    } catch {
        continue
    }
}

if (-not $anvilFound) {
    Write-Host ""
    Write-Host "❌ ERROR: Anvil not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Foundry first:" -ForegroundColor Yellow
    Write-Host "  1. Open PowerShell as Administrator" -ForegroundColor White
    Write-Host "  2. Run: irm https://github.com/foundry-rs/foundry/releases/latest/download/foundryup-init.ps1 | iex" -ForegroundColor White
    Write-Host "  3. Restart this script" -ForegroundColor White
    Write-Host ""
    Write-Host "Or manually start Anvil in a separate terminal:" -ForegroundColor Yellow
    Write-Host "  anvil --host 0.0.0.0 --cors-origins `"*`" --block-time 1" -ForegroundColor White
    Write-Host ""
    pause
}
