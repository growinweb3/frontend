'use client'

import { useAccount, useChainId } from 'wagmi'
import { LISK_SEPOLIA } from '@/lib/contracts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Wifi } from 'lucide-react'

export function NetworkStatus() {
  const { isConnected } = useAccount()
  const chainId = useChainId()

  if (!isConnected) {
    return null
  }

  const isCorrectNetwork = chainId === LISK_SEPOLIA.id

  if (isCorrectNetwork) {
    return (
      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {LISK_SEPOLIA.name}
      </Badge>
    )
  }

  return (
    <Alert className="border-orange-500/50 bg-orange-500/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            Wrong network detected. Please switch to <strong>{LISK_SEPOLIA.name}</strong> to interact with the vaults.
          </div>
          <Badge variant="destructive" className="ml-2">
            <Wifi className="w-3 h-3 mr-1" />
            Chain ID: {chainId}
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  )
}