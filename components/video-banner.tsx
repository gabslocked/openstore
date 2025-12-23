"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function VideoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [showText, setShowText] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set playback rate to 90% (10% slower)
    video.playbackRate = 0.9

    const handleTimeUpdate = () => {
      const progress = video.currentTime / video.duration
      setVideoProgress(progress)
      
      // Show text at 90% of video (10% from end) - more delay
      if (progress >= 0.90 && !showText) {
        setShowText(true)
      }
    }

    const handleVideoEnd = () => {
      setVideoEnded(true)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleVideoEnd)
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleVideoEnd)
    }
  }, [showText])

  return (
    <div className="relative w-full h-[250px] sm:h-[320px] md:h-[400px] overflow-hidden">
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full transition-all duration-[2000ms] ease-out ${
          videoEnded ? 'blur-sm brightness-75' : ''
        } object-cover sm:object-cover`}
        autoPlay
        muted
        playsInline
        style={{ 
          height: '150%',
          top: '-25%',
          objectPosition: 'center center'
        }}
      >
        <source src="https://dbh4s5ja0maaw.cloudfront.net/products/bc10000/1.mp4" type="video/mp4" />
      </video>
      
      {/* Progressive darkening overlay based on video progress */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${
            videoProgress > 0.75 
              ? 0.4 + (videoProgress - 0.75) * 0.4 // Start darkening from 75% (last 25%)
              : 0.4
          })`,
          transition: 'background-color 100ms linear' // Linear transition, no easing
        }}
      />
      
      {/* Minimalist text content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {showText && (
            <motion.div 
              className="text-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 4.0, 
                ease: "easeOut"
              }}
            >
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-1 sm:mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] tracking-tight leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 4.0, ease: "easeOut" }}
              >
                Bem-vindo ao EzPods
              </motion.h1>
              
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-gray-200 max-w-xl mx-auto drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)] px-2 font-medium tracking-wide leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 4.0, ease: "easeOut" }}
              >
                Descubra nossa coleção exclusiva de pods premium
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
