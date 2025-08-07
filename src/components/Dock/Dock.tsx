'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DockIcon } from './DockIcon'
import { dockApps, trashConfig } from './dockConfig'
import { useWindowManager } from '@/context/WindowManagerContext'

export function Dock() {
  const { windows, openWindow } = useWindowManager()

  const handleLaunchApp = (appId: string) => {
    const app = dockApps.find(a => a.id === appId)
    if (!app) return

    // Create unique window ID for multiple instances
    const windowId = `${app.id}-${Date.now()}`
    
    openWindow({
      id: windowId,
      title: app.name,
      component: app.component,
      x: app.defaultPosition.x + Math.random() * 50, // Slight random offset
      y: app.defaultPosition.y + Math.random() * 50,
      width: app.defaultSize.width,
      height: app.defaultSize.height,
      isMinimized: false,
      isMaximized: false,
      customHeader: app.customHeader,
      hasOwnHeader: app.hasOwnHeader,
    })
  }

  const handleTrashClick = () => {
    // Placeholder for trash functionality
    console.log('Trash clicked')
  }

  // Check which apps are currently running
  const getRunningApps = () => {
    const runningAppIds = new Set()
    windows.forEach(window => {
      // Extract app ID from window ID (format: appId-timestamp)
      const appId = window.id.split('-')[0]
      runningAppIds.add(appId)
    })
    return runningAppIds
  }

  const runningApps = getRunningApps()

  return (
    <motion.div
      className="dock fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[9999]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Compact Dock Container */}
      <div
        className="flex items-center gap-1.5 px-1 py-1.5 rounded-2xl overflow-visible"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        {/* Main App Icons */}
        {dockApps.map((app, index) => (
          <DockIcon
            key={app.id}
            app={app}
            onLaunch={() => handleLaunchApp(app.id)}
            index={index}
            isRunning={runningApps.has(app.id)}
          />
        ))}
        
        {/* Divider */}
        <div 
          className="w-px h-15 mx-1.5"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3))',
          }}
        />
        
        {/* Trash Icon */}
        <DockIcon
          app={trashConfig}
          onLaunch={handleTrashClick}
          index={dockApps.length}
          isRunning={false}
        />
      </div>
      
      {/* Subtle bottom reflection */}
      <div 
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 blur-sm opacity-25"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
        }}
      />
    </motion.div>
  )
} 