wsl bash -c "cd /mnt/c/Users/LENOVO/Desktop/mcz/contracts && ~/.foundry/bin/anvil --host 0.0.0.0 --no-cors"

wsl bash -c "cd /mnt/c/Users/LENOVO/Desktop/mcz/contracts && ~/.foundry/bin/forge script script/DeployLocal.s.sol:DeployLocalScript --broadcast --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"


cd C:\Users\LENOVO\Desktop\mcz\frontend
npm run dev




Then just run: .\start-dev.ps1

📝 Important Notes
✅ MetaMask Setup (only once):

Network Name: Anvil
RPC URL: http://localhost:3000/api/rpc
Chain ID: 31337
Currency: ETH
✅ Import Test Account (only once):

Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
⚠️ Every time Anvil restarts, you must redeploy contracts (Step 2)

That's it! Three simple commands and you're ready to develop. 🎉