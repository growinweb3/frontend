"use client"

import { PageLayout } from "@/components/page-layout"
import { FloatingNav } from "@/components/floating-nav"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export default function Settings() {
  const [autoRebalance, setAutoRebalance] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [riskTolerance, setRiskTolerance] = useState([5])

  return (
    <>
      <PageLayout>
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-white/60">Manage your AI preferences, notifications, and account</p>
          </div>

          {/* AI Preferences */}
          <Card className="bg-white/5 border-white/10">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">AI Preferences</h2>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-rebalance" className="text-base">
                    Auto-Batch Deposits
                  </Label>
                  <p className="text-sm text-white/60">Automatically include your deposits in scheduled 6-hour batch executions</p>
                </div>
                <Switch id="auto-rebalance" checked={autoRebalance} onCheckedChange={setAutoRebalance} />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">Risk Tolerance</Label>
                  <p className="text-sm text-white/60">Adjust how aggressive the AI should be with your investments</p>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Conservative</span>
                    <span className="text-white font-medium">{riskTolerance[0]}/10</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="gas-optimization" className="text-base">
                    Gas Optimization
                  </Label>
                  <p className="text-sm text-white/60">Batch deposits every 6 hours with other users to reduce gas fees by ~90%</p>
                </div>
                <Switch id="gas-optimization" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compound-rewards" className="text-base">
                    Auto-Compound Rewards
                  </Label>
                  <p className="text-sm text-white/60">Automatically reinvest earned yields</p>
                </div>
                <Switch id="compound-rewards" defaultChecked />
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="bg-white/5 border-white/10">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">Notifications</h2>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-white/60">Receive updates about your portfolio via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-base">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-white/60">Get instant alerts for important events</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-summary" className="text-base">
                    Weekly Summary
                  </Label>
                  <p className="text-sm text-white/60">Receive a weekly performance report</p>
                </div>
                <Switch id="weekly-summary" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="price-alerts" className="text-base">
                    Price Alerts
                  </Label>
                  <p className="text-sm text-white/60">Get notified about significant price movements</p>
                </div>
                <Switch id="price-alerts" />
              </div>
            </div>
          </Card>

          {/* Account Settings */}
          <Card className="bg-white/5 border-white/10">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">Account</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-address" className="text-base">
                    Connected Wallet
                  </Label>
                  <Input
                    id="wallet-address"
                    value="0x742a35Cc6634C0532925a3b844Bc9e7595f0bDf6"
                    readOnly
                    className="bg-white/5 border-white/10 text-white/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram" className="text-base">
                    Telegram Username (Optional)
                  </Label>
                  <Input id="telegram" placeholder="@username" className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                  Save Changes
                </Button>
                <Button variant="outline" className="border-white/10 hover:bg-white/5">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-500/5 border-red-500/20">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-base">Disconnect Wallet</p>
                  <p className="text-sm text-white/60">Remove all connections and clear your data</p>
                </div>
                <Button variant="destructive" className="bg-red-500/20 border border-red-500/30 hover:bg-red-500/30">
                  Disconnect
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>

      <FloatingNav />
    </>
  )
}
