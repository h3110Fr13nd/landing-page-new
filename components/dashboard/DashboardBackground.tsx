"use client"

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function DashboardBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* More visible gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-soft-white via-sky-blue/40 to-phthalo-green/20" />
      
      {/* Larger, more visible flowing shape */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[120vw] h-[120vh]"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full relative">
          <motion.div
            className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 40%, rgba(29, 111, 225, 0.25), rgba(10, 61, 46, 0.15), transparent 70%)',
              filter: 'blur(90px)'
            }}
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -60, 50, 0],
              scale: [1, 1.3, 0.9, 1],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      {/* Larger secondary shape */}
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 w-[100vw] h-[100vh]"
        animate={{
          rotate: [0, -180, -360],
          scale: [0.9, 1.15, 0.9],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle at 60% 30%, rgba(10, 61, 46, 0.2), rgba(29, 111, 225, 0.12), transparent 70%)',
            filter: 'blur(80px)'
          }}
          animate={{
            x: [0, -100, 60, 0],
            y: [0, 80, -50, 0],
            scale: [1, 0.8, 1.4, 1],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* More prominent ambient light spots */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(199, 224, 244, 0.35), transparent 60%)',
          filter: 'blur(70px)'
        }}
        animate={{
          x: [-120, 120, -120],
          y: [-60, 60, -60],
          scale: [0.8, 1.3, 0.8],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Additional vibrant blob */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(29, 111, 225, 0.2), rgba(199, 224, 244, 0.15), transparent 65%)',
          filter: 'blur(75px)'
        }}
        animate={{
          x: [0, -80, 80, 0],
          y: [0, 100, -80, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
