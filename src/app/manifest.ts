// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Find A Pro Connect (PTY) LTD',
    short_name: 'Find A Pro',
    description: 'Your go-to directory for verified professionals across Mzansi. Community-focused. Trust guaranteed. 🇿🇦',
    start_url: '/',
    scope: '/',                     // ← added this line (helps Android scope)
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#111827', // gray-900 - matches your page background
    theme_color: '#f59e0b', // amber-500 - matches your accent color    orientation: 'portrait-primary',
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