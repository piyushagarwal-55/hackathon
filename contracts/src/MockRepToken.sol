// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockRepToken
 * @notice Mock ERC20 token for testnet demonstration
 * @dev Anyone can mint tokens for free using the faucet function
 * ⚠️ TESTNET ONLY - DO NOT USE IN PRODUCTION
 */
contract MockRepToken is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18; // 1000 tokens
    
    constructor() ERC20("RepVote Token", "REP") {
        // No initial supply - users mint via faucet
    }
    
    /**
     * @notice Free token faucet for demo purposes
     * @dev Mints FAUCET_AMOUNT tokens to caller
     * Anyone can call this unlimited times on testnet
     */
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @notice Returns decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}

