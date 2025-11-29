'use client'

import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  usePortfolioValue,
  useTotalValueLocked,
  useUserBalances,
  useFormatTokenAmount
} from '@/hooks/useContracts'
import { TrendingUp, DollarSign, PieChart, Target } from 'lucide-react'
import { SUPPORTED_ASSETS } from '@/lib/contracts'

export function DashboardStats() {
  const { address } = useAccount()
  const { formatAmount } = useFormatTokenAmount()

  // Global stats
  const { data: portfolioValue, isLoading: portfolioLoading } = usePortfolioValue(address)
  const { data: totalValueLocked, isLoading: tvlLoading } = useTotalValueLocked()

  // User balances for each asset
  const userBalances = useUserBalances(address)

  // Calculate total portfolio value in USD (assuming 1:1 for stablecoins)
  const totalPortfolioUSD = userBalances?.reduce((total, { vaultBalance }) => {
    return total + (vaultBalance ? parseFloat(formatAmount(vaultBalance, 6)) : 0)
  }, 0) || 0

  // Calculate weighted average APY (simplified)
  const weightedAPY = 8.5 // This would be calculated based on actual vault APYs

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Total Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {portfolioLoading ? (
                <div className="animate-pulse bg-white/20 h-8 w-20 rounded" />
              ) : (
                `$${totalPortfolioUSD.toFixed(2)}`
              )}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Across all vaults
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Weighted APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {weightedAPY.toFixed(2)}%
            </div>
            <p className="text-xs text-white/50 mt-1">
              Current yield rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Active Vaults</CardTitle>
            <PieChart className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {userBalances?.filter(({ vaultBalance }) =>
                vaultBalance && vaultBalance > BigInt(0)
              ).length || 0}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Of {SUPPORTED_ASSETS.length} available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Protocol TVL</CardTitle>
            <Target className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tvlLoading ? (
                <div className="animate-pulse bg-white/20 h-8 w-20 rounded" />
              ) : (
                `$${formatAmount(totalValueLocked, 6, 0)}`
              )}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Total value locked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Breakdown */}
      {address && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Vault Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userBalances?.map(({ asset, vaultBalance, tokenBalance }) => {
                const hasPosition = vaultBalance && vaultBalance > BigInt(0)
                return (
                  <div key={asset.address} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{asset.symbol[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{asset.name}</h3>
                        <p className="text-white/60 text-sm">{asset.symbol}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-medium">
                          {formatAmount(vaultBalance, asset.decimals)} {asset.symbol}
                        </div>
                        {hasPosition && (
                          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}