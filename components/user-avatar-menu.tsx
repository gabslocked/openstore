"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, ShoppingBag, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserAvatarMenuProps {
  user: {
    name: string
    email: string
  }
}

export function UserAvatarMenu({ user }: UserAvatarMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Pega a primeira letra do nome
  const initial = user.name.charAt(0).toUpperCase()

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        {/* Avatar Circle */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          {initial}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="text-white font-semibold">{user.name}</div>
            <div className="text-gray-400 text-sm truncate">{user.email}</div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                router.push('/account')
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Meu Perfil</span>
            </button>

            <button
              onClick={() => {
                router.push('/account/my-orders')
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Minhas Compras</span>
            </button>

            <div className="border-t border-gray-700 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-3 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
