'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DockAppConfig } from './dockConfig'

interface DockIconProps {
  app: DockAppConfig
  onLaunch: () => void
  index: number
  isRunning?: boolean
}

export function DockIcon({ app, onLaunch, index, isRunning = false }: DockIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Preload the image to prevent refetching
  useEffect(() => {
    if (app.iconPath) {
      const img = new Image()
      img.onload = () => setImageLoaded(true)
      img.onerror = () => setImageError(true)
      img.src = app.iconPath
    }
  }, [app.iconPath])

  return (
    <button
      className="relative flex items-center justify-center w-16 h-16 pb-1 transition-transform duration-200 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onLaunch}
      style={{
        background: 'transparent',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        zIndex: isHovered ? 50 : 10,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.9)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = isHovered ? 'scale(1)' : 'scale(1)'
      }}
    >
      {/* App icon - large icon in compact container */}
      {app.iconPath && !imageError && imageLoaded ? (
        <img
          src={app.iconPath}
          alt={app.name}
          width={100}
          height={100}
          className="pointer-events-none"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
            userSelect: 'none',
          }}
          draggable={false}
        />
      ) : (
        <span 
          className="text-5xl pointer-events-none"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
            userSelect: 'none',
          }}
        >
          {app.icon}
        </span>
      )}
      
      {/* Running indicator dot */}
      {isRunning && (
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/90 rounded-full pointer-events-none"
          style={{
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.9)',
          }}
        />
      )}
      
      {/* Tooltip */}
      {isHovered && (
        <motion.div
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium text-white rounded-md pointer-events-none whitespace-nowrap"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 100,
          }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {app.name}
        </motion.div>
      )}
    </button>
  )
} 