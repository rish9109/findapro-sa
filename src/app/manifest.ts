// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FindAPro - Trusted Service Providers SA',
    short_name: 'FindAPro',
    description: 'Connect with verified professionals for home services, repairs, maintenance across South Africa',
    start_url: '/',
    scope: '/',                     // ← added this line (helps Android scope)
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#111827',
    theme_color: '#ea580c',
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