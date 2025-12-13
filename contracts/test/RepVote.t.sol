// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/ReputationRegistry.sol";
import "../src/PollFactory.sol";
import "../src/Poll.sol";
import "../src/MockRepToken.sol";

contract RepVoteTest is Test {
    ReputationRegistry public repRegistry;
    PollFactory public factory;
    Poll public poll;
    MockRepToken public token;
    
    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    address public whale = address(0x4);
    
    // Sybil attackers
    address[] public sybils;
    
    function setUp() public {
        // Deploy contracts
        token = new MockRepToken();
        repRegistry = new ReputationRegistry();
        factory = new PollFactory(address(repRegistry), address(token));
        
        // Authorize factory to update reputation
        repRegistry.addAuthorized(address(factory));
        
        // Setup test users with different reputation levels
        address[] memory users = new address[](4);
        uint256[] memory reps = new uint256[](4);
        
        users[0] = alice;   reps[0] = 1000;  // Expert (3x multiplier)
        users[1] = bob;     reps[1] = 100;   // Active (1.5x multiplier)
        users[2] = charlie; reps[2] = 10;    // New (0.5x multiplier)
        users[3] = whale;   reps[3] = 2000;  // Super expert (3x multiplier)
        
        repRegistry.bootstrapReputation(users, reps);
        
        // Create test poll
        string[] memory options = new string[](3);
        options[0] = "Security Audit";
        options[1] = "Mobile App";
        options[2] = "UX Polish";
        
        address pollAddress = factory.createPoll(
            "Which feature to build?",
            options,
            7 days,
            10,  // 10x max weight cap
            0,   // Quadratic voting
            true // Locked method
        );
        
        poll = Poll(pollAddress);
        
        // Authorize the poll to update reputation
        repRegistry.addAuthorized(pollAddress);
        
        // Setup sybil accounts (100 fake accounts with rep=1)
        for (uint256 i = 0; i < 100; i++) {
            sybils.push(address(uint160(1000 + i)));
        }
    }
    
    // ============ Reputation Tests ============
    
    function testNewUserLowMultiplier() public {
        address newUser = address(0x999);
        uint256 multiplier = repRegistry.getRepMultiplier(newUser);
        assertEq(multiplier, 3e17, "New user should have 0.3x multiplier");
    }
    
    function testExpertHighMultiplier() public {
        uint256 multiplier = repRegistry.getRepMultiplier(alice);
        assertEq(multiplier, 3e18, "Expert should have 3x multiplier");
    }
    
    function testReputationDecay() public {
        // Alice has 1000 rep
        uint256 initialRep = repRegistry.getDecayedReputation(alice);
        assertEq(initialRep, 1000, "Initial rep should be 1000");
        
        // Fast forward 1 month
        vm.warp(block.timestamp + 30 days);
        
        uint256 decayedRep = repRegistry.getDecayedReputation(alice);
        assertEq(decayedRep, 950, "Rep should decay 5% after 1 month");
        
        // Fast forward 6 months total
        vm.warp(block.timestamp + 150 days);
        
        decayedRep = repRegistry.getDecayedReputation(alice);
        // After 6 months: 1000 * 0.95^6 ≈ 735
        assertApproxEqRel(decayedRep, 735, 0.01e18, "Rep should decay ~26.5% after 6 months");
    }
    
    // ============ Quadratic Voting Tests ============
    
    function testQuadraticScaling() public {
        // Bob votes with 4 credits (rep=100, multiplier=1.5x)
        vm.startPrank(bob);
        token.faucet(); // Get tokens
        token.approve(address(poll), 4 * 1e18);
        poll.vote(0, 4 * 1e18, 0);  // √4 = 2, 2 * 1.5 = 3 votes, method=0 (quadratic)
        vm.stopPrank();
        
        (,, uint256 bobVotes,) = poll.votes(bob);
        assertEq(bobVotes, 3, "4 credits should give 3 weighted votes");
        
        // Charlie votes with 16 credits (rep=10, multiplier=0.5x)
        vm.startPrank(charlie);
        token.faucet();
        token.approve(address(poll), 16 * 1e18);
        poll.vote(1, 16 * 1e18, 0);  // √16 = 4, 4 * 0.5 = 2 votes, method=0 (quadratic)
        vm.stopPrank();
        
        (,, uint256 charlieVotes,) = poll.votes(charlie);
        assertEq(charlieVotes, 2, "16 credits should give 2 weighted votes");
    }
    
    function testQuadraticCostIncrease() public {
        // Test that doubling votes requires 4x credits
        // Alice with rep 1000 (3x multiplier)
        
        // To get 3 votes: √9 * 3 = 9 votes (need 9 base votes / 3 = 3, so 3^2 = 9 credits)
        uint256 preview9 = poll.previewVoteWeight(alice, 9);
        assertEq(preview9, 9, "9 credits should give 9 votes for alice");
        
        // To get 6 votes (double): need √x * 3 = 6, so x = 4, 4^2 = 16 credits (not 18!)
        uint256 preview36 = poll.previewVoteWeight(alice, 36);
        assertEq(preview36, 18, "36 credits should give 18 votes (double of 9)");
    }
    
    // ============ Vote Weight Cap Tests ============
    
    function testVoteWeightCap() public {
        // First, establish average with bob
        vm.prank(bob);
        poll.vote(0, 9);  // √9 * 1.5 = 4.5 votes
        
        // Now whale tries to dominate with huge credits
        vm.prank(whale);
        poll.vote(1, 10000);  // √10000 * 3 = 300 votes... but should be capped
        
        (,, uint256 whaleVotes,) = poll.votes(whale);
        
        // Average is 4.5, cap is 10x = 45
        assertLe(whaleVotes, 45, "Whale vote should be capped at 10x average");
    }
    
    // ============ Sybil Resistance Tests ============
    
    function testSybilResistance() public {
        // 10 legitimate users with good reputation vs 100 Sybils
        
        // Legitimate votes
        vm.prank(alice);
        poll.vote(0, 25);  // √25 * 3 = 15 votes
        
        vm.prank(bob);
        poll.vote(0, 9);   // √9 * 1.5 = 4.5 votes
        
        // Total legitimate: 19.5 votes for option 0
        
        // 100 Sybil votes (rep=1 each, multiplier=0.3x)
        for (uint256 i = 0; i < 100; i++) {
            vm.prank(sybils[i]);
            poll.vote(1, 1);  // √1 * 0.3 = 0.3 votes each
        }
        
        // Total Sybil: 30 votes for option 1
        
        uint256[] memory results = poll.getResults();
        
        // Even with 100 fake accounts, legitimate users win
        assertGt(results[0], results[1], "Legitimate votes should overcome Sybil attack");
        
        // Calculate Sybil influence reduction
        // Traditional: 100 Sybils would have 100 votes (83% of total)
        // RepVote: 30 Sybil votes (60% of total) - but cap reduces further
        // Reduction: (100-30)/100 = 70% reduction in Sybil power
    }
    
    function testSybilAttackWithMoreUsers() public {
        // Scenario: 50 active users vs 1000 Sybils
        
        // Setup 50 active users with rep 50-100
        for (uint256 i = 0; i < 50; i++) {
            address user = address(uint160(2000 + i));
            
            address[] memory users = new address[](1);
            uint256[] memory reps = new uint256[](1);
            users[0] = user;
            reps[0] = 50 + (i % 50);  // Rep between 50-100
            
            repRegistry.bootstrapReputation(users, reps);
            
            vm.prank(user);
            poll.vote(0, 9);  // Each gets ~3 votes (√9 * 1x = 3)
        }
        
        // Total legitimate: ~150 votes
        
        // 100 Sybils (would be 1000 but gas limits)
        for (uint256 i = 0; i < 100; i++) {
            vm.prank(sybils[i]);
            poll.vote(1, 1);  // Each gets 0.3 votes
        }
        
        // Total Sybil: 30 votes
        
        uint256[] memory results = poll.getResults();
        
        assertGt(results[0], results[1] * 4, "50 real users should decisively beat 100 Sybils");
        
        // Sybil influence: 30/(150+30) = 16.7% (vs 66.7% in traditional voting)
        // Reduction: 75% reduction in Sybil influence!
    }
    
    // ============ Edge Cases ============
    
    function testCannotVoteTwice() public {
        vm.startPrank(alice);
        poll.vote(0, 9);
        
        vm.expectRevert(Poll.AlreadyVoted.selector);
        poll.vote(1, 16);
        vm.stopPrank();
    }
    
    function testCannotVoteAfterDeadline() public {
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(alice);
        vm.expectRevert(Poll.PollClosed.selector);
        poll.vote(0, 9);
    }
    
    function testCannotVoteWithZeroCredits() public {
        vm.prank(alice);
        vm.expectRevert(Poll.InvalidCredits.selector);
        poll.vote(0, 0);
    }
    
    function testReputationRewardAfterVoting() public {
        uint256 initialRep = repRegistry.reputation(bob);
        
        vm.prank(bob);
        poll.vote(0, 9);
        
        uint256 finalRep = repRegistry.reputation(bob);
        assertEq(finalRep, initialRep + 10, "Should gain 10 rep after voting");
    }
    
    // ============ Integration Tests ============
    
    function testFullVotingFlow() public {
        // Create a poll through factory
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";
        
        address newPollAddr = factory.createPoll(
            "Approve proposal?",
            options,
            3 days,
            15
        );
        
        Poll newPoll = Poll(newPollAddr);
        
        // Authorize the new poll
        repRegistry.addAuthorized(newPollAddr);
        
        // Multiple users vote
        vm.prank(alice);
        newPoll.vote(0, 25);  // Expert says yes
        
        vm.prank(bob);
        newPoll.vote(0, 9);   // Active user says yes
        
        vm.prank(charlie);
        newPoll.vote(1, 4);   // New user says no
        
        // Check results
        uint256[] memory results = newPoll.getResults();
        assertGt(results[0], results[1], "Yes should win");
        
        // Check winner
        (uint256 winningOption, uint256 winningVotes) = newPoll.getWinner();
        assertEq(winningOption, 0, "Option 0 should win");
        assertGt(winningVotes, 0, "Winner should have votes");
    }
    
    function testFactoryTracksPolls() public {
        uint256 initialCount = factory.getPollCount();
        
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        
        factory.createPoll("Test?", options, 1 days, 10);
        
        assertEq(factory.getPollCount(), initialCount + 1, "Poll count should increase");
        
        address[] memory myPolls = factory.getPollsByCreator(address(this));
        assertGt(myPolls.length, 0, "Should track creator's polls");
    }
}

// Helper to access Vote struct
struct Vote {
    uint256 option;
    uint256 creditsSpent;
    uint256 weightedVotes;
    uint256 timestamp;
}
