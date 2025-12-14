// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockRepToken
 * @notice Testnet ERC20 token with rate-limited faucet for RepVote system
 * @dev Implements controlled token distribution with cooldown periods
 * ⚠️ TESTNET ONLY - DO NOT USE IN PRODUCTION
 */
contract MockRepToken is ERC20, Ownable {
    // ============ Constants ============
    
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18; // 1000 tokens per claim
    uint256 public constant COOLDOWN_PERIOD = 1 hours; // Minimum time between claims
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion token cap
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10**18; // 10M initial supply
    
    // ============ State Variables ============
    
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaimed;
    
    uint256 public totalFaucetClaims;
    uint256 public totalFaucetDistributed;
    bool public faucetEnabled = true;
    
    // ============ Events ============
    
    event FaucetClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetStatusChanged(bool enabled);
    event CooldownUpdated(uint256 newCooldown);
    
    // ============ Errors ============
    
    error FaucetDisabled();
    error CooldownActive(uint256 timeRemaining);
    error MaxSupplyExceeded();
    error ZeroAddress();
    
    // ============ Constructor ============
    
    constructor() ERC20("RepVote Token", "REP") Ownable() {
        // Mint initial supply to deployer for liquidity/testing
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    // ============ Faucet Functions ============
    
    /**
     * @notice Claim free tokens from faucet (rate-limited)
     * @dev Mints FAUCET_AMOUNT tokens to caller if cooldown has passed
     * Enforces 1-hour cooldown between claims
     */
    function faucet() external {
        if (!faucetEnabled) revert FaucetDisabled();
        
        uint256 timeSinceLastClaim = block.timestamp - lastClaimTime[msg.sender];
        
        // Allow first-time users or users past cooldown
        if (lastClaimTime[msg.sender] != 0 && timeSinceLastClaim < COOLDOWN_PERIOD) {
            revert CooldownActive(COOLDOWN_PERIOD - timeSinceLastClaim);
        }
        
        // Check supply cap
        if (totalSupply() + FAUCET_AMOUNT > MAX_SUPPLY) {
            revert MaxSupplyExceeded();
        }
        
        // Update claim tracking
        lastClaimTime[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;
        totalFaucetClaims++;
        totalFaucetDistributed += FAUCET_AMOUNT;
        
        // Mint tokens
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }
    
    /**
     * @notice Emergency mint function for contract owner
     * @dev Allows owner to mint tokens to any address (for testing scenarios)
     * @param to Recipient address
     * @param amount Amount to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();
        
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens from caller's balance
     * @param amount Amount to burn (in wei)
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get time remaining until user can claim again
     * @param user Address to check
     * @return Time in seconds until next claim (0 if can claim now)
     */
    function getCooldownRemaining(address user) external view returns (uint256) {
        if (lastClaimTime[user] == 0) return 0;
        
        uint256 timeSinceLastClaim = block.timestamp - lastClaimTime[user];
        if (timeSinceLastClaim >= COOLDOWN_PERIOD) return 0;
        
        return COOLDOWN_PERIOD - timeSinceLastClaim;
    }
    
    /**
     * @notice Check if user can claim from faucet
     * @param user Address to check
     * @return True if user can claim now
     */
    function canClaim(address user) external view returns (bool) {
        if (!faucetEnabled) return false;
        if (totalSupply() + FAUCET_AMOUNT > MAX_SUPPLY) return false;
        if (lastClaimTime[user] == 0) return true;
        
        return (block.timestamp - lastClaimTime[user]) >= COOLDOWN_PERIOD;
    }
    
    /**
     * @notice Get user's claim statistics
     * @param user Address to check
     * @return lastClaim Timestamp of last claim
     * @return totalAmount Total tokens claimed
     * @return claimCount Number of claims (approximation)
     */
    function getUserStats(address user) external view returns (
        uint256 lastClaim,
        uint256 totalAmount,
        uint256 claimCount
    ) {
        lastClaim = lastClaimTime[user];
        totalAmount = totalClaimed[user];
        claimCount = totalAmount / FAUCET_AMOUNT;
    }
    
    /**
     * @notice Get global faucet statistics
     * @return enabled Whether faucet is active
     * @return claims Total number of claims
     * @return distributed Total tokens distributed via faucet
     * @return remaining Tokens remaining until max supply
     */
    function getFaucetStats() external view returns (
        bool enabled,
        uint256 claims,
        uint256 distributed,
        uint256 remaining
    ) {
        enabled = faucetEnabled;
        claims = totalFaucetClaims;
        distributed = totalFaucetDistributed;
        remaining = MAX_SUPPLY - totalSupply();
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Toggle faucet on/off
     * @param enabled New faucet status
     */
    function setFaucetEnabled(bool enabled) external onlyOwner {
        faucetEnabled = enabled;
        emit FaucetStatusChanged(enabled);
    }
    
    /**
     * @notice Reset cooldown for a user (testing purposes)
     * @param user Address to reset
     */
    function resetCooldown(address user) external onlyOwner {
        lastClaimTime[user] = 0;
    }
    
    // ============ Standard Overrides ============
    
    /**
     * @notice Returns decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}

