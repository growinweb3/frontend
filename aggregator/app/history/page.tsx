'use client'

import { PortfolioChart } from "@/components/portfolio-chart"
import { PageLayout } from "@/components/page-layout"
import { FloatingNav } from "@/components/floating-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAccount } from "wagmi"
import { useTransactionHistory } from "@/hooks/useContracts"
import { getExplorerUrl } from "@/lib/client-config"
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Gift, Coins } from "lucide-react"

export default function History() {
  const { address } = useAccount()
  const { data: history, isLoading } = useTransactionHistory(address)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
        return <ArrowUpRight className="w-5 h-5 text-emerald-400" />
      case 'Withdraw':
        return <ArrowDownLeft className="w-5 h-5 text-blue-400" />
      case 'Claim Shares':
        return <Gift className="w-5 h-5 text-purple-400" />
      case 'Claim USDC':
        return <Coins className="w-5 h-5 text-yellow-400" />
      default:
        return <ArrowUpRight className="w-5 h-5" />
    }
  }

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    return `${weeks}w ago`
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  return (
    <>
      <PageLayout>
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Transaction History</h1>
            <p className="text-white/60">View your portfolio performance and transaction records</p>
          </div>

          {/* Portfolio Performance Chart */}
          <PortfolioChart />

          {/* Transaction History Table */}
          <Card className="bg-white/5 border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
              
              {!address ? (
                <div className="text-center py-12 text-white/60">
                  <p>Connect your wallet to view transaction history</p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                </div>
              ) : !history || history.length === 0 ? (
                <div className="text-center py-12 text-white/60">
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((tx, i) => (
                    <div
                      key={`${tx.hash}-${i}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{tx.type}</span>
                            <Badge variant="secondary" className="text-xs">
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <span>{tx.riskLevel} Vault</span>
                            <span>•</span>
                            <span>{getTimeAgo(tx.timestamp)}</span>
                            <button
                              onClick={() => window.open(getExplorerUrl('tx', tx.hash), '_blank')}
                              className="hover:text-white/80 transition-colors inline-flex items-center gap-1"
                            >
                              <span className="text-xs">{formatHash(tx.hash)}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {parseFloat(tx.amount).toFixed(4)} {tx.type === 'Withdraw' || tx.type === 'Claim Shares' ? 'Shares' : 'USDC'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </PageLayout>

      <FloatingNav />
    </>
  )
}
