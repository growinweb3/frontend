"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial visible states to prevent flash
      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 1, y: 0 })
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power3.out",
        })
      }

      // Animate subtitle
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 1, y: 0 })
        gsap.from(subtitleRef.current, {
          opacity: 0,
          y: 30,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
        })
      }

      // Animate CTA buttons
      if (ctaRef.current) {
        gsap.set(ctaRef.current.children, { opacity: 1, y: 0 })
        gsap.from(ctaRef.current.children, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.4,
          stagger: 0.1,
          ease: "power3.out",
        })
      }

      // Parallax effect for gradient orbs
      if (orb1Ref.current && orb2Ref.current && orb3Ref.current) {
        gsap.to(orb1Ref.current, {
          y: -100,
          x: 50,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        })

        gsap.to(orb2Ref.current, {
          y: -150,
          x: -50,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        })

        gsap.to(orb3Ref.current, {
          y: -80,
          x: 30,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        })
      }
    }, heroRef)

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
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated gradient orbs */}
      <div
        ref={orb1Ref}
        className="absolute top-20 left-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl will-change-transform"
        style={{ filter: "blur(120px)" }}
      />
      <div
        ref={orb2Ref}
        className="absolute top-40 right-20 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl will-change-transform"
        style={{ filter: "blur(120px)" }}
      />
      <div
        ref={orb3Ref}
        className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl will-change-transform"
        style={{ filter: "blur(120px)" }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80">Powered by DeFi Excellence</span>
          </div>

          {/* Main title */}
          <h1
            ref={titleRef}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight will-change-transform"
            style={{
              background: "linear-gradient(to right, #fff, #a3a3a3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Yield Aggregation,
            <br />
            <span className="text-emerald-400">Simplified</span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed will-change-transform"
          >
            Maximize your DeFi returns with intelligent vault strategies. 
            Automated optimization across protocols.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:scale-105 will-change-transform"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button
              onClick={() => {
                document.getElementById('vaults-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              size="lg"
              variant="outline"
              className="border-white/20 hover:border-white/40 text-white px-8 py-6 text-lg rounded-2xl backdrop-blur-xl transition-all hover:bg-white/5"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
              }}
            >
              Explore Vaults
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-3xl mx-auto">
            {[
              { label: "Total Value Locked", value: "$2.4M+" },
              { label: "Active Vaults", value: "3" },
              { label: "Avg APY", value: "12.5%" },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl backdrop-blur-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="text-3xl font-bold text-emerald-400 mb-2">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
