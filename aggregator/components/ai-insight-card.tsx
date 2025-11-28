"use client"

import { formatNextBatchTime } from "@/lib/utils"

export function AiInsightCard() {
  return (
    <div
      className="relative h-full min-h-[180px] rounded-3xl backdrop-blur-xl p-6 overflow-hidden group hover:border-white/15 transition-all duration-500"
      style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex items-start gap-4">
        {/* Animated Orb */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 animate-pulse" />
            <div
              className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/50 to-cyan-400/50 animate-ping opacity-75"
              style={{ animationDuration: "2s" }}
            />
            <svg className="relative w-5 h-5 text-[#050510] z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">AI Analysis</span>
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-white/90 font-sans text-base leading-relaxed">
            Moving <span className="text-emerald-400 font-semibold">$3,200 USDC</span> from Conservative to Balanced Vault could increase APY by{" "}
            <span className="text-emerald-400 font-semibold">1.3%</span> while maintaining reasonable risk.
          </p>
          <p className="text-white/50 text-xs mt-2">
            Changes will be executed in the next batch at {formatNextBatchTime()}
          </p>
          <button className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all hover:border-emerald-500/50">
            Schedule Rebalance
          </button>
        </div>
      </div>
    </div>
  )
}
