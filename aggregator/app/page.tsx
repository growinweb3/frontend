"use client"

import { HeroSection } from "@/components/landing/hero-section"
import { FeatureCards } from "@/components/landing/feature-cards"
import { VaultComparison } from "@/components/landing/vault-comparison"
import { StatsCounter } from "@/components/landing/stats-counter"
import { CTASection } from "@/components/landing/cta-section"
import { ConnectWallet } from "@/components/ConnectWallet"

export default function Home() {
  const handleConnectWallet = () => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      window.location.href = '/dashboard'
    } else {
      const rootDomain = hostname.split('.').slice(-2).join('.')
      window.location.href = `${protocol}//app.${rootDomain}/dashboard`
    }
  }
  return (
    <main className="relative min-h-screen" style={{ background: "#050510" }}>
      {/* Header with Connect Wallet */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Growish" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">Growish</span>
            </div>
            <ConnectWallet />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-20">
        <HeroSection />
        <FeatureCards />
        <VaultComparison />
        <StatsCounter />
        <CTASection />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500" />
              <span className="text-lg font-bold text-white">Growish</span>
            </div>
            
            <div className="text-sm text-white/40">
              © 2025 Growish. All rights reserved.
            </div>

            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
