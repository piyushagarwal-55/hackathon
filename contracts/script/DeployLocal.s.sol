// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ReputationRegistry.sol";
import "../src/PollFactory.sol";
import "../src/Poll.sol";
import "../src/MockRepToken.sol";

/**
 * @title DeployLocalScript
 * @notice Simple deployment script for local testing (Anvil)
 * @dev Run with: forge script script/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
 */
contract DeployLocalScript is Script {
    function run() external {
        // Use Anvil's default test account
        vm.startBroadcast();
        
        // 1. Deploy MockRepToken
        MockRepToken token = new MockRepToken();
        console.log("MockRepToken deployed at:", address(token));
        
        // 2. Deploy ReputationRegistry
        ReputationRegistry repRegistry = new ReputationRegistry();
        console.log("ReputationRegistry deployed at:", address(repRegistry));
        
        // 3. Deploy PollFactory
        PollFactory factory = new PollFactory(address(repRegistry), address(token));
        console.log("PollFactory deployed at:", address(factory));
        
        // 4. Set factory in ReputationRegistry (allows factory to authorize polls)
        repRegistry.setFactory(address(factory));
        console.log("Factory set and authorized in ReputationRegistry");
        
        // 5. Bootstrap some test reputation for demo
        address deployer = msg.sender;
        address[] memory users = new address[](3);
        uint256[] memory reps = new uint256[](3);
        
        users[0] = deployer;
        users[1] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // Anvil account #1
        users[2] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // Anvil account #2
        
        reps[0] = 1000; // Expert level
        reps[1] = 100;  // Active level
        reps[2] = 10;   // Newcomer level
        
        repRegistry.bootstrapReputation(users, reps);
        console.log("Bootstrapped reputation for 3 test accounts");
        
        // 6. Create a demo poll
        string[] memory options = new string[](3);
        options[0] = "Security Audit";
        options[1] = "Mobile App Development";
        options[2] = "UX Polish";
        
        address demoPoll = factory.createPoll(
            "What should we prioritize for the next quarter?",
            options,
            7 days,
            10,  // 10x max weight cap
            0,   // Quadratic voting
            false // Voter choice
        );
        
        console.log("Demo Poll deployed at:", demoPoll);
        
        vm.stopBroadcast();
        
        // Print deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Local Anvil");
        console.log("MockRepToken:", address(token));
        console.log("ReputationRegistry:", address(repRegistry));
        console.log("PollFactory:", address(factory));
        console.log("Demo Poll:", demoPoll);
        console.log("\n=== Update these in frontend/lib/contracts.ts ===");
        console.log("export const MOCK_TOKEN_ADDRESS = '%s' as `0x${string}`;", address(token));
        console.log("export const REPUTATION_REGISTRY_ADDRESS = '%s' as `0x${string}`;", address(repRegistry));
        console.log("export const POLL_FACTORY_ADDRESS = '%s' as `0x${string}`;", address(factory));
        console.log("Demo Poll Address: %s", demoPoll);
    }
}




