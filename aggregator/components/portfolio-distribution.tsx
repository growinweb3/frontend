import { VaultType } from "@/lib/types"
import { BatchCountdown } from "./batch-countdown"

const distributions = [
  { token: "USDC", vault: "Conservative Vault", vaultType: VaultType.CONSERVATIVE, amount: "$6,300.00", percentage: 40, apy: "4.2%", risk: 2 },
  { token: "USDC", vault: "Balanced Vault", vaultType: VaultType.BALANCED, amount: "$5,512.50", percentage: 35, apy: "5.5%", risk: 3 },
  { token: "USDC", vault: "Aggressive Vault", vaultType: VaultType.AGGRESSIVE, amount: "$3,937.50", percentage: 25, apy: "6.8%", risk: 4 },
]

const getBarColor = (percentage: number, index: number) => {
  const colors = ["from-emerald-500 to-emerald-400", "from-cyan-500 to-cyan-400", "from-orange-500 to-orange-400"]
  return colors[index % colors.length]
}

export function PortfolioDistribution() {
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
