// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title VotingToken
 * @dev Simple ERC20 token with basic voting interface for Governor
 */
contract VotingToken is ERC20, ERC20Permit {
    
    constructor() 
        ERC20("Kitra Voting Token", "KITRA") 
        ERC20Permit("Kitra Voting Token") 
    {
        // Mint 1M tokens to deployer
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    // Basic voting power = token balance
    function getVotes(address account) external view returns (uint256) {
        return balanceOf(account);
    }
    
    // Clock function for Governor
    function clock() public view returns (uint48) {
        return uint48(block.timestamp);
    }
    
    // Clock mode for Governor
    function CLOCK_MODE() public pure returns (string memory) {
        return "mode=timestamp";
    }
    
    // Delegate function (simplified)
    function delegate(address) external {
        // In a real implementation, this would handle delegation
        // For now, voting power = balance, so no delegation needed
    }
    
    // Get past votes (simplified)
    function getPastVotes(address account, uint256) external view returns (uint256) {
        return balanceOf(account);
    }
} 