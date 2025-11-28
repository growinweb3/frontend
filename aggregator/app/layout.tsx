import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Web3Provider } from "@/components/Web3Provider"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Growish | DeFi Yield Aggregator - Maximize Your Returns",
  description: "Maximize your DeFi yields with intelligent vault strategies. Automated optimization across Aave V3 and Compound V3 protocols. Non-custodial, battle-tested, and transparent.",
  keywords: ["DeFi", "yield aggregator", "Aave", "Compound", "stablecoin", "crypto", "blockchain", "yield farming", "passive income"],
  authors: [{ name: "Growish" }],
  generator: "v0.app",
  metadataBase: new URL('https://growish.finance'),
  openGraph: {
    title: "Growish | DeFi Yield Aggregator",
    description: "Maximize your DeFi yields with intelligent vault strategies. Automated optimization across Aave V3 and Compound V3.",
    url: "https://growish.finance",
    siteName: "Growish",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Growish DeFi Yield Aggregator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Growish | DeFi Yield Aggregator",
    description: "Maximize your DeFi yields with intelligent vault strategies.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#050510",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <Web3Provider>
          {children}
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
