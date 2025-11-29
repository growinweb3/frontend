'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2 } from 'lucide-react'

export function ContractInitCheck() {
  const [isExpanded, setIsExpanded] = useState(false)

  // Mock status - always ready
  const allVaultsInitialized = true
  const isUsdcInit = true

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            System Status
          </CardTitle>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Operational
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white/80">System Health</h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/70">Vault Contracts</span>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/70">Token Contracts</span>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/70">Batch Processor</span>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Running</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
