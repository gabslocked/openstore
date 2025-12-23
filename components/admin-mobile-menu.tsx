"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Image from 'next/image'

export function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
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
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-600/30 flex items-center justify-between px-4 z-50 shadow-2xl">
        <Link href="/admin/dashboard">
          <Image
            src="/ezpods-logo.png"
            alt="EzPods Logo"
            width={120}
            height={50}
            className="w-auto h-10"
          />
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-white hover:bg-gray-800/50 rounded-lg transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 mt-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide Menu */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-80 bg-gradient-to-b from-black via-gray-900 to-black border-l border-gray-600/30 z-40 transform transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-600/30">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-500/30">
                  <span className="text-white font-semibold text-lg">
                    {user.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">
                    {user.name || 'Admin'}
                  </div>
                  <div className="text-gray-400 text-sm truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
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

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-600/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-600/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
