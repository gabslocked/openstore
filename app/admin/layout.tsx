"use client"

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminMobileMenu } from '@/components/admin-mobile-menu'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      return
    }

    // Redirect if not authenticated or not admin
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/')
    }
  }, [user, loading, router, pathname])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  // Allow login page without auth
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-950">{children}</div>
  }

  // Redirect non-admin users
  if (!user || !user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Menu */}
      <AdminMobileMenu />

      {/* Main Content */}
      <div className="lg:pl-72 pt-16 lg:pt-0">
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
