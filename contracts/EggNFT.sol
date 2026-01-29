// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title EggNFT
 * @notice ERC-721 contract for fish eggs
 * @dev Eggs can be incubated and hatched into fish
 */
contract EggNFT is ERC721, ERC721Enumerable, Ownable {
    // ============ Constants ============
    uint256 public constant INCUBATION_DURATION = 1 days;

    // ============ State ============
    uint256 private _nextTokenId;
    address public gameContract;

    struct EggInfo {
        uint256 mintedAt;
        uint256 incubationStartedAt;
        bool isIncubating;
    }

    mapping(uint256 => EggInfo) public eggs;

    // ============ Events ============
    event EggMinted(address indexed owner, uint256 indexed tokenId);
    event IncubationStarted(uint256 indexed tokenId, uint256 startTime);
    event EggHatched(uint256 indexed tokenId);

    // ============ Modifiers ============
    modifier onlyGameContract() {
        require(msg.sender == gameContract, "Only game contract");
        _;
    }

    // ============ Constructor ============
    constructor() ERC721("FryReef Egg", "FRYEGG") Ownable(msg.sender) {}

    // ============ Admin ============

    /**
     * @notice Set the game contract address (can only be set once)
     */
    function setGameContract(address _gameContract) external onlyOwner {
        require(gameContract == address(0), "Game contract already set");
        require(_gameContract != address(0), "Invalid address");
        gameContract = _gameContract;
    }

    /**
     * @notice Returns the contract-level metadata URI for OpenSea
     */
    function contractURI() public pure returns (string memory) {
        return "https://fry-reef.vercel.app/api/collection/egg";
    }

    /**
     * @notice Returns the token metadata URI for OpenSea
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(
            "https://fry-reef.vercel.app/api/token/base/",
            Strings.toHexString(uint160(address(this)), 20),
            "/",
            Strings.toString(tokenId)
        ));
    }

    // ============ Minting ============

    /**
     * @notice Mint a new egg
     * @param _to Address to mint to
     * @return tokenId The minted token ID
     */
    function mint(address _to) external onlyGameContract returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(_to, tokenId);

        eggs[tokenId] = EggInfo({
            mintedAt: block.timestamp,
            incubationStartedAt: 0,
            isIncubating: false
        });

        emit EggMinted(_to, tokenId);
        return tokenId;
    }

    // ============ Incubation ============

    /**
     * @notice Start incubating an egg
     * @param _tokenId The egg token ID
     */
    function startIncubation(uint256 _tokenId) external onlyGameContract {
        require(_exists(_tokenId), "Egg does not exist");
        require(!eggs[_tokenId].isIncubating, "Already incubating");

        eggs[_tokenId].isIncubating = true;
        eggs[_tokenId].incubationStartedAt = block.timestamp;

        emit IncubationStarted(_tokenId, block.timestamp);
    }

    /**
     * @notice Check if egg can be hatched
     * @param _tokenId The egg token ID
     */
    function canHatch(uint256 _tokenId) external view returns (bool) {
        if (!_exists(_tokenId)) return false;
        EggInfo storage egg = eggs[_tokenId];
        if (!egg.isIncubating) return false;
        return block.timestamp >= egg.incubationStartedAt + INCUBATION_DURATION;
    }

    /**
     * @notice Get time remaining until hatch (in seconds)
     * @param _tokenId The egg token ID
     */
    function getTimeUntilHatch(uint256 _tokenId) external view returns (uint256) {
        require(_exists(_tokenId), "Egg does not exist");
        EggInfo storage egg = eggs[_tokenId];
        if (!egg.isIncubating) return type(uint256).max;
        
        uint256 hatchTime = egg.incubationStartedAt + INCUBATION_DURATION;
        if (block.timestamp >= hatchTime) return 0;
        return hatchTime - block.timestamp;
    }

    /**
     * @notice Get egg info
     * @param _tokenId The egg token ID
     */
    function getEggInfo(uint256 _tokenId) external view returns (EggInfo memory) {
        require(_exists(_tokenId), "Egg does not exist");
        return eggs[_tokenId];
    }

    // ============ Burning ============

    /**
     * @notice Burn an egg (when hatching)
     * @param _tokenId The egg token ID
     */
    function burn(uint256 _tokenId) external onlyGameContract {
        require(_exists(_tokenId), "Egg does not exist");
        _burn(_tokenId);
        delete eggs[_tokenId];
        emit EggHatched(_tokenId);
    }

    // ============ Internal ============

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // ============ Overrides ============

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Block transfers (except minting and burning)
        if (from != address(0) && to != address(0)) {
            revert("Eggs are non-transferable");
        }
        
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

