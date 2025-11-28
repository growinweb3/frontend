"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.set(contentRef.current.children, { opacity: 1, y: 0 })
        gsap.from(contentRef.current.children, {
          opacity: 0,
          y: 50,
          stagger: 0.15,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleGetStarted = () => {
    // Redirect to app subdomain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const protocol = window.location.protocol
      const port = window.location.port ? `:${window.location.port}` : ''
      
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        window.location.href = `${protocol}//app.localhost${port}/dashboard`
      } else {
        const rootDomain = hostname.split('.').slice(-2).join('.')
        window.location.href = `${protocol}//app.${rootDomain}/dashboard`
      }
    }
  }

  return (
    <section ref={sectionRef} className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" style={{ filter: "blur(120px)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" style={{ filter: "blur(120px)" }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className="max-w-5xl mx-auto rounded-3xl p-12 md:p-16"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(40px)",
          }}
        >
          <div ref={contentRef} className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/80">Start earning today</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Ready to Maximize
              <br />
              Your <span className="text-emerald-400">DeFi Yields</span>?
            </h2>

            {/* Description */}
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Join thousands of users already earning optimized returns. Connect your wallet and start depositing in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:scale-105"
              >
                Launch App
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Non-custodial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Audited protocols</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>No lock-up periods</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
