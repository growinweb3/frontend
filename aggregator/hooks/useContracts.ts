import { useCallback } from 'react'
import { useReadContract, useReadContracts, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
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
    query: {
      enabled: !!vaultType,
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
    query: {
      enabled: !!vaultType,
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
  // This avoids an async call to Router.vaults(riskLevel) but is safer if config is static
  let address: `0x${string}` | undefined

  if (vaultType === 'conservative') address = CONTRACTS.VAULT_CONSERVATIVE as `0x${string}`
  else if (vaultType === 'balanced') address = CONTRACTS.VAULT_BALANCED as `0x${string}`
  else if (vaultType === 'aggressive') address = CONTRACTS.VAULT_AGGRESSIVE as `0x${string}`

  return {
    data: address,
    isLoading: false,
    refetch: () => { },
  }
}

// Get user's share balance in the vault
export function useUserVaultShares(userAddress?: `0x${string}`, vaultAddress?: `0x${string}`) {
  return useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!vaultAddress,
    },
  })
}

// Get Vault Total Assets (TVL)
export function useVaultTotalAssets(vaultAddress?: `0x${string}`) {
  return useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'totalAssets',
    query: {
      enabled: !!vaultAddress,
    },
  })
}

// Get Vault Share Price
export function useVaultSharePrice(vaultAddress?: `0x${string}`) {
  return useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'sharePrice',
    query: {
      enabled: !!vaultAddress,
    },
  })
}

// Get Strategy Address from Vault (assuming index 0 for MVP)
export function useStrategyAddress(vaultAddress?: `0x${string}`) {
  return useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'strategies',
    args: [BigInt(0)],
    query: {
      enabled: !!vaultAddress,
      staleTime: Infinity,
    },
  })
}

// Get APY from Strategy
export function useStrategyAPY(strategyAddress?: `0x${string}`) {
  return useReadContract({
    address: strategyAddress,
    abi: STRATEGY_ABI,
    functionName: 'getAPY',
    query: {
      enabled: !!strategyAddress,
    },
  })
}

// Helper to get APY for a vault type (chains calls: Vault -> Strategy -> APY)
export function useVaultAPY(vaultType?: string) {
  const { data: vaultAddress } = useVaultAddress(vaultType)
  const { data: strategyAddress } = useStrategyAddress(vaultAddress)
  return useStrategyAPY(strategyAddress)
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
        symbol: 'USDC', // The underlying asset
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

  // Calculate Idle
  const idleAmount = totalAssets > totalDeployed ? totalAssets - totalDeployed : BigInt(0)
  if (idleAmount > BigInt(0)) {
    strategies.push({
      name: 'Idle (In Vault)',
      address: vaultAddress,
      balance: idleAmount,
      percentage: totalAssets > BigInt(0) ? Number((idleAmount * BigInt(10000)) / totalAssets) / 100 : 0
    })
  }

  return {
    data: strategies,
    totalAssets,
    isLoading: isLoadingVault || (!!(strategy0Address || strategy1Address) && isLoadingStrategies),
    refetch: () => { }
  }
}