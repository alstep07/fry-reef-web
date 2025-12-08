// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./EggNFT.sol";
import "./FishNFT.sol";

/**
 * @title FryReef
 * @notice Main game contract: check-in, starter pack, resources
 * @dev Manages Pearl Shards, Spawn Dust, daily check-ins, and starter pack
 */
contract FryReef {
    // ============ Contracts ============
    EggNFT public eggNFT;
    FishNFT public fishNFT;

    // ============ Constants ============
    uint256 public constant STREAK_FOR_REWARD = 7;
    uint256 public constant PEARL_SHARD_REWARD = 1;
    uint256 public constant STARTER_PACK_EGGS = 1;
    uint256 public constant STARTER_PACK_PEARL_SHARDS = 2;
    uint256 public constant STARTER_PACK_SPAWN_DUST = 50;
    uint256 public constant INCUBATION_DURATION = 1 days;
    uint256 public constant INCUBATION_COST = 1; // Pearl Shards
    uint256 public constant EGG_LAYING_COST = 100; // Spawn Dust
    
    // Merge costs (Spawn Dust)
    uint256 public constant MERGE_COMMON_COST = 50;
    uint256 public constant MERGE_RARE_COST = 100;
    uint256 public constant MERGE_EPIC_COST = 200;
    uint256 public constant MERGE_LEGENDARY_COST = 400;

    // ============ State ============
    struct UserInfo {
        uint256 lastCheckIn;
        uint256 currentStreak;
        uint256 totalCheckIns;
        uint256 pearlShards;
        uint256 spawnDust;
        bool starterPackClaimed;
    }

    mapping(address => UserInfo) public users;

    // ============ Events ============
    event CheckedIn(address indexed user, uint256 streak, uint256 totalCheckIns);
    event StreakReward(address indexed user, uint256 pearlShards);
    event StarterPackClaimed(address indexed user, uint256 eggId, uint256 pearlShards, uint256 spawnDust);
    event ResourcesUpdated(address indexed user, uint256 pearlShards, uint256 spawnDust);
    event FishMerged(address indexed user, uint256 fishId1, uint256 fishId2, uint256 newFishId, FishNFT.Rarity newRarity, uint256 pearlShardsReward, uint256 eggsReward);

    // ============ Constructor ============
    constructor(address _eggNFT, address _fishNFT) {
        eggNFT = EggNFT(_eggNFT);
        fishNFT = FishNFT(_fishNFT);
    }

    // ============ Starter Pack ============
    
    /**
     * @notice Claim starter pack (first time only)
     * @dev Gives 1 egg + 2 Pearl Shards
     */
    function claimStarterPack() external {
        UserInfo storage user = users[msg.sender];
        require(!user.starterPackClaimed, "Starter pack already claimed");

        user.starterPackClaimed = true;
        user.pearlShards += STARTER_PACK_PEARL_SHARDS;
        user.spawnDust += STARTER_PACK_SPAWN_DUST;

        // Mint first egg
        uint256 eggId = eggNFT.mint(msg.sender);

        emit StarterPackClaimed(msg.sender, eggId, STARTER_PACK_PEARL_SHARDS, STARTER_PACK_SPAWN_DUST);
        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    /**
     * @notice Check if user has claimed starter pack
     */
    function hasClaimedStarterPack(address _user) external view returns (bool) {
        return users[_user].starterPackClaimed;
    }

    // ============ Daily Check-in ============

    /**
     * @notice Daily check-in
     * @dev Awards 1 Pearl Shard every 7 consecutive days
     */
    function checkIn() external {
        UserInfo storage user = users[msg.sender];

        uint256 today = _getDayStart(block.timestamp);
        uint256 lastCheckInDay = _getDayStart(user.lastCheckIn);
        uint256 yesterday = today - 1 days;

        require(today > lastCheckInDay, "Already checked in today");

        // Check if streak continues or resets
        if (lastCheckInDay == yesterday) {
            // Consecutive day - continue streak
            user.currentStreak += 1;
        } else {
            // Streak broken - reset to 1
            user.currentStreak = 1;
        }

        user.lastCheckIn = block.timestamp;
        user.totalCheckIns += 1;

        emit CheckedIn(msg.sender, user.currentStreak, user.totalCheckIns);

        // Award Pearl Shard every 7 days
        if (user.currentStreak >= STREAK_FOR_REWARD && user.currentStreak % STREAK_FOR_REWARD == 0) {
            user.pearlShards += PEARL_SHARD_REWARD;
            emit StreakReward(msg.sender, PEARL_SHARD_REWARD);
            emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
        }
    }

    /**
     * @notice Check if user has checked in today
     */
    function hasCheckedInToday(address _user) external view returns (bool) {
        uint256 today = _getDayStart(block.timestamp);
        uint256 lastCheckInDay = _getDayStart(users[_user].lastCheckIn);
        return today == lastCheckInDay && users[_user].lastCheckIn > 0;
    }

    // ============ Incubation (Egg → Fish) ============

    /**
     * @notice Start incubating an egg
     * @param _eggId The egg token ID to incubate
     */
    function startIncubation(uint256 _eggId) external {
        UserInfo storage user = users[msg.sender];
        require(user.pearlShards >= INCUBATION_COST, "Not enough Pearl Shards");
        require(eggNFT.ownerOf(_eggId) == msg.sender, "Not egg owner");

        user.pearlShards -= INCUBATION_COST;
        eggNFT.startIncubation(_eggId);

        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    /**
     * @notice Hatch an incubated egg into a fish
     * @param _eggId The egg token ID to hatch
     */
    function hatchEgg(uint256 _eggId) external {
        require(eggNFT.ownerOf(_eggId) == msg.sender, "Not egg owner");
        require(eggNFT.canHatch(_eggId), "Cannot hatch yet");

        // Burn egg
        eggNFT.burn(_eggId);

        // Mint fish with random rarity
        fishNFT.mint(msg.sender);
    }

    // ============ Egg Laying (Fish → Egg) ============

    /**
     * @notice Lay a new egg from a fish
     * @param _fishId The fish token ID
     */
    function layEgg(uint256 _fishId) external {
        UserInfo storage user = users[msg.sender];
        require(user.spawnDust >= EGG_LAYING_COST, "Not enough Spawn Dust");
        require(fishNFT.ownerOf(_fishId) == msg.sender, "Not fish owner");

        user.spawnDust -= EGG_LAYING_COST;
        eggNFT.mint(msg.sender);

        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    // ============ Spawn Dust Collection ============

    /**
     * @notice Collect Spawn Dust from all owned fish
     */
    function collectSpawnDust() external {
        UserInfo storage user = users[msg.sender];
        
        uint256 totalDust = fishNFT.collectAllSpawnDust(msg.sender);
        user.spawnDust += totalDust;

        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    /**
     * @notice Get pending Spawn Dust for a user
     */
    function getPendingSpawnDust(address _user) external view returns (uint256) {
        return fishNFT.getPendingSpawnDust(_user);
    }

    // ============ Merge (Fish → Fish) ============

    /**
     * @notice Merge two fish of the same rarity into a fish of the next rarity
     * @param _fishId1 First fish token ID
     * @param _fishId2 Second fish token ID
     */
    function mergeFish(uint256 _fishId1, uint256 _fishId2) external {
        UserInfo storage user = users[msg.sender];
        
        // Check ownership
        require(fishNFT.ownerOf(_fishId1) == msg.sender, "Not fish owner");
        require(fishNFT.ownerOf(_fishId2) == msg.sender, "Not fish owner");
        require(_fishId1 != _fishId2, "Cannot merge same fish");
        
        // Get fish info
        FishNFT.FishInfo memory fish1 = fishNFT.getFishInfo(_fishId1);
        FishNFT.FishInfo memory fish2 = fishNFT.getFishInfo(_fishId2);
        
        // Check same rarity
        require(fish1.rarity == fish2.rarity, "Fish must be same rarity");
        
        // Check rarity is not Mythic (max rarity)
        require(fish1.rarity != FishNFT.Rarity.Mythic, "Cannot merge Mythic");
        
        // Determine merge cost and rewards
        uint256 mergeCost;
        uint256 pearlShardsReward;
        uint256 eggsReward;
        FishNFT.Rarity newRarity;
        
        if (fish1.rarity == FishNFT.Rarity.Common) {
            mergeCost = MERGE_COMMON_COST;
            pearlShardsReward = 1;
            eggsReward = 0;
            newRarity = FishNFT.Rarity.Rare;
        } else if (fish1.rarity == FishNFT.Rarity.Rare) {
            mergeCost = MERGE_RARE_COST;
            pearlShardsReward = 1;
            eggsReward = 1;
            newRarity = FishNFT.Rarity.Epic;
        } else if (fish1.rarity == FishNFT.Rarity.Epic) {
            mergeCost = MERGE_EPIC_COST;
            pearlShardsReward = 2;
            eggsReward = 1;
            newRarity = FishNFT.Rarity.Legendary;
        } else if (fish1.rarity == FishNFT.Rarity.Legendary) {
            mergeCost = MERGE_LEGENDARY_COST;
            pearlShardsReward = 3;
            eggsReward = 2;
            newRarity = FishNFT.Rarity.Mythic;
        } else {
            revert("Invalid rarity for merge");
        }
        
        // Check user has enough Spawn Dust
        require(user.spawnDust >= mergeCost, "Not enough Spawn Dust");
        
        // Burn both fish
        fishNFT.burn(_fishId1);
        fishNFT.burn(_fishId2);
        
        // Deduct Spawn Dust
        user.spawnDust -= mergeCost;
        
        // Add Pearl Shards reward
        user.pearlShards += pearlShardsReward;
        
        // Mint new fish with next rarity
        uint256 newFishId = fishNFT.mergeMint(msg.sender, newRarity);
        
        // Mint eggs reward
        for (uint256 i = 0; i < eggsReward; i++) {
            eggNFT.mint(msg.sender);
        }
        
        emit FishMerged(msg.sender, _fishId1, _fishId2, newFishId, newRarity, pearlShardsReward, eggsReward);
        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    // ============ View Functions ============

    /**
     * @notice Get user info
     */
    function getUserInfo(address _user) external view returns (UserInfo memory) {
        return users[_user];
    }

    /**
     * @notice Get user resources
     */
    function getResources(address _user) external view returns (uint256 pearlShards, uint256 spawnDust) {
        UserInfo storage user = users[_user];
        return (user.pearlShards, user.spawnDust);
    }

    // ============ Internal ============

    function _getDayStart(uint256 timestamp) internal pure returns (uint256) {
        return (timestamp / 1 days) * 1 days;
    }
}

