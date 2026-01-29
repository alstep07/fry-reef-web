/**
 * Contracts exports
 * @fileoverview Centralized exports for all contract configurations
 */

export * from "./dailyCheckIn";
export * from "./fishNft";
export * from "./eggNft";

// Export only FryReef-specific items to avoid conflicts
export { FRYREEF_ADDRESS, isFryReefConfigured, fryReefAbi } from "./fryReef";
