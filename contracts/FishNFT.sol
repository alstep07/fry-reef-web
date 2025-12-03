// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FishNFT
 * @notice ERC-721 contract for fish
 * @dev Fish produce Spawn Dust over time based on rarity
 */
contract FishNFT is ERC721, ERC721Enumerable, Ownable {
    // ============ Enums ============
    enum Rarity { Common, Rare, Epic, Legendary, Mythic }

    // ============ Constants ============
    // Spawn Dust per day by rarity (scaled by 1e18 for precision)
    uint256 public constant COMMON_DUST_PER_DAY = 6;
    uint256 public constant RARE_DUST_PER_DAY = 12;
    uint256 public constant EPIC_DUST_PER_DAY = 18;
    uint256 public constant LEGENDARY_DUST_PER_DAY = 32;
    uint256 public constant MYTHIC_DUST_PER_DAY = 48;

    // Rarity chances (out of 100)
    uint256 public constant COMMON_CHANCE = 50;      // 50%
    uint256 public constant RARE_CHANCE = 28;        // 28%
    uint256 public constant EPIC_CHANCE = 14;        // 14%
    uint256 public constant LEGENDARY_CHANCE = 6;    // 6%
    uint256 public constant MYTHIC_CHANCE = 2;       // 2%

    // ============ State ============
    uint256 private _nextTokenId;
    address public gameContract;

    struct FishInfo {
        Rarity rarity;
        uint256 mintedAt;
        uint256 lastDustCollectedAt;
    }

    mapping(uint256 => FishInfo) public fish;

    // ============ Events ============
    event FishMinted(address indexed owner, uint256 indexed tokenId, Rarity rarity);
    event SpawnDustCollected(address indexed owner, uint256 indexed tokenId, uint256 amount);

    // ============ Modifiers ============
    modifier onlyGameContract() {
        require(msg.sender == gameContract, "Only game contract");
        _;
    }

    // ============ Constructor ============
    constructor() ERC721("FryReef Fish", "FRYFISH") Ownable(msg.sender) {}

    // ============ Admin ============

    /**
     * @notice Set the game contract address
     */
    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }

    // ============ Minting ============

    /**
     * @notice Mint a new fish with random rarity
     * @param _to Address to mint to
     * @return tokenId The minted token ID
     */
    function mint(address _to) external onlyGameContract returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        Rarity rarity = _determineRarity(tokenId, _to);
        
        _safeMint(_to, tokenId);

        fish[tokenId] = FishInfo({
            rarity: rarity,
            mintedAt: block.timestamp,
            lastDustCollectedAt: block.timestamp
        });

        emit FishMinted(_to, tokenId, rarity);
        return tokenId;
    }

    // ============ Spawn Dust ============

    /**
     * @notice Get Spawn Dust production rate per day for a rarity
     */
    function getDustPerDay(Rarity _rarity) public pure returns (uint256) {
        if (_rarity == Rarity.Common) return COMMON_DUST_PER_DAY;
        if (_rarity == Rarity.Rare) return RARE_DUST_PER_DAY;
        if (_rarity == Rarity.Epic) return EPIC_DUST_PER_DAY;
        if (_rarity == Rarity.Legendary) return LEGENDARY_DUST_PER_DAY;
        if (_rarity == Rarity.Mythic) return MYTHIC_DUST_PER_DAY;
        return 0;
    }

    /**
     * @notice Get pending Spawn Dust for a single fish
     * @param _tokenId The fish token ID
     */
    function getPendingDustForFish(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId), "Fish does not exist");
        FishInfo storage fishInfo = fish[_tokenId];
        
        uint256 timeElapsed = block.timestamp - fishInfo.lastDustCollectedAt;
        uint256 dustPerDay = getDustPerDay(fishInfo.rarity);
        
        // Calculate dust: (dustPerDay * timeElapsed) / 1 day
        return (dustPerDay * timeElapsed) / 1 days;
    }

    /**
     * @notice Get total pending Spawn Dust for all fish owned by user
     * @param _owner The owner address
     */
    function getPendingSpawnDust(address _owner) external view returns (uint256) {
        uint256 totalDust = 0;
        uint256 balance = balanceOf(_owner);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(_owner, i);
            totalDust += getPendingDustForFish(tokenId);
        }
        
        return totalDust;
    }

    /**
     * @notice Collect Spawn Dust from all fish owned by user
     * @param _owner The owner address
     * @return totalDust Total dust collected
     */
    function collectAllSpawnDust(address _owner) external onlyGameContract returns (uint256) {
        uint256 totalDust = 0;
        uint256 balance = balanceOf(_owner);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(_owner, i);
            uint256 dust = getPendingDustForFish(tokenId);
            
            if (dust > 0) {
                fish[tokenId].lastDustCollectedAt = block.timestamp;
                totalDust += dust;
                emit SpawnDustCollected(_owner, tokenId, dust);
            }
        }
        
        return totalDust;
    }

    // ============ View Functions ============

    /**
     * @notice Get fish info
     * @param _tokenId The fish token ID
     */
    function getFishInfo(uint256 _tokenId) external view returns (FishInfo memory) {
        require(_exists(_tokenId), "Fish does not exist");
        return fish[_tokenId];
    }

    /**
     * @notice Get all fish owned by address
     * @param _owner The owner address
     */
    function getFishByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        
        return tokenIds;
    }

    // ============ Internal ============

    /**
     * @notice Determine rarity based on pseudo-random number
     * @dev Uses block data and token info for randomness (not secure for high-value)
     */
    function _determineRarity(uint256 _tokenId, address _to) internal view returns (Rarity) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            _tokenId,
            _to,
            _nextTokenId
        ))) % 100;

        // Common: 0-49 (50%)
        if (random < COMMON_CHANCE) return Rarity.Common;
        // Rare: 50-77 (28%)
        if (random < COMMON_CHANCE + RARE_CHANCE) return Rarity.Rare;
        // Epic: 78-91 (14%)
        if (random < COMMON_CHANCE + RARE_CHANCE + EPIC_CHANCE) return Rarity.Epic;
        // Legendary: 92-97 (6%)
        if (random < COMMON_CHANCE + RARE_CHANCE + EPIC_CHANCE + LEGENDARY_CHANCE) return Rarity.Legendary;
        // Mythic: 98-99 (2%)
        return Rarity.Mythic;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // ============ Overrides ============

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

