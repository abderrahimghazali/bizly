"use client"

import { useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface HydrationProviderProps {
  children: React.ReactNode
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const { setHydrated } = useAuth()

  useEffect(() => {
    // Mark as hydrated after component mounts
    setHydrated(true)
  }, [setHydrated])

  return <>{children}</>
} 