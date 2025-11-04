"use client"

import { motion } from 'framer-motion'

interface DecorativeAccentProps {
  variant?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  color?: 'blue' | 'green' | 'gradient'
}

export default function DecorativeAccent({ 
  variant = 'top-right', 
  color = 'gradient' 
}: DecorativeAccentProps) {
  const positions = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  }

  const colors = {
    blue: 'from-vibrant-blue/20 to-sky-blue/10',
    green: 'from-phthalo-green/20 to-sky-blue/10',
    gradient: 'from-vibrant-blue/15 via-phthalo-green/10 to-sky-blue/5'
  }

  return (
    <div className={`absolute ${positions[variant]} w-32 h-32 sm:w-48 sm:h-48 overflow-hidden pointer-events-none opacity-50`}>
      <motion.div
        className={`w-full h-full bg-gradient-to-br ${colors[color]} rounded-full blur-3xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
