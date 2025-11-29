import { useCallback } from 'react'
import { useReadContract, useReadContracts, useAccount, usePublicClient } from 'wagmi'
import { formatUnits, parseAbiItem } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { CONTRACTS, ROUTER_ABI, VAULT_ABI, USDC_ABI, STRATEGY_ABI, SUPPORTED_ASSETS } from '@/lib/contracts'
import { vaultTypeToRiskLevel } from '@/lib/utils'

// ============================================
// ROUTER HOOKS
// ============================================

export function usePendingDeposit(userAddress?: `0x${string}`, vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0

  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'getPendingDeposit',
    args: userAddress ? [userAddress, riskLevel] : undefined,
    query: {
      enabled: !!userAddress && !!vaultType,
      refetchInterval: 10_000,
    },
  })
}

export function usePendingWithdraw(userAddress?: `0x${string}`, vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0

  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'getPendingWithdraw',
    args: userAddress ? [userAddress, riskLevel] : undefined,
    query: {
      enabled: !!userAddress && !!vaultType,
      refetchInterval: 10_000,
    },
  })
}

export function useNextBatchTime(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0

  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'getNextBatchTime',
    args: [riskLevel],
    query: {
      enabled: !!vaultType,
      refetchInterval: 60_000,
    },
  })
}

export function useIsBatchReady(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0

  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'isBatchReady',
    args: [riskLevel],
    query: {
      enabled: !!vaultType,
      refetchInterval: 30_000,
    },
  })
}

export function useClaimableShares(userAddress?: `0x${string}`, vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0

  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'claimableShares',
    args: userAddress ? [userAddress, riskLevel] : undefined,
    query: {
      enabled: !!userAddress && !!vaultType,
      refetchInterval: 10_000,
    },
  })
}

export function useClaimableUSDC(userAddress?: `0x${string}`, vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0

  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'claimableUSDC',
    args: userAddress ? [userAddress, riskLevel] : undefined,
    query: {
      enabled: !!userAddress && !!vaultType,
      refetchInterval: 10_000,
    },
  })
}

export function useBatchInterval() {
  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'batchInterval',
    query: {
      staleTime: Infinity,
    },
  })
}

export function useMinDepositAmount() {
  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'minDepositAmount',
    query: {
      staleTime: Infinity,
    },
  })
}

export function useTotalPendingDeposits(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0

  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'totalPendingDeposits',
    args: [riskLevel],
    scopeKey: vaultType,
    query: {
      enabled: !!vaultType,
      refetchInterval: 10_000,
    },
  })
}

export function useTotalPendingWithdraws(vaultType?: string) {
  const riskLevel = vaultType ? vaultTypeToRiskLevel(vaultType) : 0

  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'totalPendingWithdraws',
    args: [riskLevel],
    scopeKey: vaultType,
    query: {
      enabled: !!vaultType,
      refetchInterval: 10_000,
    },
  })
}

export function useUSDCAddress() {
  return useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'usdc',
    query: {
      staleTime: Infinity,
    },
  })
}

// ============================================
// VAULT & STRATEGY HOOKS
// ============================================

export function useVaultAddress(vaultType?: string) {
  // Map vaultType to hardcoded addresses from CONTRACTS
  // Handle both string literals and VaultType enum values
  let address: `0x${string}` | undefined
  
  // Normalize to lowercase for comparison to handle both enum and string
  const normalizedType = vaultType?.toLowerCase()
  
  if (normalizedType === 'conservative') address = CONTRACTS.VAULT_CONSERVATIVE as `0x${string}`
  else if (normalizedType === 'balanced') address = CONTRACTS.VAULT_BALANCED as `0x${string}`
  else if (normalizedType === 'aggressive') address = CONTRACTS.VAULT_AGGRESSIVE as `0x${string}`

  // Debug logging
  console.log('[useVaultAddress]', {
    input: vaultType,
    normalized: normalizedType,
    output: address,
    typeOf: typeof vaultType
  })

  return {
    data: address,
    isLoading: false,
    refetch: () => { },
  }
}

// Get user's share balance in the vault
export function useUserVaultShares(userAddress?: `0x${string}`, vaultAddress?: `0x${string}`, vaultType?: string) {
  return useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    scopeKey: `userVaultShares-${vaultType || vaultAddress}`,
    query: {
      enabled: !!userAddress && !!vaultAddress,
      refetchInterval: 10_000,
    },
  })
}

// Get Vault Total Assets (TVL)
export function useVaultTotalAssets(vaultAddress?: `0x${string}`, vaultType?: string) {
  return useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'totalAssets',
    scopeKey: `vaultTotalAssets-${vaultType || vaultAddress}`,
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 10_000,
    },
  })
}

// Get Vault Share Price
export function useVaultSharePrice(vaultAddress?: `0x${string}`, vaultType?: string) {
  return useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'sharePrice',
    scopeKey: `vaultSharePrice-${vaultType || vaultAddress}`,
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 10_000,
    },
  })
}

// Get Strategy Address from Vault (assuming index 0 for MVP)
export function useStrategyAddress(vaultAddress?: `0x${string}`, vaultType?: string) {
  return useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'strategies',
    args: [BigInt(0)],
    scopeKey: `strategyAddress-${vaultType || vaultAddress}`,
    query: {
      enabled: !!vaultAddress,
      staleTime: Infinity,
    },
  })
}

// Get APY from Strategy
export function useStrategyAPY(strategyAddress?: `0x${string}`, vaultType?: string) {
  return useReadContract({
    address: strategyAddress,
    abi: STRATEGY_ABI,
    functionName: 'getAPY',
    scopeKey: `strategyAPY-${vaultType || strategyAddress}`,
    query: {
      enabled: !!strategyAddress,
      refetchInterval: 10_000,
    },
  })
}

// Helper to get APY for a vault type (chains calls: Vault -> Strategy -> APY)
export function useVaultAPY(vaultType?: string) {
  const { data: vaultAddress } = useVaultAddress(vaultType)
  const { data: strategyAddress } = useStrategyAddress(vaultAddress, vaultType)
  return useStrategyAPY(strategyAddress, vaultType)
}

// Hook to calculate Weighted APY based on assets in each strategy
export function useVaultWeightedAPY(vaultType?: string) {
  const { data: vaultAddress } = useVaultAddress(vaultType)

  // 1. Get Vault Total Assets
  const { data: totalAssets } = useVaultTotalAssets(vaultAddress, vaultType)

  // 2. Get Strategy Addresses - use individual calls with proper scopeKey
  const { data: strat0Addr } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'strategies',
    args: [BigInt(0)],
    scopeKey: `strategy0-${vaultType || vaultAddress}`,
    query: {
      enabled: !!vaultAddress
    }
  })
  
  console.log(`[Strategy0 Hook] ${vaultType}:`, {
    scopeKey: `strategy0-${vaultType || vaultAddress}`,
    vaultAddress,
    result: strat0Addr
  })

  const { data: strat1Addr } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'strategies',
    args: [BigInt(1)],
    scopeKey: `strategy1-${vaultType || vaultAddress}`,
    query: {
      enabled: !!vaultAddress
    }
  })
  
  console.log(`[Strategy1 Hook] ${vaultType}:`, {
    scopeKey: `strategy1-${vaultType || vaultAddress}`,
    vaultAddress,
    result: strat1Addr
  })

  // 3. Get Strategy 0 Data - Include both vaultType AND vaultAddress for unique keys
  const { data: strat0Balance } = useReadContract({
    address: strat0Addr as `0x${string}` | undefined,
    abi: STRATEGY_ABI,
    functionName: 'balanceOf',
    scopeKey: `strat0Balance-${vaultType}-${vaultAddress}`,
    query: {
      enabled: !!strat0Addr && !!vaultAddress,
      refetchInterval: 10_000
    }
  })

  const { data: strat0APY } = useReadContract({
    address: strat0Addr as `0x${string}` | undefined,
    abi: STRATEGY_ABI,
    functionName: 'getAPY',
    scopeKey: `strat0APY-${vaultType}-${vaultAddress}`,
    query: {
      enabled: !!strat0Addr && !!vaultAddress,
      refetchInterval: 10_000
    }
  })

  // 4. Get Strategy 1 Data - Include both vaultType AND vaultAddress for unique keys
  const { data: strat1Balance } = useReadContract({
    address: strat1Addr as `0x${string}` | undefined,
    abi: STRATEGY_ABI,
    functionName: 'balanceOf',
    scopeKey: `strat1Balance-${vaultType}-${vaultAddress}`,
    query: {
      enabled: !!strat1Addr && !!vaultAddress,
      refetchInterval: 10_000
    }
  })

  const { data: strat1APY } = useReadContract({
    address: strat1Addr as `0x${string}` | undefined,
    abi: STRATEGY_ABI,
    functionName: 'getAPY',
    scopeKey: `strat1APY-${vaultType}-${vaultAddress}`,
    query: {
      enabled: !!strat1Addr && !!vaultAddress,
      refetchInterval: 10_000
    }
  })

  // 5. Calculate Weighted APY
  if (!totalAssets || totalAssets === BigInt(0)) return { data: BigInt(0), isLoading: false }

  // DEBUG LOGGING - Enhanced diagnostics
  console.group(`🔍 [useVaultWeightedAPY] ${vaultType}`)
  console.log('📍 Vault Info:', {
    vaultType,
    vaultAddress,
    expectedAddress: vaultType?.toLowerCase() === 'conservative' ? '0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c' :
                     vaultType?.toLowerCase() === 'balanced' ? '0x21AF332B10481972B903cBd6C3f1ec51546552e7' :
                     vaultType?.toLowerCase() === 'aggressive' ? '0xc4E50772bd6d27661EE12d81e62Daa4882F4E6f4' : 'unknown',
    addressMatch: vaultAddress === (
      vaultType?.toLowerCase() === 'conservative' ? '0x6E69Ed7A9b7F4b1De965328738b3d7Bb757Ea94c' :
      vaultType?.toLowerCase() === 'balanced' ? '0x21AF332B10481972B903cBd6C3f1ec51546552e7' :
      vaultType?.toLowerCase() === 'aggressive' ? '0xc4E50772bd6d27661EE12d81e62Daa4882F4E6f4' : 'unknown'
    )
  })
  console.log('🎯 Strategy Addresses:', {
    strat0Addr,
    strat1Addr,
    scopeKeys: {
      strat0: `strategy0-${vaultType || vaultAddress}`,
      strat1: `strategy1-${vaultType || vaultAddress}`
    }
  })
  console.log('💰 Strategy Data:', {
    strat0Balance: strat0Balance?.toString(),
    strat0APY: strat0APY?.toString(),
    strat1Balance: strat1Balance?.toString(),
    strat1APY: strat1APY?.toString(),
    totalAssets: totalAssets?.toString()
  })
  console.log('🔑 ScopeKeys Used:', {
    strategy0: `strategy0-${vaultType || vaultAddress}`,
    strategy1: `strategy1-${vaultType || vaultAddress}`,
    strat0Balance: `strat0Balance-${vaultType}-${vaultAddress}`,
    strat0APY: `strat0APY-${vaultType}-${vaultAddress}`,
    strat1Balance: `strat1Balance-${vaultType}-${vaultAddress}`,
    strat1APY: `strat1APY-${vaultType}-${vaultAddress}`
  })
  console.groupEnd()

  let totalWeightedScore = BigInt(0)

  // Strategy 0
  if (strat0Balance && strat0APY) {
    totalWeightedScore += (strat0Balance as bigint) * (strat0APY as bigint)
  }

  // Strategy 1
  if (strat1Balance && strat1APY) {
    totalWeightedScore += (strat1Balance as bigint) * (strat1APY as bigint)
  }

  // Idle assets (assume 0% APY)
  // No need to add to score since APY is 0

  const weightedAPY_BPS = totalAssets > BigInt(0) ? totalWeightedScore / totalAssets : BigInt(0)

  // Convert BPS to 1e18 scale for frontend compatibility
  // 1 BPS = 0.01% = 0.0001
  // We want 500 BPS (5%) to become 5 * 1e18 (so formatUnits(x, 18) = 5)
  // 500 * 10^16 = 5 * 10^18
  const result = weightedAPY_BPS * BigInt(10 ** 16)

  return {
    data: result,
    isLoading: false
  }
}

// Hook to get user's claimable assets (Shares & USDC) for all vaults
export function useUserClaimableAssets(userAddress?: `0x${string}`) {
  const vaultTypes = ['conservative', 'balanced', 'aggressive']
  const vaultAddresses = [
    CONTRACTS.VAULT_CONSERVATIVE,
    CONTRACTS.VAULT_BALANCED,
    CONTRACTS.VAULT_AGGRESSIVE
  ] as const

  // 1. Fetch Claimable Shares
  const { data: claimableShares } = useReadContracts({
    contracts: vaultTypes.map(type => ({
      address: CONTRACTS.ROUTER as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'claimableShares',
      args: userAddress ? [userAddress, vaultTypeToRiskLevel(type)] : undefined,
    })),
    query: {
      enabled: !!userAddress,
      refetchInterval: 10_000,
    }
  })

  // 2. Fetch Claimable USDC
  const { data: claimableUSDC } = useReadContracts({
    contracts: vaultTypes.map(type => ({
      address: CONTRACTS.ROUTER as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'claimableUSDC',
      args: userAddress ? [userAddress, vaultTypeToRiskLevel(type)] : undefined,
    })),
    query: {
      enabled: !!userAddress,
      refetchInterval: 10_000,
    }
  })

  return vaultTypes.map((type, index) => {
    return {
      asset: {
        ...SUPPORTED_ASSETS[0],
        symbol: 'USDC',
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Vault`,
        address: vaultAddresses[index],
      },
      claimableShares: claimableShares?.[index]?.result as bigint | undefined,
      claimableUSDC: claimableUSDC?.[index]?.result as bigint | undefined,
      vaultType: type
    }
  })
}

// ============================================
// TOKEN HOOKS
// ============================================

export function useTokenBalance(tokenAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!userAddress,
      refetchInterval: 10_000,
    },
  })
}

export function useTokenAllowance(tokenAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, CONTRACTS.ROUTER as `0x${string}`] : undefined,
    query: {
      enabled: !!tokenAddress && !!userAddress,
      refetchInterval: 10_000,
    },
  })
}

// ============================================
// UTILITY HOOKS
// ============================================

export function useFormatTokenAmount() {
  const formatAmount = useCallback((amount: bigint | undefined, decimals: number = 6, displayDecimals: number = 2) => {
    if (amount === undefined || amount === null) return '0'
    return Number(formatUnits(amount, decimals)).toFixed(displayDecimals)
  }, [])

  return { formatAmount }
}

// Legacy hook for backward compatibility (maps to vault shares)
export function useUserBalance(userAddress?: `0x${string}`, assetAddress?: `0x${string}`) {
  // This is tricky because assetAddress could be USDC or a Vault address
  // For now, we'll assume it's used for Vault Shares in the context of VaultInteraction
  return useReadContract({
    address: assetAddress,
    abi: VAULT_ABI, // Try Vault ABI first (balanceOf is same for ERC20)
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!assetAddress,
    },
  })
}

// Legacy hook for APY (maps to useVaultAPY)
export function useAssetAPY(assetAddress?: `0x${string}`) {
  // Try to find which vault this asset address belongs to
  let vaultType: string | undefined
  if (assetAddress === CONTRACTS.VAULT_CONSERVATIVE) vaultType = 'conservative'
  else if (assetAddress === CONTRACTS.VAULT_BALANCED) vaultType = 'balanced'
  else if (assetAddress === CONTRACTS.VAULT_AGGRESSIVE) vaultType = 'aggressive'

  return useVaultAPY(vaultType)
}

// Hook to get all user balances for the 3 vaults
export function useUserBalances(userAddress?: `0x${string}`) {
  const vaultTypes = ['conservative', 'balanced', 'aggressive']
  const vaultAddresses = [
    CONTRACTS.VAULT_CONSERVATIVE,
    CONTRACTS.VAULT_BALANCED,
    CONTRACTS.VAULT_AGGRESSIVE
  ] as const
  const vaultSymbols = ['cvUSDC', 'bvUSDC', 'avUSDC']

  // Fetch vault shares for all 3 vaults
  const { data: vaultBalances } = useReadContracts({
    contracts: vaultAddresses.map(address => ({
      address,
      abi: VAULT_ABI,
      functionName: 'balanceOf',
      args: userAddress ? [userAddress] : undefined,
    })),
    query: {
      enabled: !!userAddress,
      refetchInterval: 10_000,
    }
  })

  // Fetch USDC balance (same for all)
  const { data: tokenBalance } = useTokenBalance(CONTRACTS.MOCK_USDC as `0x${string}`, userAddress)

  // Map results to the format expected by DashboardStats
  // Note: DashboardStats expects 'asset' object. We'll use SUPPORTED_ASSETS[0] (USDC) as base
  // but we really should be returning vault-specific info.
  // However, existing components rely on this structure.

  return vaultTypes.map((type, index) => {
    return {
      asset: {
        ...SUPPORTED_ASSETS[0], // Base it on USDC
        symbol: vaultSymbols[index], // The underlying asset
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Vault`, // Custom name for display
        address: vaultAddresses[index], // The vault address
      },
      vaultBalance: vaultBalances?.[index]?.result as bigint | undefined,
      tokenBalance: tokenBalance, // User's USDC wallet balance
      vaultType: type
    }
  })
}

// Hook to get user's total portfolio value (sum of all vault shares)
export function usePortfolioValue(userAddress?: `0x${string}`) {
  const balances = useUserBalances(userAddress)

  const totalValue = balances.reduce((sum, item) => {
    return sum + (item.vaultBalance || BigInt(0))
  }, BigInt(0))

  return {
    data: totalValue,
    isLoading: false, // Simplified
    refetch: () => { }
  }
}

// Hook to get total value locked across all vaults
export function useTotalValueLocked() {
  const vaultAddresses = [
    CONTRACTS.VAULT_CONSERVATIVE,
    CONTRACTS.VAULT_BALANCED,
    CONTRACTS.VAULT_AGGRESSIVE
  ] as const

  const { data: totalAssets } = useReadContracts({
    contracts: vaultAddresses.map(address => ({
      address,
      abi: VAULT_ABI,
      functionName: 'totalAssets',
    })),
    query: {
      refetchInterval: 30_000,
    }
  })

  const total = totalAssets?.reduce((sum, item) => {
    return sum + (item.result as bigint || BigInt(0))
  }, BigInt(0))

  return {
    data: total || BigInt(0),
    isLoading: !totalAssets,
    refetch: () => { }
  }
}

// Hook to get vault fund distribution (Strategies + Idle)
export function useVaultStrategyDistribution(vaultAddress?: `0x${string}`) {
  // 1. Fetch Total Assets and Strategy Addresses (checking up to 2 strategies)
  const { data: vaultData, isLoading: isLoadingVault } = useReadContracts({
    contracts: [
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'totalAssets',
      },
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'strategies',
        args: [BigInt(0)],
      },
      {
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'strategies',
        args: [BigInt(1)],
      },
    ],
    scopeKey: `distribution-${vaultAddress}`,
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 10_000,
    }
  })

  const totalAssets = vaultData?.[0]?.status === 'success' ? (vaultData[0].result as bigint) : BigInt(0)
  const strategy0Address = vaultData?.[1]?.status === 'success' ? (vaultData[1].result as `0x${string}`) : undefined
  const strategy1Address = vaultData?.[2]?.status === 'success' ? (vaultData[2].result as `0x${string}`) : undefined

  // 2. Fetch Strategy Details
  const { data: strategyData, isLoading: isLoadingStrategies } = useReadContracts({
    contracts: [
      {
        address: strategy0Address,
        abi: STRATEGY_ABI,
        functionName: 'balanceOf',
      },
      {
        address: strategy0Address,
        abi: STRATEGY_ABI,
        functionName: 'protocol',
      },
      {
        address: strategy1Address,
        abi: STRATEGY_ABI,
        functionName: 'balanceOf',
      },
      {
        address: strategy1Address,
        abi: STRATEGY_ABI,
        functionName: 'protocol',
      },
    ],
    scopeKey: `strategies-${vaultAddress}`,
    query: {
      enabled: !!strategy0Address || !!strategy1Address,
      refetchInterval: 10_000,
    }
  })

  // Helper to identify protocol name
  const getProtocolName = (protocolAddress?: string) => {
    if (!protocolAddress) return 'Unknown'
    if (protocolAddress.toLowerCase() === CONTRACTS.MOCK_PROTOCOL_AAVE.toLowerCase()) return 'Aave'
    if (protocolAddress.toLowerCase() === CONTRACTS.MOCK_PROTOCOL_COMPOUND.toLowerCase()) return 'Compound'
    return 'Unknown Protocol'
  }

  // Process results
  const strategies: { name: string, address?: string, balance: bigint, percentage: number }[] = []
  let totalDeployed = BigInt(0)

  // Strategy 0
  if (strategy0Address && strategyData?.[0]?.status === 'success') {
    const balance = strategyData[0].result as bigint
    const protocol = strategyData?.[1]?.status === 'success' ? (strategyData[1].result as string) : undefined

    if (balance > BigInt(0)) {
      strategies.push({
        name: getProtocolName(protocol),
        address: strategy0Address,
        balance: balance,
        percentage: totalAssets > BigInt(0) ? Number((balance * BigInt(10000)) / totalAssets) / 100 : 0
      })
      totalDeployed += balance
    }
  }

  // Strategy 1
  if (strategy1Address && strategyData?.[2]?.status === 'success') {
    const balance = strategyData[2].result as bigint
    const protocol = strategyData?.[3]?.status === 'success' ? (strategyData[3].result as string) : undefined

    if (balance > BigInt(0)) {
      strategies.push({
        name: getProtocolName(protocol),
        address: strategy1Address,
        balance: balance,
        percentage: totalAssets > BigInt(0) ? Number((balance * BigInt(10000)) / totalAssets) / 100 : 0
      })
      totalDeployed += balance
    }
  }

  return {
    data: strategies,
    totalAssets,
    isLoading: isLoadingVault || (!!(strategy0Address || strategy1Address) && isLoadingStrategies),
    refetch: () => { }
  }
}

// ============================================
// HISTORY HOOKS
// ============================================

export type TransactionType = 'Deposit' | 'Withdraw' | 'Claim Shares' | 'Claim USDC'

export interface TransactionHistoryItem {
  type: TransactionType
  amount: string
  timestamp: number // ms
  hash: string
  status: 'Completed' | 'Pending'
  riskLevel: string
}

export function useTransactionHistory(userAddress?: `0x${string}`) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ['transactionHistory', userAddress],
    queryFn: async () => {
      if (!userAddress || !publicClient) return []

      // Define events
      const depositEvent = parseAbiItem('event DepositQueued(address indexed user, uint8 indexed riskLevel, uint256 amount, uint256 nextBatchTime)')
      const withdrawEvent = parseAbiItem('event WithdrawQueued(address indexed user, uint8 indexed riskLevel, uint256 shares, uint256 nextBatchTime)')
      const claimSharesEvent = parseAbiItem('event DepositClaimed(address indexed user, uint8 indexed riskLevel, uint256 shares)')
      const claimUSDCEvent = parseAbiItem('event WithdrawClaimed(address indexed user, uint8 indexed riskLevel, uint256 assets)')

      // Fetch logs in parallel
      const [deposits, withdraws, claimedShares, claimedUSDC] = await Promise.all([
        publicClient.getLogs({
          address: CONTRACTS.ROUTER as `0x${string}`,
          event: depositEvent,
          args: { user: userAddress },
          fromBlock: 'earliest'
        }),
        publicClient.getLogs({
          address: CONTRACTS.ROUTER as `0x${string}`,
          event: withdrawEvent,
          args: { user: userAddress },
          fromBlock: 'earliest'
        }),
        publicClient.getLogs({
          address: CONTRACTS.ROUTER as `0x${string}`,
          event: claimSharesEvent,
          args: { user: userAddress },
          fromBlock: 'earliest'
        }),
        publicClient.getLogs({
          address: CONTRACTS.ROUTER as `0x${string}`,
          event: claimUSDCEvent,
          args: { user: userAddress },
          fromBlock: 'earliest'
        })
      ])

      // Combine and format
      const allLogs = [
        ...deposits.map(log => ({ ...log, type: 'Deposit' as TransactionType, amount: log.args.amount, risk: log.args.riskLevel })),
        ...withdraws.map(log => ({ ...log, type: 'Withdraw' as TransactionType, amount: log.args.shares, risk: log.args.riskLevel })),
        ...claimedShares.map(log => ({ ...log, type: 'Claim Shares' as TransactionType, amount: log.args.shares, risk: log.args.riskLevel })),
        ...claimedUSDC.map(log => ({ ...log, type: 'Claim USDC' as TransactionType, amount: log.args.assets, risk: log.args.riskLevel }))
      ]

      // Sort by block number descending
      allLogs.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))

      // Take top 8
      const recentLogs = allLogs.slice(0, 8)

      // Fetch timestamps for these blocks
      const historyItems = await Promise.all(recentLogs.map(async (log) => {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber })

        const riskMap = ['Conservative', 'Balanced', 'Aggressive']
        const riskLevel = riskMap[log.risk || 0] || 'Unknown'

        return {
          type: log.type,
          amount: formatUnits(log.amount || BigInt(0), 6), // Assuming 6 decimals for USDC and Shares (usually 18 but let's stick to 6 for simplicity or check vault decimals)
          // Note: Vault shares usually 18 decimals, USDC 6. 
          // For MVP let's assume 6 for USDC and 18 for Shares? 
          // Actually Vault shares in this system seem to be 18 decimals usually.
          // Let's check: Vault is ERC4626, usually 18. USDC is 6.
          // Adjusting:
          // Deposit: USDC (6)
          // Withdraw: Shares (18) -> Wait, withdraw input is shares.
          // Claim Shares: Shares (18)
          // Claim USDC: USDC (6)

          // Refined formatting:
          formattedAmount: (log.type === 'Deposit' || log.type === 'Claim USDC')
            ? formatUnits(log.amount || BigInt(0), 6)
            : formatUnits(log.amount || BigInt(0), 18),

          timestamp: Number(block.timestamp) * 1000,
          hash: log.transactionHash,
          status: 'Completed' as const,
          riskLevel
        }
      }))

      return historyItems.map(item => ({
        ...item,
        amount: item.formattedAmount // Remap to match interface
      }))
    },
    enabled: !!userAddress && !!publicClient,
    staleTime: 30_000
  })
}