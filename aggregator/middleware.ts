import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl
  
  // Extract subdomain (e.g., "app" from "app.domain.com")
  const subdomain = hostname.split('.')[0]
  
  // Define app routes that should be accessible only on app subdomain
  const appRoutes = ['/dashboard', '/vaults', '/history', '/transparency', '/settings']
  const isAppRoute = appRoutes.some(route => url.pathname.startsWith(route))
  
  // Check if we're in development mode
  const isDevelopment = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  
  // Determine if this is the app subdomain
  // In development: only if hostname starts with "app."
  // In production: if subdomain is "app"
  const isAppSubdomain = isDevelopment 
    ? hostname.startsWith('app.') 
    : subdomain === 'app'
  
  // Route logic:
  // 1. If accessing app routes on root domain -> redirect to app subdomain
  // 2. If accessing root on app subdomain -> redirect to dashboard
  // 3. If accessing root on root domain -> show landing page
  
  if (!isAppSubdomain && isAppRoute) {
    // Accessing app route on root domain -> redirect to app subdomain
    const appUrl = new URL(request.url)
    
    if (isDevelopment) {
      // In development, redirect to app.localhost
      appUrl.hostname = `app.${hostname}`
      return NextResponse.redirect(appUrl)
    } else {
      // Compute root domain safely
      let rootDomain;

      if (hostname.endsWith('.vercel.app')) {
        // Vercel preview: keep whole hostname (no rewriting)
        rootDomain = hostname; 
      } else {
        // Real production domains
        rootDomain = hostname.split('.').slice(-2).join('.');
      }
      
      // In production, redirect to app subdomain
      appUrl.hostname = hostname.endsWith('.vercel.app')
        ? `app.${hostname}`           // app.frontend-chi-five-87.vercel.app
        : `app.${rootDomain}`         // app.domain.com
      return NextResponse.redirect(appUrl)
    }
  }
  
  if (isAppSubdomain && url.pathname === '/') {
    // On app subdomain, redirect root to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Allow all other requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
