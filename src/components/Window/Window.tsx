'use client'

import React, { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { motion } from 'framer-motion'
import { WindowHeader } from './WindowHeader'
import { useWindowManager, type WindowState } from '@/context/WindowManagerContext'

interface WindowProps {
  window: WindowState
}

export function Window({ window }: WindowProps) {
  const { 
    focusWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    updateWindowPosition, 
    updateWindowSize 
  } = useWindowManager()

  const [isDragging, setIsDragging] = useState(false)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const Component = window.component

  const handleDragStart = () => {
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    setIsDragging(true)
  }

  const handleDrag = () => {
    // Currently dragging
  }

  const handleDragStop = (e: any, d: any) => {
    // Enforce topbar and dock boundaries
    const topbarHeight = 30
    const dockAreaHeight = 88 // 100px from bottom
    const viewportHeight = typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1080
    const viewportWidth = typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1920
    
    // Calculate new position based on motion wrapper + drag delta
    const newX = position.x + d.x
    const newY = position.y + d.y
    
    // Constrain position to avoid topbar and dock
    const constrainedX = Math.max(0, Math.min(newX, viewportWidth - window.width))
    const constrainedY = Math.max(topbarHeight, Math.min(newY, viewportHeight - dockAreaHeight - window.height))
    
    updateWindowPosition(window.id, constrainedX, constrainedY)
    
    // Reset dragging state after a brief delay to prevent re-animation
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false)
    }, 100)
  }

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    const newWidth = parseInt(ref.style.width)
    const newHeight = parseInt(ref.style.height)
    
    updateWindowSize(window.id, newWidth, newHeight)
    
    // Enforce boundaries after resize
    const topbarHeight = 32
    const dockAreaHeight = 100 // 100px from bottom
    const viewportHeight = typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1080
    const viewportWidth = typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1920
    
    // Constrain position to avoid topbar and dock (position is already correct from resize)
    const constrainedX = Math.max(0, Math.min(position.x, viewportWidth - newWidth))
    const constrainedY = Math.max(topbarHeight, Math.min(position.y, viewportHeight - dockAreaHeight - newHeight))
    
    updateWindowPosition(window.id, constrainedX, constrainedY)
  }

  const handleMouseDown = () => {
    focusWindow(window.id)
  }

  // Clear dragging state when maximize/minimize happens
  const handleMaximizeToggle = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    setIsDragging(false)
    maximizeWindow(window.id)
  }

  const handleMinimize = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    setIsDragging(false)
    minimizeWindow(window.id)
  }

  const handleClose = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    setIsDragging(false)
    closeWindow(window.id)
  }

  if (window.isMinimized) {
    return null
  }

  const position = window.isMaximized 
    ? { x: 3, y: 30 }
    : { x: window.x, y: window.y }

  const size = window.isMaximized
    ? { 
        width: (typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1920) - 6, 
        height: (typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1080) - 120 
      }
    : { width: window.width, height: window.height }

  // Use window bounds but we'll implement custom boundary checking
  const dragBounds = window.isMaximized ? undefined : "window"

  const currentTransition = isDragging
    ? { duration: 0 } // No animation during drag
    : { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }



  return (
    <motion.div
      animate={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      transition={currentTransition}
      style={{
        position: 'fixed',
        zIndex: window.zIndex,
      }}
    >
      <Rnd
        position={{ x: 0, y: 0 }}
        size={{ width: '100%', height: '100%' }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        onMouseDown={handleMouseDown}
        disableDragging={window.isMaximized}
        enableResizing={!window.isMaximized}
        dragHandleClassName="window-drag-handle"
        bounds={dragBounds}
        className="window rounded-xl overflow-hidden"
        minWidth={320}
        minHeight={240}
      >
      {/* Minimal Professional Window Container */}
      <motion.div   
        className="h-full flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1)
          `,
        }}
        animate={{
          scale: window.isMaximized ? 1 : 1,
          borderRadius: window.isMaximized ? '0px' : '12px',
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
                  {window.hasOwnHeader ? (
            // Component manages its own header
            <Component 
              onClose={handleClose}
              onMinimize={handleMinimize}
              onMaximize={handleMaximizeToggle}
              title={window.title}
            />
          ) : (
            <>
              <div className="window-drag-handle">
                {window.customHeader ? (
                  <window.customHeader
                    title={window.title}
                    onClose={handleClose}
                    onMinimize={handleMinimize}
                    onMaximize={handleMaximizeToggle}
                  />
                ) : (
                  <WindowHeader
                    title={window.title}
                    onClose={handleClose}
                    onMinimize={handleMinimize}
                    onMaximize={handleMaximizeToggle}
                  />
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <Component />
              </div>
            </>
          )}
      </motion.div>
    </Rnd>
    </motion.div>
  )
} 