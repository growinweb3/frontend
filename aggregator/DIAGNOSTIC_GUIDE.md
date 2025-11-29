# 🔍 Vault Data Duplication Diagnostic Guide

## Current Issue
All three vaults (Conservative, Balanced, Aggressive) are showing identical data:
- Same APY: 3.22%
- Same Total Assets: $2,080.05

## Expected Behavior
Each vault should display unique data based on their individual contract addresses:
- **Conservative**: `0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c`
- **Balanced**: `0x21AF332B10481972B903cBd6C3f1ec51546552e7`
- **Aggressive**: `0xc4E50772bd6d27661EE12d81e62Daa4882F4E6f4`

## How to Diagnose

### Step 1: Open Browser Console
1. Press **F12** or **Ctrl+Shift+I** (Cmd+Option+I on Mac)
2. Navigate to the **Console** tab
3. Clear the console (🚫 button)
4. Refresh the `/vaults` page

### Step 2: Look for Diagnostic Logs
You should see grouped console logs with the following patterns:

#### 🎴 VaultCard Logs (3 groups - one per vault)
```
🎴 [VaultCard] conservative
  📋 Props & Type:
    vaultType: "conservative"
    typeOf: "string"
  🏦 Vault Data:
    vaultAddress: "0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c"
    addressMatch: true  ← SHOULD BE TRUE
  📊 Raw Values:
    totalAssets: "2080050000"  ← SHOULD BE DIFFERENT FOR EACH VAULT
    apy: "32200000000000000000"  ← SHOULD BE DIFFERENT FOR EACH VAULT
```

#### 🔍 useVaultWeightedAPY Logs (3 groups - one per vault)
```
🔍 [useVaultWeightedAPY] conservative
  📍 Vault Info:
    vaultType: "conservative"
    vaultAddress: "0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c"
    addressMatch: true  ← SHOULD BE TRUE
  🎯 Strategy Addresses:
    strat0Addr: "0x..."  ← SHOULD BE DIFFERENT FOR EACH VAULT
    strat1Addr: "0x..."  ← SHOULD BE DIFFERENT FOR EACH VAULT
  💰 Strategy Data:
    strat0APY: "..."  ← SHOULD BE DIFFERENT FOR EACH VAULT
    strat1APY: "..."  ← SHOULD BE DIFFERENT FOR EACH VAULT
  🔑 ScopeKeys Used:
    strategy0: "strategy0-conservative"  ← SHOULD BE UNIQUE PER VAULT
```

## Diagnostic Scenarios

### ✅ Scenario A: Different vault addresses BUT same strategy data
**Console shows:**
- ✅ VaultCard shows 3 different `vaultAddress` values
- ✅ `addressMatch: true` for all 3 vaults
- ❌ Strategy addresses (`strat0Addr`, `strat1Addr`) are IDENTICAL across vaults
- ❌ APY values are IDENTICAL

**Diagnosis:** Blockchain query cache collision - wagmi is still caching despite scopeKey

**Next Steps:**
1. Check if strategy addresses are actually the same on-chain (they might be shared)
2. Investigate wagmi's internal queryKey generation
3. Consider bypassing wagmi for these specific calls

---

### ✅ Scenario B: Same vault addresses for all vaults
**Console shows:**
- ❌ All 3 VaultCard logs show SAME `vaultAddress`
- ❌ `addressMatch: false` or only true for one vault
- ❌ APY values are IDENTICAL

**Diagnosis:** `useVaultAddress` hook is not mapping vaultType correctly

**Root Cause:** VaultType enum values or string comparison issue

**Next Steps:**
1. Check `[useVaultAddress]` logs to see input/output mapping
2. Verify VaultType enum matches expected strings
3. Fix mapping logic in useVaultAddress hook

---

### ✅ Scenario C: Different raw data BUT same formatted display
**Console shows:**
- ✅ VaultCard shows 3 different `vaultAddress` values
- ✅ Raw `apy` values are DIFFERENT (e.g., "32200000000000000000", "45000000000000000000")
- ❌ Formatted `currentAPY` values are IDENTICAL (all showing 3.22)

**Diagnosis:** Rendering/calculation issue, not a data fetching issue

**Root Cause:** formatUnits conversion or React state batching

**Next Steps:**
1. Check the calculation logic for `currentAPY` in vault-card.tsx
2. Verify formatUnits is using correct decimals
3. Add React.memo or useMemo to prevent state batching

---

### ✅ Scenario D: No logs appear
**Console shows:**
- ❌ No grouped logs with 🎴 or 🔍 emojis

**Diagnosis:** Hooks not being called or conditional logic preventing execution

**Next Steps:**
1. Check if vaults are rendering at all
2. Verify `vaultType` prop is being passed correctly
3. Check if `enabled` conditions in hooks are preventing execution

## What to Report Back

Please copy and paste the following from your console:

1. **All VaultCard logs** - Look for lines starting with `🎴 [VaultCard]`
2. **All useVaultWeightedAPY logs** - Look for lines starting with `🔍 [useVaultWeightedAPY]`
3. **All useVaultAddress logs** - Look for lines starting with `[useVaultAddress]`
4. **All Strategy Hook logs** - Look for lines starting with `[Strategy0 Hook]` or `[Strategy1 Hook]`

### Quick Copy Template
```
=== VAULT ADDRESSES ===
[Copy all useVaultAddress logs here]

=== VAULT CARDS ===
[Copy all VaultCard grouped logs here]

=== WEIGHTED APY HOOKS ===
[Copy all useVaultWeightedAPY grouped logs here]

=== STRATEGY HOOKS ===
[Copy all Strategy0/Strategy1 Hook logs here]
```

## Expected Pattern for Working System

If everything is working correctly, you should see:

```
🎴 [VaultCard] conservative
  🏦 vaultAddress: "0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c"
  📊 totalAssets: "2080050000"
  📊 apy: "32200000000000000000"

🎴 [VaultCard] balanced
  🏦 vaultAddress: "0x21AF332B10481972B903cBd6C3f1ec51546552e7"  ← DIFFERENT
  📊 totalAssets: "1500000000"  ← DIFFERENT
  📊 apy: "45000000000000000000"  ← DIFFERENT

🎴 [VaultCard] aggressive
  🏦 vaultAddress: "0xc4E50772bd6d27661EE12d81e62Daa4882F4E6f4"  ← DIFFERENT
  📊 totalAssets: "3200000000"  ← DIFFERENT
  📊 apy: "78000000000000000000"  ← DIFFERENT
```

## Common Issues

### Issue 1: VaultType not being passed correctly
- Check if `vaultType` prop is actually the VaultType enum or just a string
- Verify the mapping in `useVaultAddress` uses correct comparison

### Issue 2: React Query cache collision
- Even with `scopeKey`, wagmi might generate identical internal queryKeys
- Check if `vaultAddress` is `undefined` when hooks are called (causes cache collision)

### Issue 3: React re-render batching
- React might be batching state updates causing UI to show stale data
- Try wrapping calculations in `useMemo` with proper dependencies

---

**After you provide the console logs, I can pinpoint the exact root cause and implement the correct fix.**
