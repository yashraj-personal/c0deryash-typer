'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initTracker, track } from '@/lib/tracker'

/** Mounted once in app/layout.tsx. Starts the tracker and logs a page view on every route. */
export function TrackerInit() {
  const pathname = usePathname()

  useEffect(() => {
    initTracker()
  }, [])

  useEffect(() => {
    track('page_view', { label: pathname || '/' })
  }, [pathname])

  return null
}
