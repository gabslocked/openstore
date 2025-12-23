"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useFavorites } from "@/hooks/use-favorites"
import ProductCatalog from "@/components/product-catalog"
import { Heart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function FavoritesPage() {
  const { items: favorites, clearFavorites } = useFavorites()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gradient-to-r from-slate-300 to-slate-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-medium mb-12 text-center text-white">
          Meus{" "}
          <span className="bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">Favoritos</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16 max-w-md mx-auto glass-card"
        >
          <Heart className="h-16 w-16 mx-auto mb-6 text-slate-400/70" />
          <h2 className="text-xl font-medium text-white mb-2">Você não tem favoritos</h2>
          <p className="text-white/90 mt-2 mb-8 px-6">
            Adicione produtos aos seus favoritos para encontrá-los facilmente depois.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-slate-300 to-slate-500 hover:from-slate-200 hover:to-slate-400 text-slate-900 font-medium shadow-lg transition-all duration-300"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a loja
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl font-medium mb-6 text-center text-white">
        Meus{" "}
        <span className="bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">Favoritos</span>
      </h1>

      <div className="flex justify-between items-center mb-8">
        <p className="text-white/90">
          {favorites.length} {favorites.length === 1 ? "produto" : "produtos"} favoritos
        </p>

        <Button
          variant="outline"
          onClick={clearFavorites}
          className="glass-card border-slate-400/30 text-slate-300 hover:bg-slate-400/10 hover:border-slate-300/50 transition-all duration-300 bg-transparent"
        >
          Limpar favoritos
        </Button>
      </div>

      <ProductCatalog products={favorites} showLoadMore={false} />

      <div className="mt-8 text-center">
        <Button
          asChild
          variant="outline"
          className="glass-card border-slate-400/30 text-slate-300 hover:bg-slate-400/10 hover:border-slate-300/50 transition-all duration-300 bg-transparent"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a loja
          </Link>
        </Button>
      </div>
    </div>
  )
}
