"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Menu, X, User, ChevronDown, Search } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/hooks/use-auth"
import CartDrawer from './cart-drawer'
import { UserAvatarMenu } from './user-avatar-menu'
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export default function Header() {
  const [categories, setCategories] = useState<string[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const { items, totalItems, toggleCart } = useCart()
  const { items: favorites } = useFavorites()
  const { user } = useAuth()
  const itemCount = totalItems
  const favoritesCount = favorites.length
  const pathname = usePathname()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    // Close menus when route changes
    setIsMenuOpen(false)
    setIsCategoryOpen(false)
  }, [pathname])

  return (
    <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 sticky top-0 z-40 border-b border-gray-600/30 shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative z-20 group">
            <img
              src="/placeholder-logo.png"
              alt="Logo"
              className="w-auto h-16 md:h-20 transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center text-white hover:text-gray-300 transition-all duration-300 font-medium text-lg hover:scale-105"
              >
                Categorias{" "}
                <ChevronDown
                  className={`ml-2 h-5 w-5 transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-gradient-to-b from-gray-900 to-black border border-gray-600/50 rounded-lg shadow-2xl overflow-hidden z-50"
                  >
                    <div className="py-2">
                      <Link
                        href="/"
                        className="block px-4 py-3 text-white hover:bg-gray-700/50 transition-all duration-200 hover:translate-x-1"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        Todos os Produtos
                      </Link>

                      {categories.map((category) => (
                        <Link
                          key={category}
                          href={`/category/${encodeURIComponent(category.toLowerCase())}`}
                          className="block px-4 py-3 text-white hover:bg-gray-700/50 transition-all duration-200 hover:translate-x-1"
                          onClick={() => setIsCategoryOpen(false)}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/search">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full"
              >
                <Search className="h-6 w-6" />
              </Button>
            </Link>

            <Link href="/favorites" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full"
              >
                <Heart className="h-6 w-6" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full relative"
              onClick={() => toggleCart(true)}
            >
              <ShoppingCart className="h-6 w-6 cart-icon" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                  {itemCount}
                </span>
              )}
            </Button>

            {user ? (
              <Link href="/account">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full"
                  title={`Olá, ${user.name}`}
                >
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full"
                >
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Link href="/favorites" className="relative mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full"
              >
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full relative mr-2"
              onClick={() => toggleCart(true)}
            >
              <ShoppingCart className="h-5 w-5 cart-icon" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {itemCount}
                </span>
              )}
            </Button>

            {user ? (
              <div className="mr-2">
                <UserAvatarMenu user={user} />
              </div>
            ) : (
              <Link href="/login" className="mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-gray-800/50 rounded-full"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gradient-to-b from-gray-900 to-black border-t border-gray-600/30 mt-4"
          >
            <div className="container mx-auto px-4 py-4">
              <Link
                href="/search"
                className="flex items-center text-white hover:text-gray-300 py-3 transition-all duration-300 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-5 w-5 mr-3" /> Pesquisar
              </Link>

              <Link
                href="/login"
                className="flex items-center text-white hover:text-gray-300 py-3 transition-all duration-300 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-3" /> Login
              </Link>

              <div className="py-3">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center text-white hover:text-gray-300 transition-all duration-300 w-full justify-between hover:translate-x-2"
                >
                  <span>Categorias</span>{" "}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 pl-4 border-l border-gray-600/30"
                    >
                      <Link
                        href="/"
                        className="block py-2 text-white hover:text-gray-300 transition-all duration-300 hover:translate-x-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Todos os Produtos
                      </Link>

                      {categories.map((category) => (
                        <Link
                          key={category}
                          href={`/category/${encodeURIComponent(category.toLowerCase())}`}
                          className="block py-2 text-white hover:text-gray-300 transition-all duration-300 hover:translate-x-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
