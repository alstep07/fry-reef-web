/**
 * Base Builder Code integration (ERC-8021)
 * @see https://docs.base.org/base-chain/builder-codes/app-developers
 *
 * Get your Builder Code from base.dev → Settings → Builder Code
 * Add NEXT_PUBLIC_BUILDER_CODE to your .env
 */
import { Attribution } from "ox/erc8021";

import { ENV_KEYS } from "@/constants/config";

const BUILDER_CODE = process.env[ENV_KEYS.BUILDER_CODE];

/**
 * Data suffix for transaction attribution.
 * Appended to calldata for Base analytics and rewards.
 * Returns undefined if no builder code is configured.
 */
export const DATA_SUFFIX = BUILDER_CODE
  ? (Attribution.toDataSuffix({ codes: [BUILDER_CODE] }) as `0x${string}`)
  : undefined;
