"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { usePortfolioValue, useFormatTokenAmount } from "@/hooks/useContracts"
import { useAccount } from "wagmi"

export function PortfolioChart() {
  const { address } = useAccount()
  const { data: portfolioValue } = usePortfolioValue(address)
  const { formatAmount } = useFormatTokenAmount()

  // Current snapshot - historical data will be fetched from blockchain events in future
  const currentValue = portfolioValue ? parseFloat(formatAmount(portfolioValue, 6)) : 0
  
  // Generate single data point for current snapshot
  const data = [
    { date: "Current", value: currentValue },
  ]
  return (
    <div
      className="h-full min-h-[280px] rounded-3xl backdrop-blur-xl p-6 hover:border-white/15 transition-all duration-300"
      style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold font-sans text-white">Portfolio Performance</h2>
          <p className="text-white/40 text-sm">Current Snapshot • Historical data coming soon</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          ${currentValue.toLocaleString()}
        </div>
      </div>

      {currentValue > 0 ? (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#a855f7" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 px-4 py-3 shadow-2xl">
                      <p className="text-white font-semibold">${payload[0].value?.toLocaleString()}</p>
                      <p className="text-white/50 text-xs">{payload[0].payload.date}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-white/40">No portfolio value yet. Make a deposit to get started.</p>
        </div>
      )}
    </div>
  )
}
