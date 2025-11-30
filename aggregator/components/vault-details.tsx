import { useState } from "react"
import { VaultType, Protocol } from "@/lib/types"
import { VAULT_CONFIGS, PROTOCOLS } from "@/lib/constants"
import { X, TrendingUp, AlertCircle, Clock, RefreshCw, ArrowRight, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { BatchCountdown } from "./batch-countdown"
import {
  useVaultAddress,
  useVaultStrategyDistribution,
  useStrategyAPY,
  useTokenBalance,
  useTokenAllowance,
  useMinDepositAmount,
  useFormatTokenAmount,
  useUserVaultShares
} from "@/hooks/useContracts"
import { useWallet } from "@/components/Web3Provider"
import { CONTRACTS } from "@/lib/contracts"
import { parseUnits, formatUnits } from "viem"

interface VaultDetailsProps {
  vaultType: VaultType
  onClose: () => void
}

type Tab = 'deposit' | 'withdraw'

export function VaultDetails({ vaultType, onClose }: VaultDetailsProps) {
  const config = VAULT_CONFIGS[vaultType]
  const aaveInfo = PROTOCOLS[Protocol.AAVE_V3]
  const compoundInfo = PROTOCOLS[Protocol.COMPOUND_V3]

  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const { address, deposit, withdraw, approveToken, isTransacting } = useWallet()
  const { formatAmount } = useFormatTokenAmount()

  // Fetch Vault Address
  const { data: vaultAddress } = useVaultAddress(vaultType)

  // Fetch Strategies to get addresses
  const { data: strategies } = useVaultStrategyDistribution(vaultAddress)

  // Fetch Token Data (USDC)
  const assetAddress = CONTRACTS.MOCK_USDC as `0x${string}`
  const assetDecimals = 6
  const { data: tokenBalance } = useTokenBalance(assetAddress, address)
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(assetAddress, address)
  const { data: vaultBalance } = useUserVaultShares(address, vaultAddress, vaultType)
  const { data: vaultShareAllowance, refetch: refetchVaultAllowance } = useTokenAllowance(vaultAddress, address)
  const { data: minDepositAmount } = useMinDepositAmount()

  // Fetch Vault Share Data
  const { data: shareBalance } = useUserVaultShares(address, vaultAddress, vaultType)
  const { data: sharePrice } = useVaultSharePrice(vaultAddress, vaultType)
  const { data: vaultAllowance, refetch: refetchVaultAllowance } = useTokenAllowance(vaultAddress, address) // Vault shares are ERC20

  // Calculate protocol breakdown based on vault allocation strategy
  const protocolBreakdown = [
    {
      protocol: aaveInfo,
      allocation: config.allocation.aave,
      strategyName: 'Aave',
    },
    {
      protocol: compoundInfo,
      allocation: config.allocation.compound,
      strategyName: 'Compound',
    },
  ]

  // Deposit Logic
  const handleMaxDeposit = () => {
    if (tokenBalance) {
      setAmount(formatUnits(tokenBalance, assetDecimals))
    }
  }

  const handleSmartDeposit = async () => {
    if (!amount || !address) return

    try {
      const depositAmount = parseUnits(amount, assetDecimals)
      const currentAllowance = allowance || BigInt(0)

      // 1. Check if approval is needed
      if (depositAmount > currentAllowance) {
        await approveToken({
          tokenAddress: assetAddress,
          spender: CONTRACTS.ROUTER as `0x${string}`,
          amount: amount,
        })
        await new Promise(resolve => setTimeout(resolve, 2000))
        await refetchAllowance()
      }

      // 2. Proceed with Deposit
      await deposit({
        vaultType,
        amount: depositAmount,
        assetSymbol: "USDC"
      })

      setDepositAmount("")
    } catch (error) {
      console.error("Smart deposit failed:", error)
    }
  }

  // Withdraw Logic
  const handleMaxWithdraw = () => {
    if (vaultBalance) {
      setWithdrawAmount(formatUnits(vaultBalance, assetDecimals))
    }
  }

  const handleSmartWithdraw = async () => {
    if (!withdrawAmount || !address) return

    try {
      const shares = parseUnits(withdrawAmount, assetDecimals)
      const currentVaultAllowance = vaultShareAllowance || BigInt(0)

      // 1. Check if vault share approval is needed
      if (shares > currentVaultAllowance) {
        await approveToken({
          tokenAddress: vaultAddress!,
          spender: CONTRACTS.ROUTER as `0x${string}`,
          amount: shares,
        })
        await new Promise(resolve => setTimeout(resolve, 2000))
        await refetchVaultAllowance()
      }

      // 2. Proceed with Withdrawal
      await withdraw({
        vaultType,
        shares,
        assetSymbol: "USDC"
      })

      setWithdrawAmount("")
    } catch (error) {
      console.error("Smart withdraw failed:", error)
    }
  }

  // Deposit Validation
  const depositAmountBigInt = depositAmount ? parseUnits(depositAmount, assetDecimals) : BigInt(0)
  const hasBalance = tokenBalance ? tokenBalance >= depositAmountBigInt : false
  const isMinMet = minDepositAmount ? depositAmountBigInt >= minDepositAmount : true
  const isDepositValid = depositAmount && parseFloat(depositAmount) > 0 && hasBalance && isMinMet
  const needsDepositApproval = allowance ? depositAmountBigInt > allowance : true

  // Withdraw Validation
  const withdrawAmountBigInt = withdrawAmount ? parseUnits(withdrawAmount, assetDecimals) : BigInt(0)
  const hasShares = vaultBalance ? vaultBalance >= withdrawAmountBigInt : false
  const isWithdrawValid = withdrawAmount && parseFloat(withdrawAmount) > 0 && hasShares
  const needsWithdrawApproval = vaultShareAllowance ? withdrawAmountBigInt > vaultShareAllowance : true

  const getDepositButtonText = () => {
    if (isTransacting) return "Processing..."
    if (!depositAmount) return "Enter Amount"
    if (!hasBalance) return "Insufficient Balance"
    if (!isMinMet) return `Min Deposit ${formatUnits(minDepositAmount || BigInt(0), assetDecimals)} USDC`
    if (needsDepositApproval) return "Approve & Deposit USDC"
    return "Deposit USDC"
  }

  const getWithdrawButtonText = () => {
    if (isTransacting) return "Processing..."
    if (!withdrawAmount) return "Enter Amount"
    if (!hasShares) return "Insufficient Shares"
    if (needsWithdrawApproval) return "Approve & Withdraw"
    return "Withdraw"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-5xl rounded-3xl backdrop-blur-xl p-8 relative max-h-[90vh] overflow-y-auto"
        style={{ background: "rgba(10, 10, 20, 0.95)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{config.name}</h2>
              <p className="text-white/60">{config.description}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl p-4" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                <div className="text-xs text-white/50 mb-1">Risk Level</div>
                <div className="text-lg font-bold text-white">{config.riskLevel}</div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                <div className="text-xs text-white/50 mb-1">Target APY Range</div>
                <div className="text-lg font-bold text-white font-mono">
                  {config.targetAPY.min}%-{config.targetAPY.max}%
                </div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                <div className="text-xs text-white/50 mb-1">Batch Schedule</div>
                <div className="text-lg font-bold text-white">Every {config.batchScheduleHours}h</div>
              </div>
            </div>

            {/* Batch Countdown */}
            <div>
              <div className="rounded-2xl p-6" style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <BatchCountdown variant="large" showIcon={true} className="w-full" />
              </div>
            </div>

            {/* Tabs for Deposit/Withdraw */}
            <div className="space-y-4">
              {/* Tab Buttons */}
              <div className="flex gap-2 p-1 rounded-xl bg-white/5">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'deposit'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'withdraw'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Withdraw
                </button>
              </div>

              {/* Deposit Tab Content */}
              {activeTab === 'deposit' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Deposit Amount</span>
                    <span>Balance: {formatAmount(tokenBalance, assetDecimals)} USDC</span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-20 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <button
                      onClick={handleMaxDeposit}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                    >
                      MAX
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSmartDeposit}
                      disabled={!isDepositValid || isTransacting}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                        ${!isDepositValid || isTransacting
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/20'
                        }`}
                    >
                      {isTransacting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {getDepositButtonText()}
                    </button>
                    <button
                      className="px-6 py-3 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-all duration-300"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Withdraw Tab Content */}
              {activeTab === 'withdraw' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Withdraw Amount</span>
                    <span>Shares: {formatAmount(vaultBalance, assetDecimals)}</span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-20 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <button
                      onClick={handleMaxWithdraw}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    >
                      MAX
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSmartWithdraw}
                      disabled={!isWithdrawValid || isTransacting}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                        ${!isWithdrawValid || isTransacting
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/20'
                        }`}
                    >
                      {isTransacting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {getWithdrawButtonText()}
                    </button>
                    <button
                      className="px-6 py-3 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-all duration-300"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Protocol Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Protocol Allocation
              </h3>
              <div className="space-y-4">
                {protocolBreakdown.map((item) => {
                  // Find the strategy address for this protocol
                  const strategy = strategies?.find(s => s.name === item.strategyName)
                  return (
                    <ProtocolRow
                      key={item.protocol.id}
                      protocol={item.protocol}
                      allocation={item.allocation}
                      strategyAddress={strategy?.address as `0x${string}` | undefined}
                      vaultType={vaultType}
                    />
                  )
                })}
              </div>
            </div>

            {/* Strategy Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Strategy Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-white/70">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                  <div>
                    <div className="font-medium text-white mb-1">Batch Deposit System</div>
                    <div className="mb-2">
                      Your deposits are held in the vault and distributed to protocols every {config.batchScheduleHours} hours.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-white/70">
                  <RefreshCw className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white mb-1">Yield Optimization</div>
                    <div>
                      Continuously monitors protocol performance and adjusts allocations to maximize returns.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProtocolRow({
  protocol,
  allocation,
  strategyAddress,
  vaultType
}: {
  protocol: any,
  allocation: number,
  strategyAddress?: `0x${string}`,
  vaultType?: string
}) {
  const { data: apy } = useStrategyAPY(strategyAddress, vaultType)

  // Format APY: 500 BPS -> 5.00%
  const formattedAPY = apy !== undefined
    ? (Number(apy) / 100).toFixed(2)
    : '...'

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold text-white">{protocol.displayName}</div>
          <div className="text-xs text-white/50">{protocol.description}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-emerald-400 font-mono">{formattedAPY}%</div>
          <div className="text-xs text-white/50">APY</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-white/70">Allocation</span>
        <span className="text-white font-mono">{allocation}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          style={{ width: `${allocation}%` }}
        />
      </div>
    </div>
  )
}
