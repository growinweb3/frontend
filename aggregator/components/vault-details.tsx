import { useState } from "react"
import { VaultType, Protocol } from "@/lib/types"
import { VAULT_CONFIGS, PROTOCOLS } from "@/lib/constants"
import { X, TrendingUp, AlertCircle, Clock, RefreshCw, ArrowRight, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { BatchCountdown } from "./batch-countdown"
import {
  useVaultAddress,
  useVaultStrategyDistribution,
  useStrategyAPY,
  useTokenBalance,
  useTokenAllowance,
  useMinDepositAmount,
  useFormatTokenAmount,
  useUserVaultShares,
  useVaultSharePrice
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

  const [activeTab, setActiveTab] = useState<Tab>('deposit')
  const [amount, setAmount] = useState("")
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
          amount: depositAmount, // Approve exact amount
        })
        // Wait a bit for indexing (optional but good for UX)
        await new Promise(resolve => setTimeout(resolve, 2000))
        await refetchAllowance()
      }

      // 2. Proceed with Deposit
      await deposit({
        vaultType,
        amount: depositAmount,
        assetSymbol: "USDC"
      })

      // Clear input on success
      setAmount("")

    } catch (error) {
      console.error("Smart deposit failed:", error)
    }
  }

  // Withdraw Logic
  const handleMaxWithdraw = () => {
    if (shareBalance) {
      setAmount(formatUnits(shareBalance, 6)) // Match display decimals
    }
  }

  const handleSmartWithdraw = async () => {
    if (!amount || !address) return

    try {
      // Parse as 6 decimals to match display/input, but this results in the correct 18-decimal BigInt
      // because the input number is "inflated" by the 6-decimal formatting of the 18-decimal balance.
      const withdrawShares = parseUnits(amount, 6)
      const currentAllowance = vaultAllowance || BigInt(0)

      // 1. Check if approval is needed (Approve Router to spend Vault Shares)
      if (withdrawShares > currentAllowance) {
        await approveToken({
          tokenAddress: vaultAddress as `0x${string}`,
          spender: CONTRACTS.ROUTER as `0x${string}`,
          amount: withdrawShares,
        })
        await new Promise(resolve => setTimeout(resolve, 2000))
        await refetchVaultAllowance()
      }

      // 2. Proceed with Withdraw
      await withdraw({
        vaultType,
        shares: withdrawShares,
        assetSymbol: "USDC"
      })

      setAmount("")

    } catch (error) {
      console.error("Smart withdraw failed:", error)
    }
  }

  // Validation
  const parsedAmount = amount ? parseUnits(amount, 6) : BigInt(0)

  const isValid = (() => {
    if (!amount || parseFloat(amount) <= 0) return false
    if (activeTab === 'deposit') {
      const hasBalance = tokenBalance ? tokenBalance >= parsedAmount : false
      const isMinMet = minDepositAmount ? parsedAmount >= minDepositAmount : true
      return hasBalance && isMinMet
    } else {
      const hasBalance = shareBalance ? shareBalance >= parsedAmount : false
      return hasBalance
    }
  })()

  const getButtonText = () => {
    if (isTransacting) return "Processing..."
    if (!amount) return "Enter Amount"

    if (activeTab === 'deposit') {
      if (tokenBalance && parsedAmount > tokenBalance) return "Insufficient Balance"
      if (minDepositAmount && parsedAmount < minDepositAmount) return `Min Deposit ${formatUnits(minDepositAmount, assetDecimals)} USDC`
      if (allowance && parsedAmount > allowance) return "Approve & Deposit USDC"
      return "Deposit USDC"
    } else {
      if (shareBalance && parsedAmount > shareBalance) return "Insufficient Shares"
      if (vaultAllowance && parsedAmount > vaultAllowance) return "Approve & Withdraw"
      return "Withdraw USDC"
    }
  }

  // Estimated Value for Withdraw
  const estimatedValue = activeTab === 'withdraw' && amount && sharePrice
    ? (parseFloat(amount) * parseFloat(formatUnits(sharePrice, assetDecimals))).toFixed(2)
    : null

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

            {/* Action Section (Deposit/Withdraw) */}
            <div className="pt-4 space-y-4">
              {/* Tabs */}
              <div className="flex p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => { setActiveTab('deposit'); setAmount("") }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${activeTab === 'deposit' ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Deposit
                </button>
                <button
                  onClick={() => { setActiveTab('withdraw'); setAmount("") }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${activeTab === 'withdraw' ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw
                </button>
              </div>

              <div className="flex justify-between text-sm text-white/60">
                <span>{activeTab === 'deposit' ? 'Deposit Amount' : 'Withdraw Shares'}</span>
                <span>
                  Balance: {activeTab === 'deposit'
                    ? `${formatAmount(tokenBalance, assetDecimals)} USDC`
                    : `${formatAmount(shareBalance, 6)} Shares`
                  }
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-20 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button
                  onClick={activeTab === 'deposit' ? handleMaxDeposit : handleMaxWithdraw}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                >
                  MAX
                </button>
              </div>

              {activeTab === 'withdraw' && estimatedValue && (
                <div className="text-sm text-white/50 text-right">
                  ≈ {estimatedValue} USDC
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={activeTab === 'deposit' ? handleSmartDeposit : handleSmartWithdraw}
                  disabled={!isValid || isTransacting}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${!isValid || isTransacting
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/20'
                    }`}
                >
                  {isTransacting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {getButtonText()}
                </button>
                <button
                  className="px-6 py-3 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-all duration-300"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
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
