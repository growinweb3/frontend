import { PortfolioDistribution } from "@/components/portfolio-distribution"
import { PageLayout } from "@/components/page-layout"
import { FloatingNav } from "@/components/floating-nav"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BatchCountdown } from "@/components/batch-countdown"
import { Users, ArrowRight, Clock } from "lucide-react"

export default function Transparency() {
  return (
    <>
      <PageLayout>
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Radical Transparency</h1>
            <p className="text-white/60">Real-time breakdown of your funds and strategies</p>
          </div>

          {/* Protocol TVL & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10 p-6">
              <p className="text-white/60 text-sm mb-2">Total Value Locked</p>
              <p className="text-3xl font-bold">$11.7B</p>
              <p className="text-sm text-emerald-400 mt-1">Combined across protocols</p>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <p className="text-white/60 text-sm mb-2">Active Protocols</p>
              <p className="text-3xl font-bold">2</p>
              <p className="text-sm text-white/60 mt-1">Aave V3 & Compound V3</p>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <p className="text-white/60 text-sm mb-2">Average APY</p>
              <p className="text-3xl font-bold">5.0%</p>
              <p className="text-sm text-cyan-400 mt-1">USDC risk-adjusted</p>
            </Card>
          </div>

          {/* Batch Deposit System */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold">Batch Deposit System</h2>
              </div>
              <p className="text-white/80 mb-6">
                We use a batch execution system to dramatically reduce gas costs. Instead of deploying each user's deposit immediately, we aggregate multiple deposits and execute them together every 6 hours.
              </p>
              
              {/* Flow Diagram */}
              <div className="mb-6 p-4 rounded-xl bg-black/20">
                <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
                  <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-cyan-400" />
                    </div>
                    <p className="text-sm font-medium text-white">User Deposits</p>
                    <p className="text-xs text-white/60 mt-1">Multiple users deposit USDC</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-white">Vault Holds</p>
                    <p className="text-xs text-white/60 mt-1">Waits for next 6h batch</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <div className="text-2xl">🎯</div>
                    </div>
                    <p className="text-sm font-medium text-white">Batch Deploy</p>
                    <p className="text-xs text-white/60 mt-1">All funds → Protocols</p>
                  </div>
                </div>
              </div>

              {/* Next Batch Countdown */}
              <div className="mb-4 p-4 rounded-xl bg-black/20 border border-emerald-500/20">
                <BatchCountdown variant="compact" showIcon={true} className="justify-center" />
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-black/20">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">~90%</p>
                  <p className="text-sm text-white/80">Gas cost reduction per user</p>
                </div>
                <div className="p-4 rounded-xl bg-black/20">
                  <p className="text-2xl font-bold text-cyan-400 mb-1">Every 6h</p>
                  <p className="text-sm text-white/80">Batch execution schedule</p>
                </div>
                <div className="p-4 rounded-xl bg-black/20">
                  <p className="text-2xl font-bold text-purple-400 mb-1">$0.50</p>
                  <p className="text-sm text-white/80">Avg. gas fee per deposit</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Analysis */}
          <PortfolioDistribution />

          {/* Protocol Details Accordion */}
          <Card className="bg-white/5 border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Protocol Breakdown</h2>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="aave" className="border-white/10">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
                      <div className="text-left">
                        <p className="font-medium">Aave V3</p>
                        <p className="text-sm text-white/60">Lending Protocol • $8.2B TVL</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-11 pt-2 space-y-2 text-sm text-white/80">
                      <p>
                        <span className="text-white/60">Contract:</span> 0x0000000000000000000000000000000000000000
                      </p>
                      <p>
                        <span className="text-white/60">Chain:</span> Lisk Sepolia
                      </p>
                      <p>
                        <span className="text-white/60">Last Audit:</span> OpenZeppelin, Trail of Bits, ABDK (2024-Q2)
                      </p>
                      <p>
                        <span className="text-white/60">Risk Score:</span> 2.5/10 (Very Low)
                      </p>
                      <p>
                        <span className="text-white/60">USDC APY:</span> 4.2%
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="compound" className="border-white/10">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500" />
                      <div className="text-left">
                        <p className="font-medium">Compound V3</p>
                        <p className="text-sm text-white/60">Lending Protocol • $3.5B TVL</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-11 pt-2 space-y-2 text-sm text-white/80">
                      <p>
                        <span className="text-white/60">Contract:</span> 0x0000000000000000000000000000000000000000
                      </p>
                      <p>
                        <span className="text-white/60">Chain:</span> Lisk Sepolia
                      </p>
                      <p>
                        <span className="text-white/60">Last Audit:</span> OpenZeppelin, ChainSecurity (2024-Q1)
                      </p>
                      <p>
                        <span className="text-white/60">Risk Score:</span> 3.0/10 (Low)
                      </p>
                      <p>
                        <span className="text-white/60">USDC APY:</span> 5.8%
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </Card>

          {/* Fee Transparency */}
          <Card className="bg-white/5 border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Complete Fee Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-white/80">Platform Management Fee</span>
                  <span className="font-medium">0.5% annually</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-white/80">Performance Fee</span>
                  <span className="font-medium">10% on profits</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <div>
                    <span className="text-white/80">Gas Optimization Savings</span>
                    <p className="text-xs text-white/50 mt-0.5">Via 6-hour batch execution system</p>
                  </div>
                  <span className="font-medium text-emerald-400">~$4.50 saved</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-white/80">Protocol Fees (passed through)</span>
                  <span className="font-medium">Varies by protocol</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>

      <FloatingNav />
    </>
  )
}
