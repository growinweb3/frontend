"use client"

import { VaultType } from "@/lib/types"
import { BatchCountdown } from "./batch-countdown"
import { useUserBalances, useFormatTokenAmount } from "@/hooks/useContracts"
import { useAccount } from "wagmi"
import { VAULT_CONFIGS } from "@/lib/constants"

const VAULT_RISK_SCORES = {
  [VaultType.CONSERVATIVE]: 2,
  [VaultType.BALANCED]: 3,
  [VaultType.AGGRESSIVE]: 4,
}

const getBarColor = (percentage: number, index: number) => {
  const colors = ["from-emerald-500 to-emerald-400", "from-cyan-500 to-cyan-400", "from-orange-500 to-orange-400"]
  return colors[index % colors.length]
}

export function PortfolioDistribution() {
  const { address } = useAccount()
  const userBalances = useUserBalances(address)
  const { formatAmount } = useFormatTokenAmount()

  // Calculate total portfolio value
  const totalValue = userBalances?.reduce((sum, { vaultBalance }) =>
    sum + (vaultBalance ? parseFloat(formatAmount(vaultBalance, 6)) : 0), 0
  ) || 0

  // Build distributions from real data
  const distributions = userBalances?.map(({ asset, vaultBalance }, index) => {
    const balance = vaultBalance ? parseFloat(formatAmount(vaultBalance, 6)) : 0
    const percentage = totalValue > 0 ? (balance / totalValue) * 100 : 0
    const vaultTypes = [VaultType.CONSERVATIVE, VaultType.BALANCED, VaultType.AGGRESSIVE]
    const vaultType = vaultTypes[index % 3]
    const config = VAULT_CONFIGS[vaultType]

    return {
      token: asset.symbol,
      vault: config.name,
      vaultType,
      amount: `$${balance.toFixed(2)}`,
      percentage: Math.round(percentage),
      apy: `${((config.targetAPY.min + config.targetAPY.max) / 2).toFixed(1)}%`,
      risk: VAULT_RISK_SCORES[vaultType],
    }
  }).filter(d => parseFloat(d.amount.slice(1)) > 0) || [] // Only show non-zero positions

  // Show placeholder if no positions
  if (distributions.length === 0) {
    return (
      <div
        className="h-full rounded-3xl backdrop-blur-xl p-6 hover:border-white/15 transition-all duration-300"
        style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold font-sans text-white">Portfolio Distribution</h2>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <BatchCountdown variant="compact" showIcon={true} />
          </div>
        </div>
        <div className="flex items-center justify-center h-32 text-white/40">
          <p>No active positions. Deposit to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full rounded-3xl backdrop-blur-xl p-6 hover:border-white/15 transition-all duration-300"
      style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold font-sans text-white">Portfolio Distribution</h2>
        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <BatchCountdown variant="compact" showIcon={true} />
        </div>
      </div>

      <div className="space-y-4">
        {distributions.map((item, index) => (
          <div key={`${item.vault}-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{item.token}</span>
                <span className="text-white/30 text-sm">{item.vault}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-[10px] font-medium">
                  Risk: {item.risk}/10
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-white">{item.amount}</span>
                <span className="text-white/40 text-sm ml-2">{item.percentage}%</span>
                <span className="text-emerald-400 text-sm ml-2">APY {item.apy}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getBarColor(item.percentage, index)} transition-all duration-700`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
