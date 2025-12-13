// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Poll.sol";
import "./ReputationRegistry.sol";

/**
 * @title PollFactory
 * @notice Factory contract for creating new Poll instances
 * @dev Each poll is a separate contract with customizable parameters
 */
contract PollFactory {
    // ============ State Variables ============
    
    ReputationRegistry public immutable repRegistry;
    address public immutable bettingToken;
    
    address[] public allPolls;
    mapping(address => address[]) public pollsByCreator;
    
    // ============ Events ============
    
    event PollCreated(
        address indexed pollAddress,
        address indexed creator,
        string question,
        uint256 endTime,
        uint256 indexed pollIndex
    );
    
    // ============ Constructor ============
    
    constructor(address _repRegistry, address _bettingToken) {
        repRegistry = ReputationRegistry(_repRegistry);
        bettingToken = _bettingToken;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Create a new poll with custom parameters
     * @param question The question being voted on
     * @param options Array of option strings
     * @param duration Duration in seconds
     * @param maxWeightCap Maximum vote weight as multiple of average (e.g., 10 = 10x)
     * @param votingMethod Voting method (0=QUADRATIC, 1=SIMPLE, 2=WEIGHTED)
     * @param isVotingMethodLocked If true, all voters must use votingMethod; if false, voters choose
     * @return pollAddress Address of newly created poll
     */
    function createPoll(
        string memory question,
        string[] memory options,
        uint256 duration,
        uint256 maxWeightCap,
        uint8 votingMethod,
        bool isVotingMethodLocked
    ) external returns (address pollAddress) {
        require(options.length >= 2, "Need at least 2 options");
        require(options.length <= 10, "Too many options");
        require(duration >= 1 hours, "Duration too short");
        require(duration <= 30 days, "Duration too long");
        require(maxWeightCap >= 2 && maxWeightCap <= 20, "Invalid cap");
        require(votingMethod <= 2, "Invalid voting method");
        
        // Deploy new Poll contract
        Poll newPoll = new Poll(
            address(repRegistry),
            bettingToken,
            question,
            options,
            duration,
            maxWeightCap,
            votingMethod,
            isVotingMethodLocked
        );
        
        pollAddress = address(newPoll);
        
        // Authorize the new poll to update reputation
        repRegistry.authorizePoll(pollAddress);
        
        // Track the poll
        allPolls.push(pollAddress);
        pollsByCreator[msg.sender].push(pollAddress);
        
        emit PollCreated(
            pollAddress,
            msg.sender,
            question,
            block.timestamp + duration,
            allPolls.length - 1
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get total number of polls created
     */
    function getPollCount() external view returns (uint256) {
        return allPolls.length;
    }
    
    /**
     * @notice Get all polls created by a specific address
     */
    function getPollsByCreator(address creator) external view returns (address[] memory) {
        return pollsByCreator[creator];
    }
    
    /**
     * @notice Get recent polls (last N)
     */
    function getRecentPolls(uint256 count) external view returns (address[] memory) {
        uint256 total = allPolls.length;
        uint256 returnCount = count > total ? total : count;
        
        address[] memory recentPolls = new address[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            recentPolls[i] = allPolls[total - 1 - i];
        }
        
        return recentPolls;
    }
    
    /**
     * @notice Get poll info
     */
    function getPollInfo(address pollAddress) external view returns (
        string memory question,
        string[] memory options,
        uint256 endTime,
        bool isActive,
        uint256 totalVoters
    ) {
        Poll poll = Poll(pollAddress);
        question = poll.question();
        options = poll.getOptions();
        endTime = poll.endTime();
        isActive = poll.isActive();
        totalVoters = poll.totalVoters();
    }
}