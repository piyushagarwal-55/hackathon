// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ReputationRegistry.sol";
import "../src/PollFactory.sol";
import "../src/Poll.sol";
import "../src/MockRepToken.sol";

/**
 * @title DeployScript
 * @notice Deployment script for RepVote contracts
 * @dev Run with: forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC --broadcast --verify
 */
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy MockRepToken (for testnet demo)
        MockRepToken token = new MockRepToken();
        console.log("MockRepToken deployed at:", address(token));
        
        // 2. Deploy ReputationRegistry
        ReputationRegistry repRegistry = new ReputationRegistry();
        console.log("ReputationRegistry deployed at:", address(repRegistry));
        
        // 3. Deploy PollFactory with token address
        PollFactory factory = new PollFactory(address(repRegistry), address(token));
        console.log("PollFactory deployed at:", address(factory));
        
        // 4. Set factory in ReputationRegistry (allows factory to authorize polls)
        repRegistry.setFactory(address(factory));
        console.log("Factory set and authorized in ReputationRegistry");
        
        // 5. Bootstrap some initial reputation for demo accounts (optional)
        address deployer = msg.sender;
        address[] memory users = new address[](1);
        uint256[] memory reps = new uint256[](1);
        
        users[0] = deployer;
        reps[0] = 1000; // Give deployer expert reputation
        
        repRegistry.bootstrapReputation(users, reps);
        console.log("Bootstrapped reputation for deployer");
        
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
            true // Locked method
        );
        
        console.log("Demo Poll deployed at:", demoPoll);
        
        vm.stopBroadcast();
        
        // Print deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("MockRepToken:", address(token));
        console.log("ReputationRegistry:", address(repRegistry));
        console.log("PollFactory:", address(factory));
        console.log("Demo Poll:", demoPoll);
        console.log("\nSave these addresses for frontend configuration!");
    }
}
