// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FindAPro - Trusted Service Providers SA',
    short_name: 'FindAPro',
    description: 'Connect with verified professionals for home services, repairs, maintenance across South Africa',
    start_url: '/',
    scope: '/',                     // good to keep
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    
    // Updated colors – match your real dark background
    background_color: '#0a0b0f',    // prevents white/light flash on load
    theme_color: '#0a0b0f',         // status bar / title bar / task switcher – dark & consistent
    
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
}