"use client"

import type React from "react"

import { CartProvider } from "@/hooks/use-cart"
import { FavoritesProvider } from "@/hooks/use-favorites"
import CartDrawer from "@/components/cart-drawer"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <FavoritesProvider>
        {children}
        <CartDrawer />
      </FavoritesProvider>
    </CartProvider>
  )
}
