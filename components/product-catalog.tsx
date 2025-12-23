"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Check, Loader2, Plus, Minus } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useFavorites } from "@/hooks/use-favorites"
import type { Product } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import ImageModal from "@/components/image-modal"
import ProductOptionsModal from "@/components/product-options-modal"
import { useMobile } from "@/hooks/use-mobile"
import { formatPrice } from "@/lib/utils"

interface ProductCatalogProps {
  products: Product[]
  category?: string
  searchQuery?: string
  groupByCategory?: boolean
  showLoadMore?: boolean
}

// Função auxiliar para ordenar categorias
const getCategoryPriority = (category: string) => {
  const priority: { [key: string]: number } = {
    JUUL: 1,
    JUUL2: 2,
    "POD SYSTEM": 3,
  }
  return priority[category] || 999
}

export default function ProductCatalog({
  products: initialProducts,
  category,
  searchQuery,
  groupByCategory = false,
  showLoadMore = true,
}: ProductCatalogProps) {
  const { addItem, toggleCart } = useCart()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const loadingRef = useRef<HTMLDivElement>(null)
  const [currentCategory] = useState(category)
  const [currentQuery] = useState(searchQuery)

  // Agrupar produtos por categoria
  const groupedProducts = groupByCategory
    ? products.reduce(
        (acc, product) => {
          const categoria = product.categoria || product.categories || "Outros"
          if (!acc[categoria]) acc[categoria] = []
          acc[categoria].push(product)
          return acc
        },
        {} as { [key: string]: Product[] },
      )
    : { Todos: products }

  // Ordenar categorias
  const sortedCategories = Object.keys(groupedProducts).sort((a, b) => {
    return getCategoryPriority(a) - getCategoryPriority(b)
  })

  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: "30",
      })

      if (currentCategory) params.append("category", currentCategory)
      if (currentQuery) params.append("search", currentQuery)

      const response = await fetch(`/api/products?${params}`)
      const result = await response.json()

      if (result.products && result.products.length > 0) {
        setProducts((prevProducts) => {
          // Filter out any duplicates using SKU or ID
          const newProducts = result.products.filter(
            (newProduct: Product) =>
              !prevProducts.some(
                (existingProduct) => existingProduct.id === newProduct.id || existingProduct.sku === newProduct.sku,
              ),
          )
          return [...prevProducts, ...newProducts]
        })
        setPage(nextPage)
        setHasMore(result.products.length >= 30)
        setTotal(result.total)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more products:", error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, currentCategory, currentQuery])

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const currentRef = loadingRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (firstEntry.isIntersecting && !loading && hasMore) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadMoreProducts, loading, hasMore])

  // Reset state when initial products change
  useEffect(() => {
    setProducts(initialProducts)
    setPage(1)
    setHasMore(initialProducts.length >= 30)
    setTotal(initialProducts.length)
  }, [initialProducts])

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block p-8 rounded-lg bg-gradient-to-br from-[#141318] to-[#1A1450] border border-gray-600/30 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Nenhum produto encontrado</h2>
          <p className="text-white">Tente refinar sua pesquisa ou navegar por outras categorias.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {sortedCategories.map((categoryName) => (
        <div key={categoryName} className="space-y-6">
          {groupByCategory && (
            <h2 className="text-xl font-medium text-white inline-block relative">
              {categoryName}
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-gray-400 via-gray-500/70 to-transparent"></span>
            </h2>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {groupedProducts[categoryName].map((product, index) => (
              <motion.div
                key={`${product.id || ""}-${product.sku || ""}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 1) }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={() => {
                    addItem(product)
                    toggleCart(true)
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      <div ref={loadingRef} className="mt-8 text-center py-4">
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
            <span className="text-white">Carregando mais produtos...</span>
          </div>
        )}

        {!loading && hasMore && showLoadMore && (
          <Button
            onClick={loadMoreProducts}
            className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-medium"
          >
            Carregar mais produtos
          </Button>
        )}

        {!hasMore && products.length > 0 && (
          <p className="text-white">
            Mostrando {products.length} de {total} produtos
          </p>
        )}
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false)
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">("idle")
  const [quantity, setQuantity] = useState(1)
  const { toggleFavorite, isFavorite } = useFavorites()
  const { addItem, toggleCart } = useCart()
  const isMobile = useMobile()

  const images = product.imagem
    ? [product.imagem]
    : product.images && Array.isArray(product.images)
      ? product.images.map((img: any) => img.image_url || img).filter(Boolean)
      : typeof (product as any).images === 'string'
        ? (product as any).images.split(",").map((img: string) => img.trim())
        : []
  const isFavorited = product.id ? isFavorite(product.id) : false

  const hasModifiers = product.modifier_categories && product.modifier_categories.length > 0

  const isOutOfStock = product.stock !== undefined && product.stock <= 0
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5

  const handleImageClick = () => {
    if (images.length > 0) {
      setIsModalOpen(true)
    }
  }

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return
    }

    if (hasModifiers) {
      setIsFlavorModalOpen(true)
    } else {
      setButtonState("loading")
      setTimeout(() => {
        addItem(product, [], quantity)
        toggleCart(true)
        setButtonState("success")
        setTimeout(() => {
          setButtonState("idle")
          setQuantity(1) // Reset quantity after adding
        }, 1500)
      }, 600)
    }
  }

  const handleFlavorAddToCart = (selectedFlavors: string[], quantity: number) => {
    setButtonState("loading")
    setTimeout(() => {
      // Convert flavor IDs to proper modifier structure
      const flavorCategory = product.modifier_categories?.find(
        cat => cat.name.toLowerCase().includes("sabor") || cat.name.toLowerCase().includes("flavor")
      ) || product.modifier_categories?.[0]
      
      const selectedModifiers = selectedFlavors.map(flavorId => ({
        categoryId: flavorCategory?.id || '',
        modifierId: flavorId
      }))
      
      addItem(product, selectedModifiers, quantity)
      toggleCart(true)
      setButtonState("success")
      setTimeout(() => {
        setButtonState("idle")
      }, 1500)
    }, 600)
  }

  const basePrice = Number(product.preco || product.price || 0)
  const originalPrice = product.originalPrice || basePrice
  const hasDiscount = originalPrice > basePrice

  return (
    <>
      <Card className="overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 border border-gray-400/50 hover:border-gray-500/70 transition-all duration-300 rounded-lg shadow-xl hover:shadow-2xl h-full flex flex-col product-card backdrop-blur-sm">
        <div
          className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
          onClick={handleImageClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={images[currentImageIndex] || "/placeholder.svg?height=400&width=400"}
            alt={product.nome || product.name || "Produto"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=400"
            }}
          />

          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "bg-gradient-to-r from-gray-600 to-gray-800 w-4"
                      : "bg-gray-400/60 hover:bg-gray-500/80"
                  }`}
                  aria-label={`Ver imagem ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Only stock status badges - no category */}
          {(isOutOfStock || isLowStock) && (
            <div className="absolute top-2 right-2">
              {isOutOfStock && (
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                  Esgotado
                </div>
              )}
              {isLowStock && !isOutOfStock && (
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                  Últimas unidades
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 flex items-center justify-center"
              >
                <Button
                  className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/90 text-white border border-gray-600/50 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleImageClick()
                  }}
                >
                  Ampliar imagem
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="p-2 sm:p-3 flex-grow">
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base leading-tight mb-1 sm:mb-2">
            {product.nome || product.name || "Produto sem nome"}
          </h3>

          <div className="space-y-1">
            {hasDiscount && <p className="text-xs text-gray-600 line-through">{formatPrice(originalPrice)}</p>}
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base sm:text-lg font-bold text-gray-900">{formatPrice(basePrice)}</p>
              {hasDiscount && (
                <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs shrink-0">
                  -{Math.round(((originalPrice - basePrice) / originalPrice) * 100)}%
                </Badge>
              )}
            </div>
          </div>

          {product.stock !== undefined && product.stock > 0 && (
            <div className="mt-1">
              <span className="text-xs text-gray-600">
                {product.stock <= 10 ? `${product.stock} em estoque` : "Em estoque"}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-2 sm:p-3 pt-0 flex gap-2">
          <Button
            className={`w-full font-medium transition-all relative overflow-hidden group border shadow-lg ${
              isOutOfStock
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-600/30 cursor-not-allowed"
                : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white border-gray-600/30"
            }`}
            onClick={handleAddToCart}
            disabled={buttonState !== "idle" || isOutOfStock}
          >
            {isOutOfStock ? (
              <span className="group-active:scale-95 transition-transform text-white">Esgotado</span>
            ) : buttonState === "idle" ? (
              <>
                {!isMobile && (
                  <ShoppingCart className="h-4 w-4 mr-2 group-active:scale-90 transition-transform text-white" />
                )}
                <span className="group-active:scale-95 transition-transform text-white">
                  {hasModifiers ? "Personalizar" : "Adicionar"}
                </span>
              </>
            ) : buttonState === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                {!isMobile && <span className="text-white">Adicionando...</span>}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2 text-white" />
                {!isMobile && <span className="text-white">Adicionado!</span>}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`
              bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 border-gray-500/50 hover:border-gray-600/70 shadow-lg
              ${isFavorited ? "text-gray-800" : "text-gray-700"} 
              transition-all
            `}
            onClick={() => toggleFavorite(product)}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-gray-800 text-gray-800" : "text-gray-700"}`} />
            <span className="sr-only">{isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}</span>
          </Button>
        </CardFooter>
      </Card>

      <ImageModal
        images={images}
        initialIndex={currentImageIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ProductOptionsModal
        isOpen={isFlavorModalOpen}
        onClose={() => setIsFlavorModalOpen(false)}
        product={product}
        onAddToCart={(product, selectedFlavors, quantity) => handleFlavorAddToCart(selectedFlavors, quantity)}
      />
    </>
  )
}
