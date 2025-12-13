// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ReputationRegistry
 * @notice Manages user reputation scores and vote multipliers
 * @dev Central reputation system for RepVote
 */
contract ReputationRegistry {
    // ============ Errors ============
    
    error Unauthorized();
    error InvalidArrayLength();
    
    // ============ State Variables ============
    
    address public owner;
    address public factory;  // PollFactory that can authorize new polls
    
    // user => reputation score
    mapping(address => uint256) public reputation;
    
    // user => last vote timestamp (for decay calculation)
    mapping(address => uint256) public lastVoteTime;
    
    // Authorized contracts that can update reputation
    mapping(address => bool) public authorized;
    
    // Constants for reputation multiplier calculation
    uint256 public constant DECAY_RATE = 5;  // 5% per month
    uint256 public constant MONTH = 30 days;
    
    // ============ Events ============
    
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event AuthorizedAdded(address indexed account);
    event AuthorizedRemoved(address indexed account);
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        authorized[msg.sender] = true;
    }
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    modifier onlyAuthorized() {
        if (!authorized[msg.sender]) revert Unauthorized();
        _;
    }
    
    modifier onlyFactory() {
        if (msg.sender != factory) revert Unauthorized();
        _;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Add reputation to a user
     * @param user Address to award reputation to
     * @param amount Amount of reputation to add
     */
    function addReputation(address user, uint256 amount) external onlyAuthorized {
        reputation[user] += amount;
        lastVoteTime[user] = block.timestamp;
        
        emit ReputationUpdated(user, reputation[user]);
    }
    
    /**
     * @notice Bootstrap initial reputation for multiple users
     * @param users Array of user addresses
     * @param amounts Array of reputation amounts
     */
    function bootstrapReputation(address[] calldata users, uint256[] calldata amounts) 
        external 
        onlyOwner 
    {
        if (users.length != amounts.length) revert InvalidArrayLength();
        
        for (uint256 i = 0; i < users.length; i++) {
            reputation[users[i]] = amounts[i];
            lastVoteTime[users[i]] = block.timestamp;
            
            emit ReputationUpdated(users[i], amounts[i]);
        }
    }
    
    /**
     * @notice Add an authorized contract
     */
    function addAuthorized(address account) external onlyOwner {
        authorized[account] = true;
        emit AuthorizedAdded(account);
    }
    
    /**
     * @notice Set the PollFactory address (one-time setup)
     */
    function setFactory(address _factory) external onlyOwner {
        require(factory == address(0), "Factory already set");
        factory = _factory;
        authorized[_factory] = true;
        emit AuthorizedAdded(_factory);
    }
    
    /**
     * @notice Authorize a poll (called by factory when creating polls)
     */
    function authorizePoll(address poll) external onlyFactory {
        authorized[poll] = true;
        emit AuthorizedAdded(poll);
    }
    
    /**
     * @notice Remove an authorized contract
     */
    function removeAuthorized(address account) external onlyOwner {
        authorized[account] = false;
        emit AuthorizedRemoved(account);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get reputation with time-based decay applied
     * @param user Address to check
     * @return Decayed reputation score
     */
    function getDecayedReputation(address user) public view returns (uint256) {
        uint256 baseRep = reputation[user];
        if (baseRep == 0) return 0;
        
        uint256 lastVote = lastVoteTime[user];
        if (lastVote == 0) return baseRep;
        
        // Calculate months elapsed
        uint256 elapsed = block.timestamp - lastVote;
        uint256 monthsElapsed = elapsed / MONTH;
        
        if (monthsElapsed == 0) return baseRep;
        
        // Gas optimization: If more than 60 months (5 years) have passed,
        // reputation has decayed to near zero. Avoid expensive loop.
        if (monthsElapsed > 60) return 0;
        
        // Apply decay: reputation × (0.95)^months
        uint256 decayedRep = baseRep;
        
        for (uint256 i = 0; i < monthsElapsed; i++) {
            decayedRep = (decayedRep * (100 - DECAY_RATE)) / 100;
        }
        
        return decayedRep;
    }
    
    /**
     * @notice Get vote multiplier based on reputation
     * @param user Address to check
     * @return Multiplier in 18 decimals (e.g., 1.5e18 = 1.5x)
     */
    function getRepMultiplier(address user) public view returns (uint256) {
        uint256 rep = getDecayedReputation(user);
        
        // Multiplier tiers:
        // 0 rep: 0.3x
        // 1-9 rep: 0.3x
        // 10-49 rep: 0.5x
        // 50-99 rep: 1x
        // 100-499 rep: 1.5x
        // 500-999 rep: 2x
        // 1000+ rep: 3x
        
        if (rep == 0) {
            return 3e17;  // 0.3x
        } else if (rep < 10) {
            return 3e17;  // 0.3x
        } else if (rep < 50) {
            return 5e17;  // 0.5x
        } else if (rep < 100) {
            return 1e18;  // 1x
        } else if (rep < 500) {
            return 15e17;  // 1.5x
        } else if (rep < 1000) {
            return 2e18;  // 2x
        } else {
            return 3e18;  // 3x
        }
    }
    
    /**
     * @notice Get complete user statistics
     * @param user Address to check
     * @return effectiveRep Reputation with decay applied
     * @return multiplier Current vote multiplier
     * @return lastVote Timestamp of last vote
     */
    function getUserStats(address user) external view returns (
        uint256 effectiveRep,
        uint256 multiplier,
        uint256 lastVote
    ) {
        effectiveRep = getDecayedReputation(user);
        multiplier = getRepMultiplier(user);
        lastVote = lastVoteTime[user];
    }
}

