// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface should be outside the contract
interface IBasicVoting {
    function balanceOf(address account) external view returns (uint256);
    function getVotes(address account) external view returns (uint256);
}

/**
 * @title SimpleGovernor
 * @dev Minimal governor for BasicVoting token
 * Simplified version without complex OpenZeppelin inheritance
 */
contract SimpleGovernor {
    
    IBasicVoting public token;
    address public designCandidate;
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint8) votes; // 0=against, 1=for, 2=abstain
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Constants
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant QUORUM_PERCENTAGE = 10; // 10%
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    
    constructor(address _token, address _designCandidate) {
        token = IBasicVoting(_token);
        designCandidate = _designCandidate;
    }
    
    function propose(string memory description) external returns (uint256) {
        require(token.getVotes(msg.sender) > 0, "Must have voting power to propose");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_DURATION;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }
    
    function castVoteWithReason(uint256 proposalId, uint8 support, string memory) external {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        require(block.timestamp >= proposals[proposalId].startTime, "Voting not started");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting ended");
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        require(support <= 2, "Invalid support value");
        
        uint256 weight = token.getVotes(msg.sender);
        require(weight > 0, "No voting power");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = support;
        
        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    function castVote(uint256 proposalId, uint8 support) external {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        require(block.timestamp >= proposals[proposalId].startTime, "Voting not started");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting ended");
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        require(support <= 2, "Invalid support value");
        
        uint256 weight = token.getVotes(msg.sender);
        require(weight > 0, "No voting power");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = support;
        
        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    function hasVoted(uint256 proposalId, address account) external view returns (bool) {
        return proposals[proposalId].hasVoted[account];
    }
    
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed
        );
    }
    
    function state(uint256 proposalId) external view returns (uint8) {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        
        Proposal storage proposal = proposals[proposalId];
        
        if (block.timestamp < proposal.startTime) {
            return 0; // Pending
        } else if (block.timestamp <= proposal.endTime) {
            return 1; // Active
        } else if (proposal.forVotes > proposal.againstVotes && _quorumReached(proposalId)) {
            return 4; // Succeeded
        } else {
            return 3; // Defeated
        }
    }
    
    function _quorumReached(uint256 proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 totalSupply = token.balanceOf(address(this)) + token.balanceOf(proposal.proposer); // Simplified
        return totalVotes * 100 >= totalSupply * QUORUM_PERCENTAGE;
    }
    
    // Compatibility functions for existing integration
    function votingDelay() external pure returns (uint256) {
        return 0; // No delay
    }
    
    function votingPeriod() external pure returns (uint256) {
        return VOTING_DURATION;
    }
} 