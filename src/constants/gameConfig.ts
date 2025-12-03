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
    color: "#9CA3AF", // gray
  },
  [Rarity.Rare]: {
    name: "Rare",
    chance: 28, // 28%
    spawnDustPerDay: 12,
    daysToEgg: 8, // ~100 / 12
    color: "#3B82F6", // blue
  },
  [Rarity.Epic]: {
    name: "Epic",
    chance: 14, // 14%
    spawnDustPerDay: 18,
    daysToEgg: 6, // ~100 / 18
    color: "#8B5CF6", // purple
  },
  [Rarity.Legendary]: {
    name: "Legendary",
    chance: 6, // 6%
    spawnDustPerDay: 32,
    daysToEgg: 3, // ~100 / 32
    color: "#F59E0B", // gold
  },
  [Rarity.Mythic]: {
    name: "Mythic",
    chance: 2, // 2%
    spawnDustPerDay: 48,
    daysToEgg: 2, // ~100 / 48
    color: "#EC4899", // pink/rainbow
  },
} as const;

/**
 * Fish images by rarity
 */
export const FISH_IMAGES = {
  [Rarity.Common]: "/images/fish/common.png",
  [Rarity.Rare]: "/images/fish/rare.png",
  [Rarity.Epic]: "/images/fish/epic.png",
  [Rarity.Legendary]: "/images/fish/legendary.png",
  [Rarity.Mythic]: "/images/fish/mythic.png",
} as const;

/**
 * Egg incubation stages
 */
export enum EggStage {
  Stage1 = 1, // Small egg, empty
  Stage2 = 2, // Medium egg, dark dot inside
  Stage3 = 3, // Large egg, fish silhouette inside
}

/**
 * Egg images by incubation stage
 */
export const EGG_IMAGES = {
  [EggStage.Stage1]: "/images/egg/stage1.png",
  [EggStage.Stage2]: "/images/egg/stage2.png",
  [EggStage.Stage3]: "/images/egg/stage3.png",
} as const;

/**
 * Get egg stage based on incubation progress (0-100%)
 */
export function getEggStage(progress: number): EggStage {
  if (progress < 33) return EggStage.Stage1;
  if (progress < 66) return EggStage.Stage2;
  return EggStage.Stage3;
}

/**
 * Get egg image based on incubation progress
 */
export function getEggImage(progress: number): string {
  return EGG_IMAGES[getEggStage(progress)];
}

/**
 * Get fish image by rarity
 */
export function getFishImage(rarity: Rarity): string {
  return FISH_IMAGES[rarity];
}

/**
 * Starter Pack rewards (first time claim)
 */
export const STARTER_PACK = {
  eggs: 1,
  pearlShards: 2,
  spawnDust: 50,
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
