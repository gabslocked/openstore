"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ShoppingCart, Plus, Minus, Check, AlertCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils"

/**
 * Product Options Modal
 * 
 * A flexible modal for selecting product options/modifiers before adding to cart.
 * Supports multiple option categories (size, color, flavor, extras, etc.)
 * with single or multiple selection modes.
 */

export interface ProductOption {
  id: string
  name: string
  price: number
  originalPrice?: number
  position: number
  available?: boolean
  imageUrl?: string
}

export interface OptionCategory {
  id: string
  name: string
  description?: string
  minSelections: number
  maxSelections: number
  required: boolean
  options: ProductOption[]
}

export interface ProductForOptions {
  id: string
  name: string
  description?: string
  images: Array<{ image_url: string }>
  price: number
  originalPrice?: number
  stock?: number
  optionCategories: OptionCategory[]
}

interface ProductOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductForOptions
  onAddToCart: (product: ProductForOptions, selectedOptions: Record<string, string[]>, quantity: number) => void
}

export default function ProductOptionsModal({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart 
}: ProductOptionsModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [quantity, setQuantity] = useState(1)

  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  // Calculate if all required options are selected
  const validation = useMemo(() => {
    const errors: string[] = []
    
    product.optionCategories?.forEach(category => {
      const selected = selectedOptions[category.id] || []
      
      if (category.required && selected.length < category.minSelections) {
        errors.push(`Selecione ${category.minSelections === 1 ? '1 opção' : `pelo menos ${category.minSelections} opções`} em "${category.name}"`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [selectedOptions, product.optionCategories])

  // Calculate total price including selected options
  const pricing = useMemo(() => {
    let optionsCost = 0
    
    Object.entries(selectedOptions).forEach(([categoryId, optionIds]) => {
      const category = product.optionCategories?.find(c => c.id === categoryId)
      if (category) {
        optionIds.forEach(optionId => {
          const option = category.options.find(o => o.id === optionId)
          if (option) {
            optionsCost += option.price
          }
        })
      }
    })
    
    const basePrice = product.price
    const originalPrice = product.originalPrice || basePrice
    const totalPrice = (basePrice + optionsCost) * quantity
    const totalOriginalPrice = (originalPrice + optionsCost) * quantity
    const savings = totalOriginalPrice - totalPrice
    
    return { basePrice, totalPrice, totalOriginalPrice, savings, hasDiscount: savings > 0 }
  }, [selectedOptions, product, quantity])

  const handleOptionToggle = (categoryId: string, optionId: string, maxSelections: number) => {
    setSelectedOptions(prev => {
      const current = prev[categoryId] || []
      
      if (maxSelections === 1) {
        // Single selection mode (radio)
        return { ...prev, [categoryId]: [optionId] }
      }
      
      // Multiple selection mode (checkbox)
      if (current.includes(optionId)) {
        return { ...prev, [categoryId]: current.filter(id => id !== optionId) }
      }
      
      if (current.length >= maxSelections) {
        return prev // Don't add if at max limit
      }
      
      return { ...prev, [categoryId]: [...current, optionId] }
    })
  }

  const handleAddToCart = () => {
    if (isOutOfStock || !validation.isValid) return
    
    onAddToCart(product, selectedOptions, quantity)
    
    // Reset state
    setSelectedOptions({})
    setQuantity(1)
    onClose()
  }

  const canAddToCart = !isOutOfStock && validation.isValid

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-zinc-900 border border-zinc-800 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-zinc-800">
          <DialogTitle className="text-xl font-bold text-white pr-8">
            {product.name}
          </DialogTitle>
          {product.description && (
            <p className="text-sm text-zinc-400 mt-1">{product.description}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Product Image */}
          {product.images?.[0]?.image_url && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-800">
              <Image
                src={product.images[0].image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Price Display */}
          <div className="text-center space-y-1 p-4 rounded-lg bg-zinc-800/50">
            {pricing.hasDiscount && (
              <p className="text-zinc-500 line-through text-sm">
                {formatPrice(pricing.totalOriginalPrice)}
              </p>
            )}
            <p className="text-3xl font-bold text-white">
              {formatPrice(pricing.totalPrice)}
            </p>
            {pricing.hasDiscount && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Economize {formatPrice(pricing.savings)}
              </Badge>
            )}
          </div>

          {/* Option Categories */}
          {product.optionCategories?.map(category => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-zinc-500">{category.description}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
                  {category.required && <span className="text-red-400 mr-1">*</span>}
                  {category.maxSelections === 1 
                    ? "Escolha 1" 
                    : `Até ${category.maxSelections}`
                  }
                </Badge>
              </div>

              <div className="space-y-2">
                {category.options.map(option => {
                  const isSelected = (selectedOptions[category.id] || []).includes(option.id)
                  const isDisabled = option.available === false
                  
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleOptionToggle(category.id, option.id, category.maxSelections)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                        ${isDisabled 
                          ? 'opacity-50 cursor-not-allowed border-zinc-800 bg-zinc-900' 
                          : isSelected
                            ? 'border-emerald-500/50 bg-emerald-500/10'
                            : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600'
                        }
                      `}
                    >
                      {/* Selection Indicator */}
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${isSelected 
                          ? 'border-emerald-500 bg-emerald-500' 
                          : 'border-zinc-600'
                        }
                      `}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      
                      {/* Option Image */}
                      {option.imageUrl && (
                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={option.imageUrl}
                            alt={option.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Option Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{option.name}</p>
                        {isDisabled && (
                          <p className="text-xs text-red-400">Indisponível</p>
                        )}
                      </div>
                      
                      {/* Price */}
                      {option.price > 0 && (
                        <span className="text-sm text-emerald-400 flex-shrink-0">
                          +{formatPrice(option.price)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Validation Errors */}
          {!validation.isValid && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-400">
                  {validation.errors.map((error, i) => (
                    <p key={i}>{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800 space-y-4">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">Quantidade</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-9 w-9 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold text-lg min-w-[2.5rem] text-center text-white">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={product.stock !== undefined && quantity >= product.stock}
                className="h-9 w-9 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`
                flex-1 font-medium transition-all
                ${isOutOfStock
                  ? 'bg-red-600 hover:bg-red-700 cursor-not-allowed'
                  : canAddToCart
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-zinc-700 cursor-not-allowed'
                }
              `}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isOutOfStock ? 'Esgotado' : `Adicionar • ${formatPrice(pricing.totalPrice)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
