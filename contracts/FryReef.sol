// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./EggNFT.sol";
import "./FishNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FryReef
 * @notice Main game contract: check-in, starter pack, resources
 * @dev Manages Pearl Shards, Spawn Dust, daily check-ins, and starter pack
 */
contract FryReef is Ownable {
    // ============ Contracts ============
    EggNFT public eggNFT;
    FishNFT public fishNFT;

    // ============ Constants ============
    uint256 public constant STREAK_FOR_REWARD = 7;
    uint256 public constant PEARL_SHARD_REWARD = 1;
    uint256 public constant STARTER_PACK_EGGS = 1;
    uint256 public constant STARTER_PACK_PEARL_SHARDS = 2;
    uint256 public constant STARTER_PACK_SPAWN_DUST = 100;
    uint256 public constant INCUBATION_DURATION = 1 days;
    uint256 public constant INCUBATION_COST = 1; // Pearl Shards
    uint256 public constant EGG_LAYING_COST = 100; // Spawn Dust
    
    // Merge costs (Spawn Dust)
    uint256 public constant MERGE_COMMON_COST = 50;
    uint256 public constant MERGE_RARE_COST = 100;
    uint256 public constant MERGE_EPIC_COST = 200;
    uint256 public constant MERGE_LEGENDARY_COST = 400;

    // Reef expansion costs (Pearl Shards)
    uint256 public constant INITIAL_REEF_CAPACITY = 3;
    uint256 public constant EXPANSION_COST_1 = 1;
    uint256 public constant EXPANSION_COST_2 = 2;
    uint256 public constant EXPANSION_COST_3 = 4;
    uint256 public constant EXPANSION_COST_4 = 8;
    uint256 public constant EXPANSION_COST_5 = 16;

    // Burn rewards (Spawn Dust)
    uint256 public constant BURN_COMMON_REWARD = 50;
    uint256 public constant BURN_RARE_REWARD = 100;
    uint256 public constant BURN_EPIC_REWARD = 250;
    uint256 public constant BURN_LEGENDARY_REWARD = 500;
    uint256 public constant BURN_MYTHIC_REWARD = 1000;

    // ============ State ============
    struct UserInfo {
        uint256 lastCheckIn;
        uint256 currentStreak;
        uint256 totalCheckIns;
        uint256 pearlShards;
        uint256 spawnDust;
        uint256 reefCapacity;
        bool starterPackClaimed;
    }

    mapping(address => UserInfo) public users;

    // ============ Events ============
    event CheckedIn(address indexed user, uint256 streak, uint256 totalCheckIns);
    event StreakReward(address indexed user, uint256 pearlShards);
    event StarterPackClaimed(address indexed user, uint256 eggId, uint256 pearlShards, uint256 spawnDust);
    event ResourcesUpdated(address indexed user, uint256 pearlShards, uint256 spawnDust);
    event FishMerged(address indexed user, uint256 fishId1, uint256 fishId2, uint256 newFishId, FishNFT.Rarity newRarity, uint256 pearlShardsReward, uint256 eggsReward);
    event ReefExpanded(address indexed user, uint256 newCapacity, uint256 cost);
    event FishBurned(address indexed user, uint256 fishId, FishNFT.Rarity rarity, uint256 spawnDustReward);

    // ============ Constructor ============
    constructor(address _eggNFT, address _fishNFT) Ownable(msg.sender) {
        eggNFT = EggNFT(_eggNFT);
        fishNFT = FishNFT(_fishNFT);
    }

    // ============ Admin (Migration) ============

    /**
     * @notice Restore user data from old contract (migration only)
     * @dev Only callable by owner during migration period
     */
    function restoreUserData(
        address _user,
        uint256 _pearlShards,
        uint256 _spawnDust,
        uint256 _reefCapacity,
        uint256 _currentStreak,
        uint256 _totalCheckIns,
        uint256 _lastCheckIn,
        bool _starterPackClaimed
    ) external onlyOwner {
        require(_user != address(0), "Invalid user address");
        
        users[_user] = UserInfo({
            lastCheckIn: _lastCheckIn,
            currentStreak: _currentStreak,
            totalCheckIns: _totalCheckIns,
            pearlShards: _pearlShards,
            spawnDust: _spawnDust,
            reefCapacity: _reefCapacity == 0 ? INITIAL_REEF_CAPACITY : _reefCapacity,
            starterPackClaimed: _starterPackClaimed
        });

        emit ResourcesUpdated(_user, _pearlShards, _spawnDust);
    }

    /**
     * @notice Batch restore multiple users (gas efficient)
     */
    function batchRestoreUserData(
        address[] calldata _users,
        UserInfo[] calldata _userInfos
    ) external onlyOwner {
        require(_users.length == _userInfos.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "Invalid user address");
            users[_users[i]] = _userInfos[i];
            emit ResourcesUpdated(_users[i], _userInfos[i].pearlShards, _userInfos[i].spawnDust);
        }
    }

    /**
     * @notice Mint fish with specific rarity (migration only)
     * @dev Only callable by owner during migration
     */
    function migrationMintFish(address _to, FishNFT.Rarity _rarity) external onlyOwner {
        require(_to != address(0), "Invalid address");
        fishNFT.mergeMint(_to, _rarity);
    }

    /**
     * @notice Mint egg (migration only)
     * @dev Only callable by owner during migration
     */
    function migrationMintEgg(address _to) external onlyOwner {
        require(_to != address(0), "Invalid address");
        eggNFT.mint(_to);
    }

    /**
     * @notice Update NFT contract addresses (emergency only)
     * @dev Only callable by owner, for deployment fixes
     */
    function updateNFTContracts(address _eggNFT, address _fishNFT) external onlyOwner {
        require(_eggNFT != address(0) && _fishNFT != address(0), "Invalid addresses");
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
        user.reefCapacity = INITIAL_REEF_CAPACITY;

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

        UserInfo storage user = users[msg.sender];
        uint256 currentCapacity = user.reefCapacity == 0 ? INITIAL_REEF_CAPACITY : user.reefCapacity;
        uint256 currentFishCount = fishNFT.balanceOf(msg.sender);
        require(currentFishCount < currentCapacity, "Reef capacity full");

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
        require(fishNFT.canLayEgg(_fishId), "Fish cannot lay egg yet (24h cooldown)");
        require(isFishActive(msg.sender, _fishId), "Fish is inactive (expand reef capacity)");

        user.spawnDust -= EGG_LAYING_COST;
        fishNFT.updateLastEggLaidAt(_fishId);
        eggNFT.mint(msg.sender);

        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    // ============ Spawn Dust Collection ============

    /**
     * @notice Collect Spawn Dust from all active fish (within reef capacity)
     */
    function collectSpawnDust() external {
        UserInfo storage user = users[msg.sender];
        
        // Get only active fish IDs
        uint256[] memory activeFishIds = getActiveFish(msg.sender);
        
        // Collect dust only from active fish
        uint256 totalDust = fishNFT.collectSpawnDustFromFish(activeFishIds);
        user.spawnDust += totalDust;

        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    /**
     * @notice Get pending Spawn Dust for a user (only from active fish)
     */
    function getPendingSpawnDust(address _user) external view returns (uint256) {
        uint256[] memory activeFishIds = getActiveFish(_user);
        uint256 totalDust = 0;
        
        for (uint256 i = 0; i < activeFishIds.length; i++) {
            totalDust += fishNFT.getPendingDustForFish(activeFishIds[i]);
        }
        
        return totalDust;
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

    // ============ Burn Fish ============

    /**
     * @notice Burn multiple fish to receive Spawn Dust
     * @param _fishIds Array of fish token IDs to burn
     */
    function burnFish(uint256[] calldata _fishIds) external {
        UserInfo storage user = users[msg.sender];
        require(_fishIds.length > 0, "No fish to burn");
        
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < _fishIds.length; i++) {
            uint256 fishId = _fishIds[i];
            
            // Check ownership
            require(fishNFT.ownerOf(fishId) == msg.sender, "Not fish owner");
            
            // Get fish info
            FishNFT.FishInfo memory fish = fishNFT.getFishInfo(fishId);
            FishNFT.Rarity rarity = fish.rarity;
            
            // Determine burn reward based on rarity
            uint256 spawnDustReward;
            
            if (rarity == FishNFT.Rarity.Common) {
                spawnDustReward = BURN_COMMON_REWARD;
            } else if (rarity == FishNFT.Rarity.Rare) {
                spawnDustReward = BURN_RARE_REWARD;
            } else if (rarity == FishNFT.Rarity.Epic) {
                spawnDustReward = BURN_EPIC_REWARD;
            } else if (rarity == FishNFT.Rarity.Legendary) {
                spawnDustReward = BURN_LEGENDARY_REWARD;
            } else if (rarity == FishNFT.Rarity.Mythic) {
                spawnDustReward = BURN_MYTHIC_REWARD;
            } else {
                revert("Invalid rarity");
            }
            
            // Burn the fish
            fishNFT.burn(fishId);
            
            totalReward += spawnDustReward;
            
            emit FishBurned(msg.sender, fishId, rarity, spawnDustReward);
        }
        
        // Add total Spawn Dust reward
        user.spawnDust += totalReward;
        
        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    // ============ Reef Expansion ============

    /**
     * @notice Expand reef capacity
     * @dev Costs increase exponentially: 1, 2, 4, 8, 16 Pearl Shards
     */
    function expandReef() external {
        UserInfo storage user = users[msg.sender];
        
        // Initialize capacity if not set (for users who didn't claim starter pack)
        if (user.reefCapacity == 0) {
            user.reefCapacity = INITIAL_REEF_CAPACITY;
        }

        uint256 currentCapacity = user.reefCapacity;
        uint256 expansionLevel = currentCapacity - INITIAL_REEF_CAPACITY;
        uint256 cost;

        // Determine cost based on expansion level
        if (expansionLevel == 0) {
            cost = EXPANSION_COST_1;
        } else if (expansionLevel == 1) {
            cost = EXPANSION_COST_2;
        } else if (expansionLevel == 2) {
            cost = EXPANSION_COST_3;
        } else if (expansionLevel == 3) {
            cost = EXPANSION_COST_4;
        } else if (expansionLevel == 4) {
            cost = EXPANSION_COST_5;
        } else {
            revert("Maximum expansion reached");
        }

        require(user.pearlShards >= cost, "Not enough Pearl Shards");

        user.pearlShards -= cost;
        user.reefCapacity += 1;

        emit ReefExpanded(msg.sender, user.reefCapacity, cost);
        emit ResourcesUpdated(msg.sender, user.pearlShards, user.spawnDust);
    }

    /**
     * @notice Get expansion cost for next level
     */
    function getExpansionCost(address _user) external view returns (uint256) {
        UserInfo storage user = users[_user];
        uint256 currentCapacity = user.reefCapacity == 0 ? INITIAL_REEF_CAPACITY : user.reefCapacity;
        uint256 expansionLevel = currentCapacity - INITIAL_REEF_CAPACITY;

        if (expansionLevel == 0) return EXPANSION_COST_1;
        if (expansionLevel == 1) return EXPANSION_COST_2;
        if (expansionLevel == 2) return EXPANSION_COST_3;
        if (expansionLevel == 3) return EXPANSION_COST_4;
        if (expansionLevel == 4) return EXPANSION_COST_5;
        return type(uint256).max; // Max expansion reached
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

    /**
     * @notice Get user reef capacity
     */
    function getReefCapacity(address _user) external view returns (uint256) {
        UserInfo storage user = users[_user];
        return user.reefCapacity == 0 ? INITIAL_REEF_CAPACITY : user.reefCapacity;
    }

    /**
     * @notice Get time remaining until fish can lay next egg (in seconds)
     * @param _fishId The fish token ID
     * @return timeRemaining Time in seconds until next egg can be laid (0 if ready)
     */
    function getTimeUntilNextEgg(uint256 _fishId) external view returns (uint256) {
        return fishNFT.getTimeUntilNextEgg(_fishId);
    }

    /**
     * @notice Check if fish can lay an egg
     * @param _fishId The fish token ID
     * @return canLay True if fish can lay an egg
     */
    function canLayEgg(uint256 _fishId) external view returns (bool) {
        return fishNFT.canLayEgg(_fishId);
    }

    /**
     * @notice Get active fish count for user (fish that fit in reef capacity)
     * @param _user The user address
     * @return activeFishCount Number of active fish
     * @return totalFishCount Total number of fish owned
     */
    function getActiveFishCount(address _user) external view returns (uint256 activeFishCount, uint256 totalFishCount) {
        totalFishCount = fishNFT.balanceOf(_user);
        uint256 capacity = users[_user].reefCapacity == 0 ? INITIAL_REEF_CAPACITY : users[_user].reefCapacity;
        activeFishCount = totalFishCount > capacity ? capacity : totalFishCount;
        return (activeFishCount, totalFishCount);
    }

    /**
     * @notice Check if specific fish is active (within reef capacity)
     * @param _user The user address
     * @param _fishId The fish token ID
     * @return isActive True if fish is active and producing
     */
    function isFishActive(address _user, uint256 _fishId) public view returns (bool) {
        uint256 totalFish = fishNFT.balanceOf(_user);
        uint256 capacity = users[_user].reefCapacity == 0 ? INITIAL_REEF_CAPACITY : users[_user].reefCapacity;
        
        // Check if fish is within first N tokens (active slots)
        for (uint256 i = 0; i < capacity && i < totalFish; i++) {
            if (fishNFT.tokenOfOwnerByIndex(_user, i) == _fishId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get list of active fish IDs for user
     * @param _user The user address
     * @return activeFishIds Array of active fish token IDs
     */
    function getActiveFish(address _user) public view returns (uint256[] memory) {
        uint256 totalFish = fishNFT.balanceOf(_user);
        uint256 capacity = users[_user].reefCapacity == 0 ? INITIAL_REEF_CAPACITY : users[_user].reefCapacity;
        uint256 activeFishCount = totalFish > capacity ? capacity : totalFish;
        
        uint256[] memory activeFishIds = new uint256[](activeFishCount);
        for (uint256 i = 0; i < activeFishCount; i++) {
            activeFishIds[i] = fishNFT.tokenOfOwnerByIndex(_user, i);
        }
        return activeFishIds;
    }

    // ============ Internal ============

    function _getDayStart(uint256 timestamp) internal pure returns (uint256) {
        return (timestamp / 1 days) * 1 days;
    }
}

