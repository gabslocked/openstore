"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CategoryMenuProps {
  categories: string[]
  activeCategory?: string
}

export default function CategoryMenu({ categories, activeCategory }: CategoryMenuProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const [showControls, setShowControls] = useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && contentRef.current) {
        const containerW = containerRef.current.offsetWidth
        const contentW = contentRef.current.scrollWidth

        setContainerWidth(containerW)
        setContentWidth(contentW)
        setMaxScroll(Math.max(0, contentW - containerW))
        setShowControls(contentW > containerW)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => window.removeEventListener("resize", updateDimensions)
  }, [categories])

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = containerWidth * 0.8
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : Math.min(maxScroll, scrollPosition + scrollAmount)

      setScrollPosition(newPosition)
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative mb-10"
    >
      {showControls && (
        <>
          <button
            onClick={() => scroll("left")}
            disabled={scrollPosition <= 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-primary hover:bg-primary hover:text-black h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
              scrollPosition <= 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={scrollPosition >= maxScroll}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-primary hover:bg-primary hover:text-black h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
              scrollPosition >= maxScroll ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide mx-4 relative"
        style={{
          maskImage: showControls ? "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" : "none",
          WebkitMaskImage: showControls
            ? "linear-gradient(to right, transparent, black 5%, black 95%, transparent)"
            : "none",
        }}
      >
        <nav ref={contentRef} className="flex space-x-2 py-2 px-4 min-w-max">
          <CategoryButton href="/" isActive={!activeCategory} label="Todos os Produtos" />

          {categories.map((category) => (
            <CategoryButton
              key={category}
              href={`/category/${encodeURIComponent(category.toLowerCase())}`}
              isActive={activeCategory === category.toLowerCase()}
              label={category}
            />
          ))}
        </nav>
      </div>
    </motion.div>
  )
}

interface CategoryButtonProps {
  href: string
  isActive: boolean
  label: string
}

function CategoryButton({ href, isActive, label }: CategoryButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-all duration-300 whitespace-nowrap",
        isActive
          ? "bg-primary text-black cyber-glow"
          : "bg-black/50 border border-primary/30 text-white hover:border-primary/60",
      )}
    >
      {label}
    </Link>
  )
}
