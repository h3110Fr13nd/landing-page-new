"use client"

import { motion, HTMLMotionProps, Variants } from 'framer-motion'
import { ReactNode } from 'react'

// Gradient text component matching landing page style
interface GradientTextProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'accent'
}

export function GradientText({ children, className = '', variant = 'primary' }: GradientTextProps) {
  const gradients = {
    primary: 'from-navy-blue via-vibrant-blue to-phthalo-green',
    secondary: 'from-vibrant-blue via-phthalo-green to-navy-blue',
    accent: 'from-phthalo-green via-sky-blue to-vibrant-blue'
  }

  return (
    <span className={`bg-gradient-to-r ${gradients[variant]} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

// Fade in animation wrapper
interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = '',
  ...props 
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Slide in from side
interface SlideInProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'left', 
  delay = 0, 
  duration = 0.5,
  className = '',
  ...props 
}: SlideInProps) {
  const directions = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: 50 },
    down: { x: 0, y: -50 }
  }

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
        y: 0
      }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated card with hover effect
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  className?: string
  hoverScale?: boolean
  glowOnHover?: boolean
}

export function AnimatedCard({ 
  children, 
  className = '', 
  hoverScale = true,
  glowOnHover = false,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverScale ? { 
        scale: 1.02,
        ...(glowOnHover && {
          boxShadow: '0 0 30px rgba(29, 111, 225, 0.2)'
        })
      } : undefined}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Staggered children container
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.1 }: StaggerContainerProps) {
  const customVariants: Variants = {
    ...containerVariants,
    visible: {
      ...containerVariants.visible,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  return (
    <motion.div
      variants={customVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

// Premium button with gradient border
interface GradientBorderButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function GradientBorderButton({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  type = 'button'
}: GradientBorderButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`relative px-6 py-3 rounded-lg bg-white overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-navy-blue via-vibrant-blue to-phthalo-green">
        <div className="w-full h-full bg-white rounded-lg" />
      </div>
      <span className="relative z-10 font-medium bg-gradient-to-r from-navy-blue via-vibrant-blue to-phthalo-green bg-clip-text text-transparent">
        {children}
      </span>
    </motion.button>
  )
}

// Floating element with ambient animation
interface FloatingElementProps {
  children: ReactNode
  className?: string
  duration?: number
  delay?: number
}

export function FloatingElement({ 
  children, 
  className = '',
  duration = 6,
  delay = 0
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -15, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
