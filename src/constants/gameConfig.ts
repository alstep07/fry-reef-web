/**
 * FryReef Game Configuration
 * @fileoverview All game balance constants and mechanics
 */

/**
 * Fish Rarity enum
 */
export enum Rarity {
  Common = "common",
  Rare = "rare",
  Epic = "epic",
  Legendary = "legendary",
  Mythic = "mythic",
}

/**
 * Rarity configuration
 */
export const RARITY_CONFIG = {
  [Rarity.Common]: {
    name: "Common",
    chance: 50, // 50%
    spawnDustPerDay: 6,
    daysToEgg: 17, // ~100 / 6
  },
  [Rarity.Rare]: {
    name: "Rare",
    chance: 28, // 28%
    spawnDustPerDay: 12,
    daysToEgg: 8, // ~100 / 12
  },
  [Rarity.Epic]: {
    name: "Epic",
    chance: 14, // 14%
    spawnDustPerDay: 18,
    daysToEgg: 6, // ~100 / 18
  },
  [Rarity.Legendary]: {
    name: "Legendary",
    chance: 6, // 6%
    spawnDustPerDay: 32,
    daysToEgg: 3, // ~100 / 32
  },
  [Rarity.Mythic]: {
    name: "Mythic",
    chance: 2, // 2%
    spawnDustPerDay: 48,
    daysToEgg: 2, // ~100 / 48
  },
} as const;

/**
 * Starter Pack rewards (first time claim)
 */
export const STARTER_PACK = {
  eggs: 1,
  pearlShards: 2,
} as const;

/**
 * Daily Check-in rewards
 */
export const DAILY_CHECKIN = {
  streakForReward: 7, // 7 days streak = reward
  pearlShardReward: 1, // 1 Pearl Shard per 7-day streak
} as const;

/**
 * Incubation settings (Egg → Fish)
 */
export const INCUBATION = {
  durationSeconds: 86400, // 1 day (24 * 60 * 60)
  pearlShardCost: 1,
} as const;

/**
 * Egg laying settings (Fish → Egg)
 */
export const EGG_LAYING = {
  spawnDustCost: 100, // Same for all rarities
} as const;

/**
 * Resource types
 */
export enum Resource {
  PearlShard = "pearlShard",
  SpawnDust = "spawnDust",
}

/**
 * Resource metadata
 */
export const RESOURCE_CONFIG = {
  [Resource.PearlShard]: {
    name: "Pearl Shard",
    description: "Used to incubate eggs into fish",
    icon: "🫧",
  },
  [Resource.SpawnDust]: {
    name: "Spawn Dust",
    description: "Used to lay new eggs from fish",
    icon: "✨",
  },
} as const;

