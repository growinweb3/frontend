"use client"

import { useEffect, useState } from "react"
import { VaultList } from "@/components/vault-list"
import { VaultDetails } from "@/components/vault-details"
import { PageLayout } from "@/components/page-layout"
import { FloatingNav } from "@/components/floating-nav"
import { Card } from "@/components/ui/card"
import { VaultType } from "@/lib/types"
import { Shield, TrendingUp, Zap } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"  // ADD THIS



export default function Vaults() {
  const [selectedVault, setSelectedVault] = useState<VaultType | null>(null)
  const [filter, setFilter] = useState<VaultType | "all">("all")
  const queryClient = useQueryClient()

  useEffect(() => {
    // Log all queries in the cache to diagnose caching issues
    console.group('🗄️ [React Query Cache Diagnostic]')
    console.log('Total queries in cache:', queryClient.getQueryCache().getAll().length)
    
    const allQueries = queryClient.getQueryCache().getAll()
    
    // Custom JSON.stringify replacer to handle BigInt
    const bigIntReplacer = (_key: string, value: any) => {
      if (typeof value === 'bigint') {
        return value.toString() + 'n'
      }
      return value
    }
    
    const groupedByKey = allQueries.reduce((acc, query) => {
      const key = JSON.stringify(query.queryKey, bigIntReplacer)
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push({
        state: query.state.status,
        dataPreview: typeof query.state.data === 'bigint' 
          ? query.state.data.toString() + 'n'
          : query.state.data,
        dataUpdatedAt: new Date(query.state.dataUpdatedAt).toLocaleTimeString()
      })
      return acc
    }, {} as Record<string, any[]>)
    
    console.log('Queries grouped by key:', groupedByKey)
    console.log('🔍 Duplicate keys (SHOULD BE EMPTY):', 
      Object.entries(groupedByKey)
        .filter(([_, queries]) => queries.length > 1)
        .map(([key, queries]) => ({ key, count: queries.length, queries }))
    )
    console.groupEnd()
  }, [queryClient])


  return (
    <>
      <PageLayout>
        <div className="space-y-6">


          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">USDC Yield Vaults</h1>
            <p className="text-white/60">
              Choose your strategy: Conservative, Balanced, or Aggressive vault based on your risk preference
            </p>
          </div>

          {/* Vault Type Filters */}
          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "all"
                    ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  }`}
              >
                All Vaults
              </button>
              <button
                onClick={() => setFilter(VaultType.CONSERVATIVE)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === VaultType.CONSERVATIVE
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  }`}
              >
                <Shield className="w-4 h-4" />
                Conservative
              </button>
              <button
                onClick={() => setFilter(VaultType.BALANCED)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === VaultType.BALANCED
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  }`}
              >
                <TrendingUp className="w-4 h-4" />
                Balanced
              </button>
              <button
                onClick={() => setFilter(VaultType.AGGRESSIVE)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === VaultType.AGGRESSIVE
                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 text-orange-400"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                  }`}
              >
                <Zap className="w-4 h-4" />
                Aggressive
              </button>
            </div>
          </Card>

          {/* Vault List */}
          <VaultList filter={filter} onVaultSelect={(vaultType) => setSelectedVault(vaultType)} />
        </div>
      </PageLayout>

      <FloatingNav />

      {/* Vault Details Modal */}
      {selectedVault && <VaultDetails vaultType={selectedVault} onClose={() => setSelectedVault(null)} />}
    </>
  )
}

