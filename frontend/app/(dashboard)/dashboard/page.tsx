"use client"

import { useAuth } from "@/lib/hooks/useAuth"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg font-medium">
          Hello {user?.name || "User"}! 👋
        </p>
        <p className="text-muted-foreground">
          Welcome to your Bizly dashboard
        </p>
      </div>
    </div>
  )
}