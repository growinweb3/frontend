# Frontend Integration Brief: Yield Aggregator

Dokumen ini berisi panduan integrasi frontend dengan smart contract untuk project Yield Aggregator.

## Overview Flow
User flow utama dalam aplikasi ini menggunakan sistem **Batching** via `Router`. User tidak berinteraksi langsung dengan `Vault` untuk deposit/withdraw, melainkan melalui `Router` yang akan mengumpulkan transaksi dan mengeksekusinya secara berkala (hemat gas).

## Contracts to Integrate

| Contract | Role | Key Interactions |
|----------|------|------------------|
| **Router** | Main Entry Point | Deposit, Withdraw, Claim, View Pending Status |
| **Vault** | Asset Manager | View TVL, Share Price, User Share Balance |
| **USDC** | Stablecoin | Approve Router |
| **Strategy** | Yield Generator | View APY |

---

## 1. Deposit Flow
Proses deposit dilakukan dalam 2 tahap: **Queue** dan **Claim**.

### Step 1: Queue Deposit
User menyetorkan USDC ke Router untuk antri di batch berikutnya.
1.  **Approve USDC**: User harus approve `Router` untuk membelanjakan USDC mereka.
    *   Contract: `USDC` (ERC20)
    *   Function: `approve(address spender, uint256 amount)`
    *   Spender: `Router Address`
2.  **Deposit**: Panggil fungsi deposit di Router.
    *   Contract: `Router`
    *   Function: `deposit(uint256 amount, RiskLevel riskLevel)`
    *   Params:
        *   `amount`: Jumlah USDC (6 decimals)
        *   `riskLevel`: `0` (Conservative), `1` (Balanced), atau `2` (Aggressive)

### Step 2: Wait for Batch
Backend/Keeper akan mengeksekusi batch setiap `batchInterval` (default 6 jam). Frontend bisa menampilkan status pending.
*   **Check Pending Amount**: `Router.getPendingDeposit(userAddress, riskLevel)`
*   **Check Next Batch Time**: `Router.getNextBatchTime(riskLevel)`

### Step 3: Claim Shares
Setelah batch dieksekusi, user mendapatkan shares (bukti kepemilikan) yang harus di-claim.
*   **Check Claimable Shares**: `Router.claimableShares(userAddress, riskLevel)`
*   **Action**: Jika > 0, user bisa claim.
    *   Contract: `Router`
    *   Function: `claimDepositShares(RiskLevel riskLevel)`

---

## 2. Withdraw Flow
Mirip dengan deposit, withdraw juga menggunakan sistem batch.

### Step 1: Queue Withdraw
User request withdraw shares mereka.
1.  **Approve Vault Shares**: User harus approve `Router` untuk membelanjakan Vault Shares mereka.
    *   Contract: `Vault` (sesuai risk level)
    *   Function: `approve(address spender, uint256 amount)`
    *   Spender: `Router Address`
2.  **Withdraw**: Panggil fungsi withdraw di Router.
    *   Contract: `Router`
    *   Function: `withdraw(uint256 shares, RiskLevel riskLevel)`

### Step 2: Wait for Batch
*   **Check Pending Shares**: `Router.getPendingWithdraw(userAddress, riskLevel)`

### Step 3: Claim Assets
Setelah batch dieksekusi, user bisa claim USDC mereka.
*   **Check Claimable USDC**: `Router.claimableUSDC(userAddress, riskLevel)`
*   **Action**: Jika > 0, user bisa claim.
    *   Contract: `Router`
    *   Function: `claimWithdrawAssets(RiskLevel riskLevel)`

---

## 3. Dashboard Data (View Functions)

### User Stats
*   **Wallet Balance (USDC)**: `USDC.balanceOf(user)`
*   **Vault Balance (Shares)**: `Vault.balanceOf(user)`
*   **Pending Deposit**: `Router.getPendingDeposit(user, riskLevel)`
*   **Pending Withdraw**: `Router.getPendingWithdraw(user, riskLevel)`
*   **Ready to Claim (Shares)**: `Router.claimableShares(user, riskLevel)`
*   **Ready to Claim (USDC)**: `Router.claimableUSDC(user, riskLevel)`

### Protocol Stats
*   **Total Value Locked (TVL)**: `Vault.totalAssets()`
*   **Share Price**: `Vault.sharePrice()` (Base 1e18)
    *   *Note: Gunakan ini untuk menghitung estimasi value user dalam USDC: `(UserShares * SharePrice) / 1e18`*
*   **Current APY**: `Strategy.getAPY()` (Basis Points, e.g., 500 = 5%)
    *   *Note: Perlu loop melalui active strategies di Vault jika ada multiple, tapi untuk MVP biasanya 1 strategy per vault.*

### Batch Info
*   **Next Batch Execution**: `Router.getNextBatchTime(riskLevel)`
*   **Queue Length**: `Router.getDepositUserCount(riskLevel)` / `Router.getWithdrawUserCount(riskLevel)`

---

## Notes for Frontend Dev
1.  **Decimals**:
    *   USDC menggunakan **6 decimals**.
    *   Vault Shares & Calculations internal sering menggunakan **18 decimals**.
    *   Pastikan konversi unit benar (e.g., `ethers.utils.parseUnits` vs `formatUnits`).
2.  **Risk Levels**:
    *   Mapping di frontend harus konsisten:
        *   `0`: Conservative
        *   `1`: Balanced
        *   `2`: Aggressive
3.  **Error Handling**:
    *   Handle error `Vault not set` jika user mencoba interaksi dengan risk level yang belum dikonfigurasi.
    *   Handle error `Amount below minimum` saat deposit.
