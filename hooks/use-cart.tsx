"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/types"

interface CartItem extends Product {
  quantity: number
  selectedFlavors?: string[]
  flavorNames?: string[]
  cartItemId?: string // Unique identifier for cart items with different flavors
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, selectedFlavors?: string[], quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  toggleCart: (open?: boolean) => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isCartOpen: false,
  toggleCart: () => {},
  totalItems: 0,
  totalPrice: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        // Validate and sanitize cart items
        const validatedCart = parsedCart.map((item: any) => ({
          ...item,
          quantity: Math.max(1, Math.floor(Number(item.quantity)) || 1),
          cartItemId: item.cartItemId || `${item.id || item.sku}-${Date.now()}`
        }))
        setItems(validatedCart)
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items))

      // Calculate totals with proper validation
      const itemCount = items.reduce((acc, item) => {
        const quantity = Number(item.quantity) || 0
        return acc + quantity
      }, 0)
      
      const price = items.reduce((acc, item) => {
        const itemPrice = Number(item.preco || item.price || 0)
        const quantity = Number(item.quantity) || 0
        return acc + (itemPrice * quantity)
      }, 0)

      setTotalItems(itemCount)
      setTotalPrice(price)
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [items])

  const addItem = (product: Product, selectedFlavors: string[] = [], quantity = 1) => {
    setItems((prev) => {
      const safeFlavors = Array.isArray(selectedFlavors) ? selectedFlavors : []

      // Create unique cart item ID based on product and selected flavors
      const flavorKey = safeFlavors.sort().join(",")
      const cartItemId = `${product.id || product.sku}-${flavorKey}`

      // Get flavor names for display
      const flavorNames = safeFlavors
        .map((flavorId) => {
          const flavorCategory = product.modifierCategories?.find((cat) =>
            cat.modifiers.some((mod) => mod.id === flavorId),
          )
          return flavorCategory?.modifiers.find((mod) => mod.id === flavorId)?.name || ""
        })
        .filter(Boolean)

      // Check if this exact combination already exists
      const existingItemIndex = prev.findIndex((item) => item.cartItemId === cartItemId)

      if (existingItemIndex >= 0) {
        // Increase quantity if exact same product+flavors combination exists
        const updatedItems = [...prev]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        // Add new cart item with flavors
        const newItem: CartItem = {
          ...product,
          quantity,
          selectedFlavors: safeFlavors,
          flavorNames,
          cartItemId,
        }
        return [...prev, newItem]
      }
    })
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (!cartItemId) return

    // Ensure quantity is a valid number
    const validQuantity = Math.max(1, Math.floor(Number(quantity)) || 1)

    setItems((prev) =>
      prev.map((item) => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity: validQuantity } 
          : item
      ),
    )
  }

  const removeItem = (cartItemId: string) => {
    if (!cartItemId) return

    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  const clearCart = () => {
    setItems([])
  }

  const toggleCart = (open?: boolean) => {
    if (open !== undefined) {
      setIsCartOpen(open)
    } else {
      setIsCartOpen((prev) => !prev)
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
