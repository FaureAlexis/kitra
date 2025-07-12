// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @title DesignCandidate
 * @dev ERC-721 NFT contract for football kit design candidates
 * Supports ERC-2981 royalty standard for creator royalties
 */
contract DesignCandidate is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Burnable, 
    Ownable, 
    IERC2981 
{
    // Royalty info
    address public royaltyRecipient;
    uint256 public royaltyBps = 500; // 5% royalty

    // Token counter
    uint256 private _nextTokenId = 1;

    // Design metadata
    mapping(uint256 => address) public designers;
    mapping(uint256 => string) public designNames;
    mapping(uint256 => uint256) public mintTimestamps;
    mapping(uint256 => bool) public isCandidate;

    // Events
    event DesignMinted(
        uint256 indexed tokenId,
        address indexed designer,
        string name,
        string tokenURI
    );
    
    event CandidateStatusChanged(
        uint256 indexed tokenId,
        bool isCandidate
    );

    constructor(
        address _royaltyRecipient
    ) ERC721("Kitra Design Candidate", "KDC") Ownable(msg.sender) {
        royaltyRecipient = _royaltyRecipient;
    }

    /**
     * @dev Mint a new design candidate NFT
     * @param to Address to mint to
     * @param name Design name
     * @param uri IPFS URI containing metadata
     */
    function mintDesign(
        address to,
        string memory name,
        string memory uri
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        designers[tokenId] = to;
        designNames[tokenId] = name;
        mintTimestamps[tokenId] = block.timestamp;
        isCandidate[tokenId] = true;

        emit DesignMinted(tokenId, to, name, uri);
        emit CandidateStatusChanged(tokenId, true);

        return tokenId;
    }

    /**
     * @dev Set candidate status for a design
     * @param tokenId Token ID
     * @param _isCandidate Whether the design is a candidate
     */
    function setCandidateStatus(
        uint256 tokenId,
        bool _isCandidate
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        isCandidate[tokenId] = _isCandidate;
        emit CandidateStatusChanged(tokenId, _isCandidate);
    }

    /**
     * @dev Get design info
     * @param tokenId Token ID
     */
    function getDesignInfo(uint256 tokenId) external view returns (
        address designer,
        string memory name,
        uint256 mintTime,
        bool candidate,
        string memory uri
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        return (
            designers[tokenId],
            designNames[tokenId],
            mintTimestamps[tokenId],
            isCandidate[tokenId],
            tokenURI(tokenId)
        );
    }

    /**
     * @dev Get all candidate tokens
     */
    function getCandidateTokens() external view returns (uint256[] memory) {
        uint256[] memory candidates = new uint256[](_nextTokenId - 1);
        uint256 candidateCount = 0;
        
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (isCandidate[i] && _ownerOf(i) != address(0)) {
                candidates[candidateCount] = i;
                candidateCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](candidateCount);
        for (uint256 i = 0; i < candidateCount; i++) {
            result[i] = candidates[i];
        }
        
        return result;
    }

    /**
     * @dev Set royalty info
     * @param recipient Royalty recipient address
     * @param bps Royalty basis points (500 = 5%)
     */
    function setRoyalty(address recipient, uint256 bps) external onlyOwner {
        require(bps <= 1000, "Royalty cannot exceed 10%");
        royaltyRecipient = recipient;
        royaltyBps = bps;
    }

    /**
     * @dev ERC-2981 royalty info
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address, uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        uint256 royaltyAmount = (salePrice * royaltyBps) / 10000;
        return (royaltyRecipient, royaltyAmount);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage, IERC165) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // Override required by Solidity
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
} 