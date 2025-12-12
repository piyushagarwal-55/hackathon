// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ReputationRegistry.sol";
import "../src/PollFactory.sol";
import "../src/Poll.sol";

/**
 * @title DeployScript
 * @notice Deployment script for RepVote contracts
 * @dev Run with: forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC --broadcast --verify
 */
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy ReputationRegistry
        ReputationRegistry repRegistry = new ReputationRegistry();
        console.log("ReputationRegistry deployed at:", address(repRegistry));
        
        // 2. Deploy PollFactory
        PollFactory factory = new PollFactory(address(repRegistry));
        console.log("PollFactory deployed at:", address(factory));
        
        // 3. Authorize factory to update reputation
        repRegistry.addAuthorized(address(factory));
        console.log("Factory authorized to update reputation");
        
        // 4. Bootstrap some initial reputation for demo accounts (optional)
        // This can be done later through the frontend or admin interface
        
        // 5. Create a demo poll
        string[] memory options = new string[](3);
        options[0] = "Security Audit";
        options[1] = "Mobile App Development";
        options[2] = "UX Polish";
        
        address demoPoll = factory.createPoll(
            "What should we prioritize for the next quarter?",
            options,
            7 days,
            10  // 10x max weight cap
        );
        
        // Authorize the demo poll
        repRegistry.addAuthorized(demoPoll);
        
        console.log("Demo Poll deployed at:", demoPoll);
        
        vm.stopBroadcast();
        
        // Print deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("ReputationRegistry:", address(repRegistry));
        console.log("PollFactory:", address(factory));
        console.log("Demo Poll:", demoPoll);
        console.log("\nSave these addresses for frontend configuration!");
    }
}
