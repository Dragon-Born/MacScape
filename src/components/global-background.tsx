'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'

export function GlobalBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className=" pointer-events-none z-0">
      {/* Base gradient background */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" /> */}
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(163,71,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(163,71,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Enhanced mesh gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(163,71,255,0.16),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,79,129,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(92,225,230,0.15),transparent_70%)]" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-br from-primary/4 via-secondary/3 to-tertiary/4 rounded-full blur-3xl"
        style={{ 
          y,
          x: useTransform(scrollY, [0, 500], [0, 50])
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-tertiary/6 via-primary/4 to-secondary/6 rounded-full blur-3xl"
        style={{ 
          y: useTransform(scrollY, [0, 500], [0, -80])
        }}
      />

      {/* Additional orbs for more coverage */}
      <motion.div 
        className="absolute top-2/3 left-1/4 w-64 h-64 bg-gradient-to-br from-secondary/3 via-tertiary/2 to-primary/3 rounded-full blur-3xl"
        style={{ 
          y: useTransform(scrollY, [0, 800], [0, 100])
        }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/3 w-80 h-80 bg-gradient-to-tr from-primary/2 via-secondary/3 to-tertiary/4 rounded-full blur-3xl"
        style={{ 
          y: useTransform(scrollY, [0, 600], [0, -60])
        }}
      />

      {/* Interactive mouse-following element */}
      <motion.div
        className="absolute w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl"
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      {/* Additional subtle patterns for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(92,225,230,0.02),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(163,71,255,0.02),transparent_40%)]" />
    </div>
  )
} 