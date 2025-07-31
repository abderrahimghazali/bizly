"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { useEffect } from "react"

export default function Landing() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-semibold">Bizly</h1>
        </div>
        
        {/* Authentication-aware navigation */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-9 w-20 bg-muted rounded"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome back, {user?.name}!
              </span>
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-center justify-center flex-1 px-6" style={{ minHeight: 'calc(100vh - 88px)' }}>
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">
            Bizly
          </h1>
        </div>
      </main>
    </div>
  )
}