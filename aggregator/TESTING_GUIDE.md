# Quick Testing Guide

## Prerequisites
1. Wallet connected to Lisk Sepolia testnet
2. Some USDC in wallet (use TestTokenFaucet to mint)
3. Browser console open (F12) to view debug logs

---

## Test 1: Withdrawal Approval Flow ✅

### Steps:
1. **Setup** (if you haven't deposited yet):
   ```
   - Go to Vaults page
   - Select any vault (Conservative/Balanced/Aggressive)
   - Mint test USDC using faucet
   - Approve USDC spending
   - Deposit USDC
   - Wait for batch execution (6 hours) OR contract owner force execute
   - Claim vault shares
   ```

2. **Test Withdrawal Approval**:
   ```
   - Click "Withdraw" tab in vault card
   - Enter withdrawal amount (less than your shares)
   - Should see: "Approve Vault Shares" button (orange)
   - Should see: Alert message "One-time approval needed..."
   - Click "Approve Vault Shares"
   - Confirm in MetaMask
   - Wait 2 seconds
   - Button should change to: "Withdraw" (blue)
   - Click "Withdraw"
   - Confirm in MetaMask
   - Should see success message
   ```

### Expected Result:
- ✅ Orange "Approve" button appears first
- ✅ After approval, blue "Withdraw" button appears
- ✅ Withdrawal transaction succeeds
- ✅ No more "insufficient allowance" errors

### Console Logs to Check:
```javascript
// Should NOT see:
"Vault share approval failed: User rejected transaction"

// Should see:
"Approval Successful! ✅"
"Withdrawal Queued! 🎉"
```

---

## Test 2: Transaction History Display ✅

### Steps:
1. **Navigate to History Page**:
   ```
   - Click "History" in navigation
   - Page should load (not show hardcoded sample data)
   ```

2. **Check Display States**:
   
   **If no transactions yet**:
   - Should see: "No transactions yet" message
   - Should see: "Your transaction history will appear here"
   
   **If loading**:
   - Should see: Spinning loader
   
   **If have transactions**:
   - Should see: List of real transactions
   - Each row shows: Icon, Type, Vault name, Time ago, Transaction hash
   - Click hash → Opens Lisk Sepolia block explorer

3. **Execute Test Transaction**:
   ```
   - Go back to Vaults page
   - Deposit USDC to any vault
   - Wait ~30 seconds
   - Go back to History page
   - New "Deposit" transaction should appear at top
   ```

### Expected Result:
- ✅ No hardcoded "Sample Transaction" data
- ✅ Real transaction hashes (clickable, opens explorer)
- ✅ Correct timestamps ("2h ago", "1d ago", etc.)
- ✅ Correct transaction types (Deposit, Withdraw, Claim Shares, Claim USDC)
- ✅ Correct vault names (Conservative/Balanced/Aggressive)

### Console Logs to Check:
```javascript
// Should see in console:
[useTransactionHistory] Fetching events for user: 0x...
[useTransactionHistory] Found X transactions

// Should NOT see:
"Sample Transaction" or hardcoded data
```

---

## Test 3: Vault Data Uniqueness 🔍

### Steps:
1. **Open Browser Console** (F12 → Console tab)

2. **Navigate to Vaults Page**

3. **Check Console Logs**:
   Look for these log patterns:
   ```javascript
   [VaultList Debug] All vault types: ["conservative", "balanced", "aggressive"]
   [VaultList] Mapping vault 0: { originalType: "conservative", strictType: "conservative", ... }
   [VaultList] Mapping vault 1: { originalType: "balanced", strictType: "balanced", ... }
   [VaultList] Mapping vault 2: { originalType: "aggressive", strictType: "aggressive", ... }
   
   [useVaultAddress] { input: "conservative", normalized: "conservative", output: "0x6E69Ed7A..." }
   [useVaultAddress] { input: "balanced", normalized: "balanced", output: "0x21AF332B..." }
   [useVaultAddress] { input: "aggressive", normalized: "aggressive", output: "0xc4E50772..." }
   
   [VaultCard Debug] Type: conservative | TypeOf: string { vaultAddress: "0x6E69Ed7A...", totalAssets: "..." }
   [VaultCard Debug] Type: balanced | TypeOf: string { vaultAddress: "0x21AF332B...", totalAssets: "..." }
   [VaultCard Debug] Type: aggressive | TypeOf: string { vaultAddress: "0xc4E50772...", totalAssets: "..." }
   ```

4. **Verify Vault Addresses**:
   - Conservative: `0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c`
   - Balanced: `0x21AF332B10481972B903cBd6C3f1ec51546552e7`
   - Aggressive: `0xc4E50772bd6d27661EE12d81e62Daa4882F4E6f4`

5. **Visual Check on UI**:
   - Look at TVL values on each vault card
   - Conservative should have different TVL than Balanced
   - Pending deposits should differ between vaults
   - Strategy allocation should differ (Conservative: 80% Aave, Balanced: 50/50, Aggressive: 30% Aave)

### Expected Result:
- ✅ Console shows 3 different vault addresses
- ✅ Each vault card displays unique data
- ✅ TVL values are different between vaults
- ✅ Strategy distributions match expected allocations

### If All Vaults Still Show Same Data:
**Possible causes**:
1. **React Query cache issue** → Clear browser cache and refresh
2. **Contract state issue** → All vaults actually have same TVL (check on block explorer)
3. **RPC caching** → Try different RPC endpoint
4. **Stale state** → Hard refresh (Ctrl+Shift+R)

**Debug steps**:
```javascript
// In browser console, run:
console.clear()
window.location.reload()

// Then check if vaultAddress values are different
// If addresses are different but data is same, it's a contract/RPC issue
// If addresses are same, it's a code logic issue (check normalized type)
```

---

## Common Issues & Solutions

### Issue: "Approve Vault Shares" button doesn't appear
**Solution**: 
- Make sure you have vault shares (deposit → batch execute → claim)
- Check console for errors
- Verify `vaultShareAllowance` is being fetched

### Issue: Transaction history shows "No transactions yet" but I have transactions
**Solution**:
- Wait 30 seconds for query to refetch
- Check if wallet is connected
- Verify transactions on block explorer (should have Router contract events)
- Check console for RPC errors

### Issue: All vaults show same data
**Solution**:
1. Check console logs - are vault addresses different?
2. If addresses are different but data same → Contract/RPC issue
3. If addresses are same → Check `getAllVaultTypes()` returns correct enum values
4. Clear browser cache and hard refresh
5. Try different browser

### Issue: Withdrawal still fails after approval
**Solution**:
- Check if approval transaction actually succeeded on explorer
- Try refreshing page (allowance refetch)
- Verify you have vault shares to withdraw
- Check console for specific error message

---

## Performance Checks

### Page Load Times:
- **Vaults page**: Should load in <3 seconds
- **History page**: Should show data in <2 seconds
- **Approval transaction**: Should confirm in <10 seconds (Lisk Sepolia)

### Console Warnings to Ignore:
- MetaMask extension conflicts (expected)
- XellarKit embedded wallet warnings (expected)
- Vercel Analytics in dev mode (expected)

### Console Errors to Report:
- "Failed to fetch contract data"
- "Transaction reverted"
- "RPC error"
- "Allowance check failed"

---

## Success Criteria

### All tests pass if:
1. ✅ Withdrawal approval flow works end-to-end
2. ✅ Transaction history shows real blockchain events
3. ✅ Each vault displays unique data (different addresses, TVL, strategies)
4. ✅ No critical errors in console
5. ✅ All transactions complete successfully

### Report Issues:
If any test fails, provide:
1. Browser console screenshot
2. Steps to reproduce
3. Expected vs actual behavior
4. Network (should be Lisk Sepolia)
5. Wallet address (for debugging)

---

## Next Steps After Testing

### If all tests pass:
1. Remove debug console.log statements (or gate with `process.env.NODE_ENV === 'development'`)
2. Add analytics tracking for approval flows
3. Add user guide/tooltip for approval mechanism
4. Consider adding "Revoke Approval" button
5. Implement pagination for transaction history

### If vault data issue persists:
1. Check contract state on block explorer
2. Verify Router.vaults(0/1/2) returns correct addresses
3. Check if vaults actually have different TVL on-chain
4. Test with different RPC endpoint
5. Add React Query devtools to inspect cache

---

## Monitoring Checklist

After deployment, monitor:
- [ ] Withdrawal success rate (should be >90%)
- [ ] Transaction history page views (should show real data)
- [ ] User feedback on approval flow
- [ ] Console error rates
- [ ] RPC performance metrics
- [ ] Contract interaction success rates

---

## Contact

If you encounter issues during testing:
1. Check browser console first
2. Verify wallet connection and network
3. Try different browser/incognito mode
4. Clear cache and hard refresh
5. Report with detailed logs and screenshots
