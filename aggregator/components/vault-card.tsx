"use client"

import { VaultType } from "@/lib/types"
import { VAULT_CONFIGS, VAULT_COLORS, RISK_COLORS } from "@/lib/constants"
import { TrendingUp, Shield, Zap, DollarSign, Clock } from "lucide-react"
import { BatchCountdown } from "./batch-countdown"

import { useAccount } from "wagmi"
import {
  useVaultTotalAssets,
  useTotalPendingDeposits,
  useTotalPendingWithdraws,
  useVaultAPY,
  useUserVaultShares,
  useFormatTokenAmount,
  useVaultAddress
} from "@/hooks/useContracts"
import { formatUnits } from "viem"

interface VaultCardProps {
  vaultType: VaultType
  onDeposit?: () => void
}

export function VaultCard({ vaultType, onDeposit }: VaultCardProps) {
  const { address } = useAccount()
  const { formatAmount } = useFormatTokenAmount()

  const { data: vaultAddress } = useVaultAddress(vaultType)
  const { data: totalAssets } = useVaultTotalAssets(vaultAddress)
  const { data: pendingDeposits } = useTotalPendingDeposits(vaultType)
  const { data: pendingWithdraws } = useTotalPendingWithdraws(vaultType)
  const { data: apy } = useVaultAPY(vaultType)
  const { data: userShares } = useUserVaultShares(address, vaultAddress)

  console.log(`[VaultCard] ${vaultType}:`, {
    vaultAddress,
    totalAssets: totalAssets?.toString()
  })

  // Format values
  const totalDeposited = totalAssets ? parseFloat(formatUnits(totalAssets, 6)) : 0
  const pendingDepositAmount = pendingDeposits ? parseFloat(formatUnits(pendingDeposits, 6)) : 0
  const pendingWithdrawAmount = pendingWithdraws ? parseFloat(formatUnits(pendingWithdraws, 6)) : 0
  const currentAPY = apy ? parseFloat(formatUnits(apy, 18)) : 0
  const userDeposit = userShares ? parseFloat(formatUnits(userShares, 6)) : 0
  const config = VAULT_CONFIGS[vaultType]
  const vaultColor = VAULT_COLORS[vaultType]
  const riskColor = RISK_COLORS[config.riskLevel]

  const displayAPY = currentAPY || (config.targetAPY.min + config.targetAPY.max) / 2

  const getVaultIcon = () => {
    switch (vaultType) {
      case VaultType.CONSERVATIVE:
        return <Shield className="w-6 h-6" />
      case VaultType.BALANCED:
        return <TrendingUp className="w-6 h-6" />
      case VaultType.AGGRESSIVE:
        return <Zap className="w-6 h-6" />
    }
  }

  const getGradientClass = () => {
    switch (vaultColor) {
      case "emerald":
        return "from-emerald-500 to-teal-500"
      case "cyan":
        return "from-cyan-500 to-blue-500"
      case "orange":
        return "from-orange-500 to-red-500"
    }
  }

  return (
    <div
      className="rounded-3xl backdrop-blur-xl p-6 hover:border-white/20 transition-all duration-300 group"
      style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientClass()} flex items-center justify-center text-white shadow-lg`}>
            {getVaultIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-sans">{config.name}</h3>
            <div className="flex gap-2 items-center">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${riskColor} bg-${vaultColor}-400/10 border-${vaultColor}-400/30`}>
                {config.riskLevel} Risk
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {vaultAddress?.slice(0, 6)}...{vaultAddress?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-white/60 mb-6 leading-relaxed">{config.description}</p>

      {/* APY Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-white font-mono">{displayAPY.toFixed(2)}%</span>
          <span className="text-sm text-white/40">Current APY</span>
        </div>
        <div className="text-xs text-white/40">
          Target: {config.targetAPY.min}% - {config.targetAPY.max}%
        </div>
      </div>

      {/* Protocol Allocation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/60 font-medium">Protocol Allocation</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Aave V3</span>
            <span className="text-white font-mono">{config.allocation.aave}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${config.allocation.aave}%` }} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Compound V3</span>
            <span className="text-white font-mono">{config.allocation.compound}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${config.allocation.compound}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
          <div className="text-xs text-white/50 mb-1">Pending Withdraw Batch</div>
          <div className="text-base font-bold text-white font-mono">${pendingWithdrawAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
          <div className="text-xs text-emerald-400/70 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Deposit Batch
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">${pendingDepositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="rounded-xl p-3" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
          <div className="text-xs text-white/50 mb-1">Total Assets</div>
          <div className="text-base font-bold text-white font-mono">${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {userDeposit > 0 && (
        <div className="mb-4">
          <div className="rounded-xl p-3" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
            <div className="text-xs text-white/50 mb-1">Your Total Deposit</div>
            <div className="text-base font-bold text-white font-mono">${userDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      )}

      {/* Batch Countdown */}
      <div className="mb-6 p-3 rounded-xl" style={{ background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
        <BatchCountdown variant="compact" showIcon={true} className="justify-center" />
      </div>

      {/* Action Button */}
      <button
        onClick={onDeposit}
        className={`w-full py-3 rounded-xl bg-gradient-to-r from-${vaultColor}-500/10 to-${vaultColor}-400/10 border border-${vaultColor}-500/20 text-${vaultColor}-400 font-medium transition-all duration-300 hover:from-${vaultColor}-500/20 hover:to-${vaultColor}-400/20 hover:border-${vaultColor}-500/40`}
      >
        <div className="flex items-center justify-center gap-2">
          {/* <DollarSign className="w-4 h-4" /> */}
          {userDeposit > 0 ? "Details" : "Details"}
        </div>
      </button>
    </div>
  )
}
