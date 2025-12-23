"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const banners = [
  {
    id: 1,
    title: "Descubra o Futuro do Vaping",
    subtitle: "Pods descartáveis com design futurista",
    image: "/placeholder.svg?height=600&width=1200",
    link: "/category/descartaveis",
  },
  {
    id: 2,
    title: "Novos Sabores Exclusivos",
    subtitle: "Experimente nossa nova linha premium",
    image: "/placeholder.svg?height=600&width=1200",
    link: "/category/pod-system",
  },
  {
    id: 3,
    title: "Promoção Especial",
    subtitle: "Compre 2 e leve 3 em produtos selecionados",
    image: "/placeholder.svg?height=600&width=1200",
    link: "/promocoes",
  },
]

export default function FeaturedBanner() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrent((prev) => (prev + 1) % banners.length)
  }

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false)
    setCurrent(index)
  }

  return (
    <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        {banners.map(
          (banner, index) =>
            index === current && (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
                <Image
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 z-20 flex items-center">
                  <div className="container mx-auto px-4">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      className="max-w-xl"
                    >
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 neon-text">{banner.title}</h2>
                      <p className="text-xl text-gray-300 mb-6">{banner.subtitle}</p>
                      <Button asChild className="bg-primary hover:bg-primary/80 text-black font-bold px-8 py-6 text-lg">
                        <a href={banner.link}>Explorar Agora</a>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ),
        )}
      </AnimatePresence>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-primary hover:bg-primary hover:text-black h-10 w-10 rounded-full flex items-center justify-center transition-colors"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-primary hover:bg-primary hover:text-black h-10 w-10 rounded-full flex items-center justify-center transition-colors"
        aria-label="Next banner"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current ? "bg-primary w-6" : "bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
