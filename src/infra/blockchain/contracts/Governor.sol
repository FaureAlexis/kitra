// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDesignCandidate {
    function getCandidateTokens() external view returns (uint256[] memory);
    function getDesignInfo(uint256 tokenId) external view returns (
        address designer,
        string memory name,
        uint256 mintTime,
        bool candidate,
        string memory tokenURI
    );
    function setCandidateStatus(uint256 tokenId, bool _isCandidate) external;
}

/**
 * @title KitraGovernor
 * @dev Governor contract for voting on football kit designs
 * Integrates with DesignCandidate NFT contract for proposal management
 */
contract KitraGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    Ownable
{
    IDesignCandidate public designCandidate;

    // Proposal types
    enum ProposalType {
        DESIGN_APPROVAL,
        DESIGN_REJECTION,
        PARAMETER_CHANGE
    }

    // Proposal metadata
    struct ProposalMetadata {
        ProposalType proposalType;
        uint256 designTokenId;
        string description;
        address proposer;
        uint256 createdAt;
    }

    mapping(uint256 => ProposalMetadata) public proposalMetadata;

    // Events
    event DesignProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed designTokenId,
        ProposalType proposalType,
        address indexed proposer,
        string description
    );

    event DesignApproved(uint256 indexed designTokenId, uint256 indexed proposalId);
    event DesignRejected(uint256 indexed designTokenId, uint256 indexed proposalId);

    constructor(
        IVotes _token,
        address _designCandidate
    )
        Governor("KitraGovernor")
        GovernorSettings(
            7200, /* 1 day */ 
            50400, /* 1 week */
            1000000e18 /* 1M tokens */
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(10) // 10% quorum
        Ownable(msg.sender)
    {
        designCandidate = IDesignCandidate(_designCandidate);
    }

    /**
     * @dev Create a proposal to approve a design
     * @param designTokenId Token ID of the design
     * @param description Proposal description
     */
    function proposeDesignApproval(
        uint256 designTokenId,
        string memory description
    ) external returns (uint256) {
        // Verify design exists and is a candidate
        (, , , bool isCandidate, ) = designCandidate.getDesignInfo(designTokenId);
        require(isCandidate, "Design is not a candidate");

        // Create proposal targets, values, and calldatas
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = address(designCandidate);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature(
            "setCandidateStatus(uint256,bool)",
            designTokenId,
            false
        );

        // Create the proposal
        uint256 proposalId = propose(targets, values, calldatas, description);

        // Store metadata
        proposalMetadata[proposalId] = ProposalMetadata({
            proposalType: ProposalType.DESIGN_APPROVAL,
            designTokenId: designTokenId,
            description: description,
            proposer: msg.sender,
            createdAt: block.timestamp
        });

        emit DesignProposalCreated(
            proposalId,
            designTokenId,
            ProposalType.DESIGN_APPROVAL,
            msg.sender,
            description
        );

        return proposalId;
    }

    /**
     * @dev Create a proposal to reject a design
     * @param designTokenId Token ID of the design
     * @param description Proposal description
     */
    function proposeDesignRejection(
        uint256 designTokenId,
        string memory description
    ) external returns (uint256) {
        // Verify design exists and is a candidate
        (, , , bool isCandidate, ) = designCandidate.getDesignInfo(designTokenId);
        require(isCandidate, "Design is not a candidate");

        // Create proposal targets, values, and calldatas
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = address(designCandidate);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature(
            "setCandidateStatus(uint256,bool)",
            designTokenId,
            false
        );

        // Create the proposal
        uint256 proposalId = propose(targets, values, calldatas, description);

        // Store metadata
        proposalMetadata[proposalId] = ProposalMetadata({
            proposalType: ProposalType.DESIGN_REJECTION,
            designTokenId: designTokenId,
            description: description,
            proposer: msg.sender,
            createdAt: block.timestamp
        });

        emit DesignProposalCreated(
            proposalId,
            designTokenId,
            ProposalType.DESIGN_REJECTION,
            msg.sender,
            description
        );

        return proposalId;
    }

    /**
     * @dev Get all candidate designs for voting
     */
    function getCandidateDesigns() external view returns (uint256[] memory) {
        return designCandidate.getCandidateTokens();
    }

    /**
     * @dev Get proposal metadata
     * @param proposalId Proposal ID
     */
    function getProposalMetadata(uint256 proposalId) external view returns (
        ProposalType proposalType,
        uint256 designTokenId,
        string memory description,
        address proposer,
        uint256 createdAt
    ) {
        ProposalMetadata memory metadata = proposalMetadata[proposalId];
        return (
            metadata.proposalType,
            metadata.designTokenId,
            metadata.description,
            metadata.proposer,
            metadata.createdAt
        );
    }

    /**
     * @dev Handle design approval/rejection after execution
     * Called manually after successful execution
     */
    function handleExecutionResult(uint256 proposalId) external {
        require(state(proposalId) == ProposalState.Executed, "Proposal not executed");
        
        // Emit events based on proposal type
        ProposalMetadata memory metadata = proposalMetadata[proposalId];
        
        if (metadata.proposalType == ProposalType.DESIGN_APPROVAL) {
            emit DesignApproved(metadata.designTokenId, proposalId);
        } else if (metadata.proposalType == ProposalType.DESIGN_REJECTION) {
            emit DesignRejected(metadata.designTokenId, proposalId);
        }
    }

    /**
     * @dev Update design candidate contract address
     * @param _designCandidate New design candidate contract address
     */
    function updateDesignCandidate(address _designCandidate) external onlyOwner {
        designCandidate = IDesignCandidate(_designCandidate);
    }

    // Override required functions
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }


} 