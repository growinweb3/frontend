'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  useTokenBalance, 
  useTokenAllowance,
  useUserBalance,
  useAssetAPY,
  useFormatTokenAmount
} from '@/hooks/useContracts'
import { useWallet } from '@/components/Web3Provider'
import { CONTRACTS, SUPPORTED_ASSETS } from '@/lib/contracts'
import { ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { formatUnits, parseUnits } from 'viem'
import { getExplorerUrl } from '@/lib/client-config'

interface VaultInteractionProps {
  vaultType: string // VaultType enum value (conservative, balanced, aggressive)
  assetAddress: `0x${string}`
  assetSymbol: string
  assetDecimals?: number
}

export function VaultInteraction({ vaultType, assetAddress, assetSymbol, assetDecimals = 6 }: VaultInteractionProps) {
  const { address, isConnected, deposit, withdraw, approveToken, isTransacting } = useWallet()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [activeTab, setActiveTab] = useState('deposit')
  const [lastDepositHash, setLastDepositHash] = useState<string | undefined>()
  const [lastWithdrawHash, setLastWithdrawHash] = useState<string | undefined>()
  
  const { formatAmount } = useFormatTokenAmount()
  
  // Contract hooks
  const { data: tokenBalance } = useTokenBalance(assetAddress, address)
  const { data: vaultBalance } = useUserBalance(address, assetAddress)
  const { data: allowance } = useTokenAllowance(assetAddress, address)
  const { data: apy } = useAssetAPY(assetAddress)

  // Calculate if approval is needed
  const needsApproval = depositAmount && allowance && parseUnits(depositAmount, assetDecimals) > allowance

  // Handle max button clicks
  const handleMaxDeposit = useCallback(() => {
    if (tokenBalance) {
      setDepositAmount(formatAmount(tokenBalance, assetDecimals, 6))
    }
  }, [tokenBalance, formatAmount, assetDecimals])

  const handleMaxWithdraw = useCallback(() => {
    if (vaultBalance) {
      setWithdrawAmount(formatAmount(vaultBalance, assetDecimals, 6))
    }
  }, [vaultBalance, formatAmount, assetDecimals])

  // Handle transactions
  const handleApprove = useCallback(async () => {
    if (!depositAmount) return
    try {
      const amount = parseUnits(depositAmount, assetDecimals)
      await approveToken({
        tokenAddress: assetAddress,
        spender: CONTRACTS.ROUTER,
        amount,
      })
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }, [approveToken, assetAddress, depositAmount, assetDecimals])

  const handleDeposit = useCallback(async () => {
    if (!depositAmount) return
    try {
      const amount = parseUnits(depositAmount, assetDecimals)
      const { txHash } = await deposit({
        vaultType,
        amount,
        assetSymbol,
      })
      setLastDepositHash(txHash)
      setDepositAmount('')
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }, [deposit, vaultType, depositAmount, assetDecimals, assetSymbol])

  const handleWithdraw = useCallback(async () => {
    if (!withdrawAmount) return
    try {
      const shares = parseUnits(withdrawAmount, assetDecimals)
      const { txHash } = await withdraw({
        vaultType,
        shares,
        assetSymbol,
      })
      setLastWithdrawHash(txHash)
      setWithdrawAmount('')
    } catch (error) {
      console.error('Withdraw failed:', error)
    }
  }, [withdraw, vaultType, withdrawAmount, assetDecimals, assetSymbol])

  // Validation
  const isDepositValid = depositAmount && 
    tokenBalance && 
    parseUnits(depositAmount, assetDecimals) <= tokenBalance &&
    parseFloat(depositAmount) > 0

  const isWithdrawValid = withdrawAmount && 
    vaultBalance && 
    parseUnits(withdrawAmount, assetDecimals) <= vaultBalance &&
    parseFloat(withdrawAmount) > 0

  if (!address) {
    return (
      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">{vaultType.charAt(0).toUpperCase() + vaultType.slice(1)} Vault ({assetSymbol})</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to interact with this vault.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{vaultType.charAt(0).toUpperCase() + vaultType.slice(1)} Vault ({assetSymbol})</CardTitle>
          {apy && (
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
              {formatAmount(apy, 18, 2)}% APY
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60">Wallet Balance</p>
            <p className="text-white font-medium">
              {formatAmount(tokenBalance, assetDecimals)} {assetSymbol}
            </p>
          </div>
          <div>
            <p className="text-white/60">Vault Shares</p>
            <p className="text-white font-medium">
              {formatAmount(vaultBalance, assetDecimals)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-emerald-500/20">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-blue-500/20">
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">Amount to deposit</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxDeposit}
                  className="h-6 px-2 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  MAX
                </Button>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Error states */}
            {depositAmount && !isDepositValid && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {parseFloat(depositAmount) <= 0 
                    ? 'Amount must be greater than 0'
                    : 'Insufficient balance'
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Success states */}
            {lastDepositHash && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="flex items-center gap-2">
                  Deposit successful! 
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl('tx', lastDepositHash), '_blank')}
                    className="p-0 h-auto text-emerald-400"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Action buttons */}
            {needsApproval ? (
              <Button
                onClick={handleApprove}
                disabled={!isDepositValid || isTransacting}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isTransacting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                    Approving...
                  </div>
                ) : (
                  `Approve ${assetSymbol}`
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                disabled={!isDepositValid || isTransacting}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isTransacting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                    Depositing...
                  </div>
                ) : (
                  'Deposit'
                )}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">Amount to withdraw</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxWithdraw}
                  className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  MAX
                </Button>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Error states */}
            {withdrawAmount && !isWithdrawValid && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {parseFloat(withdrawAmount) <= 0 
                    ? 'Amount must be greater than 0'
                    : 'Insufficient vault balance'
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Success states */}
            {lastWithdrawHash && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="flex items-center gap-2">
                  Withdrawal successful!
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl('tx', lastWithdrawHash), '_blank')}
                    className="p-0 h-auto text-blue-400"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleWithdraw}
              disabled={!isWithdrawValid || isTransacting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isTransacting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                  Withdrawing...
                </div>
              ) : (
                'Withdraw'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Component to render all vault types
export function VaultInteractionList() {
  const { VaultType } = require('@/lib/types')
  const { CONTRACTS } = require('@/lib/contracts')
  
  const vaults = [
    { type: VaultType.CONSERVATIVE, name: 'Conservative' },
    { type: VaultType.BALANCED, name: 'Balanced' },
    { type: VaultType.AGGRESSIVE, name: 'Aggressive' },
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vaults.map((vault) => (
        <VaultInteraction
          key={vault.type}
          vaultType={vault.type}
          assetAddress={CONTRACTS.MOCK_USDC}
          assetSymbol="USDC"
          assetDecimals={6}
        />
      ))}
    </div>
  )
}