"use client"

import { motion } from "framer-motion"

export default function LoadingProducts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="bg-gradient-to-br from-[#0a0800] to-black border border-yellow-800/30 rounded-lg overflow-hidden shadow-lg"
        >
          <div className="aspect-square bg-black/70 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer"></div>
          </div>
          <div className="p-4">
            <div className="h-5 bg-white/10 rounded animate-pulse mb-3"></div>
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4 mb-3"></div>
            <div className="flex justify-between items-center mt-3">
              <div className="h-5 bg-yellow-800/30 rounded animate-pulse w-1/3"></div>
              <div className="h-4 bg-white/10 rounded animate-pulse w-1/4"></div>
            </div>
          </div>
          <div className="p-4 pt-0 flex gap-2">
            <div className="h-9 bg-yellow-800/30 rounded animate-pulse w-3/4"></div>
            <div className="h-9 bg-white/10 rounded animate-pulse w-1/4"></div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
