"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { getTimeUntilNextBatch, formatBatchCountdown } from "@/lib/utils"

interface BatchCountdownProps {
  variant?: "default" | "compact" | "large"
  showIcon?: boolean
  className?: string
}

export function BatchCountdown({ variant = "default", showIcon = true, className = "" }: BatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Set initial time on mount to avoid hydration mismatch
    setIsMounted(true)
    setTimeLeft(getTimeUntilNextBatch())

    // Update countdown every second
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilNextBatch())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Show placeholder during SSR to avoid hydration mismatch
  if (!isMounted || timeLeft === null) {
    const placeholder = "Loading..."
    
    if (variant === "compact") {
      return (
        <div className={`flex items-center gap-1.5 text-sm ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="text-white/60">Next batch in:</span>
          <span className="font-mono text-emerald-400 font-medium">{placeholder}</span>
        </div>
      )
    }

    if (variant === "large") {
      return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
          {showIcon && <Clock className="w-8 h-8 text-emerald-400" />}
          <div className="text-center">
            <div className="text-sm text-white/60 mb-1">Next Batch Execution</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{placeholder}</div>
          </div>
        </div>
      )
    }

    // Default variant
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Clock className="w-4 h-4 text-emerald-400" />}
        <div className="flex flex-col">
          <span className="text-xs text-white/60">Next batch in</span>
          <span className="font-mono text-sm text-emerald-400 font-medium">{placeholder}</span>
        </div>
      </div>
    )
  }

  const formattedTime = formatBatchCountdown(timeLeft)

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1.5 text-sm ${className}`}>
        {showIcon && <Clock className="w-3.5 h-3.5 text-emerald-400" />}
        <span className="text-white/60">Next batch in:</span>
        <span className="font-mono text-emerald-400 font-medium">{formattedTime}</span>
      </div>
    )
  }

  if (variant === "large") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {showIcon && <Clock className="w-8 h-8 text-emerald-400" />}
        <div className="text-center">
          <div className="text-sm text-white/60 mb-1">Next Batch Execution</div>
          <div className="text-2xl font-mono font-bold text-emerald-400">{formattedTime}</div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Clock className="w-4 h-4 text-emerald-400" />}
      <div className="flex flex-col">
        <span className="text-xs text-white/60">Next batch in</span>
        <span className="font-mono text-sm text-emerald-400 font-medium">{formattedTime}</span>
      </div>
    </div>
  )
}
