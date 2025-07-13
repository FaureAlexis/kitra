// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title SimpleVotes
 * @dev Basic ERC20 token with permit functionality for governance
 */
contract SimpleVotes is ERC20, ERC20Permit {
    
    constructor() 
        ERC20("Simple Voting Token", "SVT") 
        ERC20Permit("Simple Voting Token") 
    {
        // Mint 1M tokens to deployer
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    // Simple voting power based on token balance
    function getVotes(address account) external view returns (uint256) {
        return balanceOf(account);
    }
    
    // Clock function required by Governor
    function clock() public view returns (uint48) {
        return uint48(block.timestamp);
    }
    
    // Clock mode for Governor compatibility
    function CLOCK_MODE() public pure returns (string memory) {
        return "mode=timestamp";
    }
} 