'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DockAppConfig } from './dockConfig'
import { useContextMenu, ContextMenuItem } from '@/context/ContextMenuContext'

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
  const [isBouncing, setIsBouncing] = useState(false)
  const { openContextMenu } = useContextMenu()

  // Preload the image to prevent refetching
  useEffect(() => {
    if (app.iconPath) {
      const img = new Image()
      img.onload = () => setImageLoaded(true)
      img.onerror = () => setImageError(true)
      img.src = app.iconPath
    }
  }, [app.iconPath])

  const handleClick = () => {
    setIsBouncing(true)
    onLaunch()
    // Reset bounce after animation (even slower like real macOS)
    setTimeout(() => setIsBouncing(false), 1000)
  }

  const getDockContextMenuItems = (): ContextMenuItem[] => {
    const baseItems: ContextMenuItem[] = [
      {
        id: 'open',
        label: `Open ${app.name}`,
        onClick: () => onLaunch()
      }
    ]

    if (isRunning) {
      baseItems.push(
        {
          id: 'separator-1',
          label: '',
          separator: true,
          onClick: () => {}
        },
        {
          id: 'hide',
          label: `Hide ${app.name}`,
          onClick: () => console.log(`Hide ${app.name}`)
        },
        {
          id: 'quit',
          label: `Quit ${app.name}`,
          onClick: () => console.log(`Quit ${app.name}`)
        }
      )
    }

    if (!app.isTrash) {
      baseItems.push(
        {
          id: 'separator-2',
          label: '',
          separator: true,
          onClick: () => {}
        },
        {
          id: 'options',
          label: 'Options',
          onClick: () => console.log(`${app.name} options`)
        },
        {
          id: 'remove-from-dock',
          label: 'Remove from Dock',
          onClick: () => console.log(`Remove ${app.name} from dock`)
        }
      )
    }

    return baseItems
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    openContextMenu(
      e.clientX,
      e.clientY,
      getDockContextMenuItems(),
      'dock-icon',
      app.id
    )
  }

  return (
    <motion.button
      className="relative flex items-center justify-center w-16 h-16 pb-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{
        background: 'transparent',
        zIndex: isHovered ? 50 : 10,
      }}
      animate={{
        scale: isHovered ? 1.05 : 1,
        y: isBouncing ? [0, -20, 0] : 0,
      }}
      transition={{
        scale: { duration: 0.2, ease: 'easeOut' },
        y: { 
          duration: 1.0, 
          ease: [0.25, 0.46, 0.45, 0.94],
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        }
      }}
      whileTap={{ scale: 0.9 }}
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
    </motion.button>
  )
} 