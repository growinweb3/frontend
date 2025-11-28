'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTokenBalance, useFormatTokenAmount } from '@/hooks/useContracts'
import { useWallet } from '@/components/Web3Provider'
import { SUPPORTED_ASSETS } from '@/lib/contracts'
import { Coins, CheckCircle2, AlertCircle, ExternalLink, Info } from 'lucide-react'
import { parseUnits } from 'viem'
import { getExplorerUrl } from '@/lib/client-config'

export function TestTokenFaucet() {
  const { address, isConnected, mintTestTokens, isTransacting } = useWallet()
  const [lastMintHash, setLastMintHash] = useState<string | undefined>()
  const { formatAmount } = useFormatTokenAmount()

  const handleMint = async (assetAddress: `0x${string}`, symbol: string) => {
    if (!address) return
    
    try {
      // Mint 1000 tokens for testing
      const amount = parseUnits('1000', 6)
      const { txHash } = await mintTestTokens(assetAddress, amount)
      setLastMintHash(txHash)
    } catch (error) {
      console.error('Minting failed:', error)
    }
  }

  if (!isConnected || !address) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Coins className="w-5 h-5 text-yellow-400" />
            Test Token Faucet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to mint test tokens.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Coins className="w-5 h-5 text-yellow-400" />
            Test Token Faucet
          </CardTitle>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
            <Info className="w-3 h-3" />
            <span className="text-xs">Testnet Only</span>
          </div>
        </div>
        <p className="text-white/60 text-sm">
          Get free test tokens to experiment with the vaults on Lisk Sepolia
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {lastMintHash && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              Test tokens minted successfully!
              <Button
                variant="link"
                size="sm"
                onClick={() => window.open(getExplorerUrl('tx', lastMintHash), '_blank')}
                className="p-0 h-auto text-emerald-400"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {SUPPORTED_ASSETS.map((asset) => (
            <TokenFaucetItem
              key={asset.address}
              asset={asset}
              onMint={handleMint}
              isMinting={isTransacting}
              userAddress={address}
            />
          ))}
        </div>

        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium">About Test Tokens</p>
              <p className="text-yellow-200/80 mt-1">
                These are mock tokens for testing purposes only. Each mint gives you 1,000 tokens.
                You can mint as many times as needed for testing.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface TokenFaucetItemProps {
  asset: typeof SUPPORTED_ASSETS[number]
  onMint: (address: `0x${string}`, symbol: string) => void
  isMinting: boolean
  userAddress: `0x${string}`
}

function TokenFaucetItem({ asset, onMint, isMinting, userAddress }: TokenFaucetItemProps) {
  const { data: balance } = useTokenBalance(asset.address, userAddress)
  const { formatAmount } = useFormatTokenAmount()

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold">{asset.symbol[0]}</span>
        </div>
        <div>
          <h3 className="text-white font-medium">{asset.symbol}</h3>
          <p className="text-white/60 text-sm">
            Balance: {formatAmount(balance, asset.decimals)} {asset.symbol}
          </p>
        </div>
      </div>

      <Button
        onClick={() => onMint(asset.address, asset.symbol)}
        disabled={isMinting}
        size="sm"
        className="bg-yellow-600 hover:bg-yellow-700 text-white"
      >
        {isMinting ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white/20 border-t-white animate-spin rounded-full" />
            Minting...
          </div>
        ) : (
          'Mint 1,000'
        )}
      </Button>
    </div>
  )
}