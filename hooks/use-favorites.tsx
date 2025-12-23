"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/types"

interface FavoritesContextType {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("favorites")
      if (savedFavorites) {
        setItems(JSON.parse(savedFavorites))
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage:", error)
    }
  }, [])

  // Save favorites to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(items))
    } catch (error) {
      console.error("Failed to save favorites to localStorage:", error)
    }
  }, [items])

  const addItem = (product: Product) => {
    setItems((prev) => {
      // Check if product already exists in favorites
      const exists = prev.some((item) => {
        if (item.id && product.id) {
          return item.id === product.id
        }
        if (item.sku && product.sku) {
          return item.sku === product.sku
        }
        return false
      })

      if (exists) {
        return prev
      } else {
        return [...prev, product]
      }
    })
  }

  const removeItem = (productId: string) => {
    if (!productId) return

    setItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const toggleFavorite = (product: Product) => {
    const productId = product.id
    if (!productId) return

    const isCurrentlyFavorite = items.some((item) => item.id === productId)

    if (isCurrentlyFavorite) {
      removeItem(productId)
    } else {
      addItem(product)
    }
  }

  const isFavorite = (productId: string) => {
    if (!productId) return false
    return items.some((item) => item.id === productId)
  }

  const clearFavorites = () => {
    setItems([])
  }

  return (
    <FavoritesContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
