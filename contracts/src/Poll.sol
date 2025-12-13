// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ReputationRegistry.sol";

/**
 * @title Poll
 * @notice Individual poll contract with reputation-weighted quadratic voting
 * @dev Each poll is a separate instance created by PollFactory
 */
contract Poll {
    // ============ Errors ============
    
    error PollClosed();
    error AlreadyVoted();
    error InvalidOption();
    error InvalidCredits();
    
    // ============ State Variables ============
    
    ReputationRegistry public immutable repRegistry;
    
    string public question;
    string[] public options;
    uint256 public immutable endTime;
    uint256 public immutable maxWeightCap;  // Maximum vote weight as multiple of average
    
    bool public isActive;
    uint256 public totalVoters;
    uint256 public totalWeightedVotes;
    
    // option => weighted votes
    mapping(uint256 => uint256) public results;
    
    // voter => Vote
    struct Vote {
        uint256 option;
        uint256 creditsSpent;
        uint256 weightedVotes;
        uint256 timestamp;
    }
    
    mapping(address => Vote) public votes;
    
    // ============ Events ============
    
    event VoteCast(
        address indexed voter,
        uint256 indexed option,
        uint256 creditsSpent,
        uint256 weightedVotes
    );
    
    // ============ Constructor ============
    
    constructor(
        address _repRegistry,
        string memory _question,
        string[] memory _options,
        uint256 _duration,
        uint256 _maxWeightCap
    ) {
        repRegistry = ReputationRegistry(_repRegistry);
        question = _question;
        options = _options;
        endTime = block.timestamp + _duration;
        maxWeightCap = _maxWeightCap;
        isActive = true;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Cast a vote with reputation-weighted quadratic voting
     * @param optionId Index of the option to vote for
     * @param credits Number of credits to spend
     */
    function vote(uint256 optionId, uint256 credits) external {
        if (block.timestamp >= endTime) revert PollClosed();
        if (votes[msg.sender].timestamp > 0) revert AlreadyVoted();
        if (optionId >= options.length) revert InvalidOption();
        if (credits == 0) revert InvalidCredits();
        
        // Calculate vote weight: √(credits) × reputation_multiplier
        uint256 weightedVotes = _calculateVoteWeight(msg.sender, credits);
        
        // Apply vote weight cap
        if (totalVoters > 0) {
            uint256 avgWeight = totalWeightedVotes / totalVoters;
            uint256 maxAllowed = avgWeight * maxWeightCap;
            
            if (weightedVotes > maxAllowed) {
                weightedVotes = maxAllowed;
            }
        }
        
        // Record vote
        votes[msg.sender] = Vote({
            option: optionId,
            creditsSpent: credits,
            weightedVotes: weightedVotes,
            timestamp: block.timestamp
        });
        
        // Update results
        results[optionId] += weightedVotes;
        totalVoters++;
        totalWeightedVotes += weightedVotes;
        
        // Award reputation for participating
        repRegistry.addReputation(msg.sender, 10);
        
        emit VoteCast(msg.sender, optionId, credits, weightedVotes);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get current results for all options
     */
    function getResults() external view returns (uint256[] memory) {
        uint256[] memory allResults = new uint256[](options.length);
        
        for (uint256 i = 0; i < options.length; i++) {
            allResults[i] = results[i];
        }
        
        return allResults;
    }
    
    /**
     * @notice Get winning option
     */
    function getWinner() external view returns (uint256 winningOption, uint256 winningVotes) {
        winningVotes = 0;
        winningOption = 0;
        
        for (uint256 i = 0; i < options.length; i++) {
            if (results[i] > winningVotes) {
                winningVotes = results[i];
                winningOption = i;
            }
        }
    }
    
    /**
     * @notice Preview vote weight for a user with given credits
     */
    function previewVoteWeight(address user, uint256 credits) external view returns (uint256) {
        return _calculateVoteWeight(user, credits);
    }
    
    /**
     * @notice Get all option strings
     */
    function getOptions() external view returns (string[] memory) {
        return options;
    }
    
    /**
     * @notice Get the number of options in the poll
     */
    function getOptionCount() external view returns (uint256) {
        return options.length;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Calculate vote weight using quadratic voting + reputation multiplier
     * @dev Formula: √(credits) × reputation_multiplier
     */
    function _calculateVoteWeight(address user, uint256 credits) internal view returns (uint256) {
        // Get user's reputation multiplier (18 decimals, e.g., 1.5e18 = 1.5x)
        uint256 multiplier = repRegistry.getRepMultiplier(user);
        
        // Calculate √(credits) using Babylonian method
        uint256 sqrtCredits = _sqrt(credits);
        
        // Apply multiplier: sqrtCredits × multiplier / 1e18
        uint256 weightedVotes = (sqrtCredits * multiplier) / 1e18;
        
        return weightedVotes;
    }
    
    /**
     * @notice Calculate square root using Babylonian method
     * @dev Gas-efficient integer square root
     */
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        
        // Initial guess
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        // Iterate until convergence
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }
}

