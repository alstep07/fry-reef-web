# Transaction State Synchronization Architecture

## Problem
Coinbase Wallet on Base Mini App has delayed state updates - transactions complete but data doesn't reflect changes immediately. This causes:
- Stale state displays
- Modals failing to open
- Fish/eggs not appearing
- Check-in streak not updating
- Race conditions between multiple transactions

## Solution
Three-layer synchronization system:

### Layer 1: Transaction Confirmation (useTransaction.ts)
```
Send TX → Wait for receipt → Invoke transactionSync
```
- Uses `waitForTransactionSync()` with retry logic
- Supports Coinbase Wallet's async behavior
- Waits up to 5 attempts with 800ms delays

### Layer 2: Cache Invalidation (transactionSync.ts)
```
Transaction type (lay_egg, hatch_egg, etc.) → 
Targeted query key invalidation →
Custom event dispatch (transaction:success)
```

**Transaction Types:**
- `lay_egg` → Invalidates: fishByOwner, pendingDust, eggInfo
- `hatch_egg` → Invalidates: eggInfo, fishByOwner, timeUntilHatch
- `start_incubation` → Invalidates: eggInfo, canHatch
- `collect_dust` → Invalidates: userInfo, pendingSpawnDust
- `check_in` → Invalidates: userInfo, hasCheckedInToday
- `merge_fish` → Invalidates: fishByOwner, userInfo
- `burn_fish` → Invalidates: fishByOwner, userInfo
- `expand_reef` → Invalidates: reefCapacity, expansionCost, userInfo
- `claim_starter_pack` → Invalidates: userInfo, hasClaimedStarterPack

### Layer 3: Hook Synchronization
```
Hooks listen to "transaction:success" events →
Re-fetch affected data →
Reset loading timers →
UI updates automatically
```

## Key Files

### src/lib/transactionSync.ts (NEW)
- `TransactionType` enum for all transaction types
- `waitForTransactionSync()` - Coinbase-safe confirmation
- `invalidateQueriesByType()` - Precise cache invalidation
- `syncTransactionData()` - Orchestrates cache sync

### src/hooks/useTransaction.ts (UPDATED)
- Now accepts `transactionType` parameter
- Calls `syncTransactionData()` on success
- Awaits user callbacks for modal logic

### src/hooks/useFish.ts (UPDATED)
- Listens to `transaction:success` events
- Auto-refetch on fish-related transactions
- Resets loading timers on invalidation

### src/hooks/useEggs.ts (UPDATED)
- Listens to `transaction:success` events
- Auto-refetch on egg-related transactions
- Resets loading timers on invalidation

### src/hooks/useFryReef.ts (UPDATED)
- Each transaction specifies its type
- Listens to `transaction:success` for critical refetches
- Transaction types: claim_starter_pack, check_in, collect_dust, etc.

## Usage Example

```typescript
// In component
const layEggTx = useTransaction({
  onSuccess: async () => {
    setShowModal(true); // Opens after state is synced
  },
  transactionType: "lay_egg", // Tells system what to invalidate
});

const success = await layEggTx.execute({
  address: contractAddress,
  abi: fryReefAbi,
  functionName: "layEgg",
  args: [BigInt(fishId)],
});
```

## Event Flow

```
1. TX sent to wallet
   ↓
2. Receipt confirmed
   ↓
3. waitForTransactionSync() succeeds
   ↓
4. syncTransactionData() called with transactionType
   ↓
5. Specific query keys invalidated
   ↓
6. transaction:success event dispatched
   ↓
7. useFish/useEggs/useFryReef listen and re-fetch
   ↓
8. UI updates with fresh data
   ↓
9. onSuccess callback (modal logic, etc.)
```

## Why This Works for Coinbase Wallet

1. **Retry Logic**: Coinbase takes longer, our 5 retries × 800ms handles it
2. **Precise Invalidation**: Only queries affected by this TX are invalidated
3. **Event-Based**: No manual refetch calls, auto-synchronized
4. **Modal Safe**: onSuccess callback runs AFTER state is synced
5. **No Race Conditions**: Each transaction type knows exactly what to invalidate

## Best Practices

✅ Always specify `transactionType` when creating transactions
✅ Use async/await in `onSuccess` for modals
✅ Let hooks auto-refetch via events (don't call refetch manually)
✅ Reset loading timers on cache invalidation
✅ Use `keepPreviousData` in queries for better UX

❌ Don't use `invalidateQueries()` without filters
❌ Don't refetch manually from components
❌ Don't open modals before transaction completes
❌ Don't rely on single confirmation count
