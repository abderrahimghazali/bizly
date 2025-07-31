"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/hooks/useAuth"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("") // Clear previous errors
    
    try {
      await useAuth.getState().login({ email, password })
      // Redirect will be handled by AuthGuard
      window.location.href = "/dashboard"
    } catch (error: unknown) {
      console.error("Login failed:", error)
      
      // Handle different types of errors
      const axiosError = error as { response?: { status: number; data?: { errors?: Record<string, string[]> } }; code?: string }
      
      if (axiosError.response?.status === 401) {
        setError("Invalid email or password. Please check your credentials and try again.")
      } else if (axiosError.response?.status === 422) {
        // Validation errors
        const validationErrors = axiosError.response.data?.errors
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(" ")
          setError(errorMessages)
        } else {
          setError("Please check your input and try again.")
        }
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        setError("Server error. Please try again later.")
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo width={24} height={32} />
              <span className="text-2xl font-bold">Bizly</span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </AuthGuard>
  )
}