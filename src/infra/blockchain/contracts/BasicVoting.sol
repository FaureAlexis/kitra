// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BasicVoting
 * @dev Ultra-simple voting token for Governor compatibility
 * No inheritance, just pure functions
 */
contract BasicVoting {
    
    string public name = "Basic Voting Token";
    string public symbol = "BVT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        totalSupply = 1000000 * 10**18; // 1M tokens
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // Governor interface functions
    function getVotes(address account) external view returns (uint256) {
        return balanceOf[account]; // Voting power = token balance
    }
    
    function getPastVotes(address account, uint256) external view returns (uint256) {
        return balanceOf[account]; // Simplified: current balance
    }
    
    function delegate(address) external {
        // Simplified: no delegation, voting power = balance
    }
    
    function clock() external view returns (uint48) {
        return uint48(block.timestamp);
    }
    
    function CLOCK_MODE() external pure returns (string memory) {
        return "mode=timestamp";
    }
} 