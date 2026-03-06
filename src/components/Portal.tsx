'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
  selector?: string // Optional: specify a different container element
}

export default function Portal({ children, selector = 'body' }: PortalProps) {
  const [mounted, setMounted] = useState(false)
  const [container, setContainer] = useState<Element | null>(null)

  useEffect(() => {
    setMounted(true)
    setContainer(document.querySelector(selector))
    return () => setMounted(false)
  }, [selector])

  if (!mounted || !container) return null

  return createPortal(children, container)
}