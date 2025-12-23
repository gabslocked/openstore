"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  LogOut
} from 'lucide-react'
import Image from 'next/image'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/categories', label: 'Categorias', icon: FolderTree },
    { href: '/admin/users', label: 'Usuários', icon: Users },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gradient-to-b from-black via-gray-900 to-black border-r border-gray-600/30 shadow-2xl">
      {/* Logo Section */}
      <div className="flex items-center justify-center py-6 border-b border-gray-600/30">
        <Link href="/admin/dashboard">
          <Image
            src="/ezpods-logo.png"
            alt="EzPods Logo"
            width={140}
            height={60}
            className="w-auto h-14 drop-shadow-lg"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-800/80 text-white border border-gray-600/50'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section - BOTTOM */}
      {user && (
        <div className="border-t border-gray-600/30 p-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600/30 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-500/30">
              <span className="text-white font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {user.name || 'Admin'}
              </div>
              <div className="text-gray-400 text-xs truncate">
                {user.email}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-600/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      )}
    </div>
  )
}
