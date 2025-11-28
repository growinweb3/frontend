import { useReadContract } from 'wagmi'
import { useCallback } from 'react'
import { formatUnits } from 'viem'
import { CONTRACTS, ROUTER_ABI, MOCK_USDC_ABI, SUPPORTED_ASSETS } from '@/lib/contracts'
import { vaultTypeToRiskLevel } from '@/lib/utils'

// ============================================
// READ HOOKS - Batch Deposit System Queries
// ============================================

// Hook to get user's pending deposit amount for a vault
export function usePendingDeposit(userAddress?: `0x${string}`, vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'getPendingDeposit',
    args: userAddress ? [userAddress, riskLevel] : undefined,
    query: {
      enabled: Boolean(userAddress && vaultType),
      refetchInterval: 30_000,
    },
  })
}

// Hook to get user's pending withdraw shares for a vault
export function usePendingWithdraw(userAddress?: `0x${string}`, vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'getPendingWithdraw',
    args: userAddress ? [userAddress, riskLevel] : undefined,
    query: {
      enabled: Boolean(userAddress && vaultType),
      refetchInterval: 30_000,
    },
  })
}

// Hook to get next batch execution time for a vault
export function useNextBatchTime(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'getNextBatchTime',
    args: vaultType ? [riskLevel] : undefined,
    query: {
      enabled: Boolean(vaultType),
      refetchInterval: 60_000,
    },
  })
}

// Hook to check if batch is ready for execution
export function useIsBatchReady(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'isBatchReady',
    args: vaultType ? [riskLevel] : undefined,
    query: {
      enabled: Boolean(vaultType),
      refetchInterval: 30_000,
    },
  })
}

// Hook to get user's claimable vault shares after deposit batch execution
export function useClaimableShares(userAddress?: `0x${string}`, vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'claimableShares',
    args: userAddress ? [userAddress, riskLevel] : undefined,
    query: {
      enabled: Boolean(userAddress && vaultType),
      refetchInterval: 30_000,
    },
  })
}

// Hook to get user's claimable USDC after withdraw batch execution
export function useClaimableUSDC(userAddress?: `0x${string}`, vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'claimableUSDC',
    args: userAddress ? [userAddress, riskLevel] : undefined,
    query: {
      enabled: Boolean(userAddress && vaultType),
      refetchInterval: 30_000,
    },
  })
}

// Hook to get batch interval (how often batches execute)
export function useBatchInterval() {
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'batchInterval',
    query: {
      refetchInterval: 5 * 60_000, // Refetch every 5 minutes
    },
  })
}

// Hook to get minimum deposit amount
export function useMinDepositAmount() {
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'minDepositAmount',
    query: {
      refetchInterval: 5 * 60_000,
    },
  })
}

// Hook to get total pending deposits for a vault
export function useTotalPendingDeposits(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'totalPendingDeposits',
    args: vaultType ? [riskLevel] : undefined,
    query: {
      enabled: Boolean(vaultType),
      refetchInterval: 60_000,
    },
  })
}

// Hook to get total pending withdraws for a vault
export function useTotalPendingWithdraws(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'totalPendingWithdraws',
    args: vaultType ? [riskLevel] : undefined,
    query: {
      enabled: Boolean(vaultType),
      refetchInterval: 60_000,
    },
  })
}

// Hook to get vault contract address for a risk level
export function useVaultAddress(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0
  
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'vaults',
    args: vaultType ? [riskLevel] : undefined,
    query: {
      enabled: Boolean(vaultType),
      refetchInterval: 5 * 60_000,
    },
  })
}

// Hook to get USDC contract address from router
export function useUSDCAddress() {
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'usdc',
    query: {
      refetchInterval: 5 * 60_000,
    },
  })
}

// ============================================
// LEGACY READ HOOKS - For Backward Compatibility
// ============================================
// These hooks maintained for components that haven't been updated yet
// They may not work with new contract architecture

// Hook to get user's balance for a specific asset (DEPRECATED - use vault shares instead)
export function useUserBalance(userAddress?: `0x${string}`, assetAddress?: `0x${string}`) {
  // This function is deprecated in the new architecture
  // Vault shares should be queried from vault contracts directly
  // Keeping for backward compatibility
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'getPendingDeposit', // Placeholder - will not work
    args: undefined,
    query: {
      enabled: false, // Disabled
      refetchInterval: 30_000,
    },
  })
}

// Hook to get total value locked across all vaults (DEPRECATED)
export function useTotalValueLocked() {
  // This needs to be recalculated by querying each vault's TVL
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'totalPendingDeposits',
    args: [0], // Placeholder
    query: {
      enabled: false,
      refetchInterval: 60_000,
    },
  })
}

// Hook to get APY for a specific asset (DEPRECATED)
export function useAssetAPY(assetAddress?: `0x${string}`) {
  // APY should be queried from individual vault contracts
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'minDepositAmount', // Placeholder
    args: undefined,
    query: {
      enabled: false,
      refetchInterval: 5 * 60_000,
    },
  })
}

// Hook to get user's portfolio value across all assets (DEPRECATED)
export function usePortfolioValue(userAddress?: `0x${string}`) {
  // Portfolio value needs to be calculated by summing claimable shares/USDC from all vaults
  return useReadContract({
    address: CONTRACTS.ROUTER,
    abi: ROUTER_ABI,
    functionName: 'claimableUSDC',
    args: undefined,
    query: {
      enabled: false,
      refetchInterval: 30_000,
    },
  })
}

// ============================================
// TOKEN HOOKS - ERC20 Interactions
// ============================================

// Hook to get token balance for ERC20 tokens
export function useTokenBalance(tokenAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: Boolean(tokenAddress && userAddress),
      refetchInterval: 30_000,
    },
  })
}

// Hook to get token allowance for spending by Router contract
export function useTokenAllowance(tokenAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, CONTRACTS.ROUTER] : undefined,
    query: {
      enabled: Boolean(tokenAddress && userAddress),
      refetchInterval: 30_000,
    },
  })
}

// ============================================
// UTILITY HOOKS
// ============================================

// Utility hook to format token amounts
export function useFormatTokenAmount() {
  const formatAmount = useCallback((amount: bigint | undefined, decimals: number = 6, displayDecimals: number = 2) => {
    if (!amount) return '0'
    return Number(formatUnits(amount, decimals)).toFixed(displayDecimals)
  }, [])

  return { formatAmount }
}

// Hook to get all user balances for supported assets
export function useUserBalances(userAddress?: `0x${string}`) {
  const balances = SUPPORTED_ASSETS.map(asset => {
    const { data: vaultBalance } = useUserBalance(userAddress, asset.address)
    const { data: tokenBalance } = useTokenBalance(asset.address, userAddress)
    
    return {
      asset,
      vaultBalance,
      tokenBalance,
    }
  })

  return balances
}

// ============================================
// WRITE OPERATIONS MOVED TO WalletContext
// ============================================
// The following operations are now available through useWallet() hook:
// - deposit(params: DepositParams)
// - withdraw(params: WithdrawParams)
// - approveToken(params: ApproveParams)
// - mintTestTokens(tokenAddress, amount)
//
// Import from @/components/Web3Provider:
// import { useWallet } from '@/components/Web3Provider'
// const { deposit, withdraw, approveToken, mintTestTokens, isTransacting } = useWallet()
// ============================================