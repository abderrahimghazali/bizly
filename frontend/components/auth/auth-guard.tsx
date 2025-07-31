"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isHydrated, checkAuth } = useAuth()
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    const performAuthCheck = async () => {
      await checkAuth()
      setHasChecked(true)
    }
    
    if (!hasChecked && isHydrated) {
      performAuthCheck()
    }
  }, [checkAuth, hasChecked, isHydrated])

  useEffect(() => {
    if (hasChecked && !isLoading && isHydrated) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login')
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, hasChecked, isHydrated])

  // Show loading while checking auth or not hydrated
  if (!isHydrated || !hasChecked || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}