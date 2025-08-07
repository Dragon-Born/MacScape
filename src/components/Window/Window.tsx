'use client'

import React from 'react'
import { Rnd } from 'react-rnd'
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

  const Component = window.component

  const handleDragStop = (e: any, d: any) => {
    // Enforce topbar and dock boundaries
    const topbarHeight = 32
    const dockAreaHeight = 120 // Dock height + margins
    const viewportHeight = typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1080
    const viewportWidth = typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1920
    
    // Constrain position to avoid topbar and dock
    const constrainedX = Math.max(0, Math.min(d.x, viewportWidth - window.width))
    const constrainedY = Math.max(topbarHeight, Math.min(d.y, viewportHeight - dockAreaHeight - window.height))
    
    updateWindowPosition(window.id, constrainedX, constrainedY)
  }

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    const newWidth = parseInt(ref.style.width)
    const newHeight = parseInt(ref.style.height)
    
    updateWindowSize(window.id, newWidth, newHeight)
    
    // Enforce boundaries after resize
    const topbarHeight = 32
    const dockAreaHeight = 120 // Dock height + margins
    const viewportHeight = typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1080
    const viewportWidth = typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1920
    
    // Constrain position to avoid topbar and dock
    const constrainedX = Math.max(0, Math.min(position.x, viewportWidth - newWidth))
    const constrainedY = Math.max(topbarHeight, Math.min(position.y, viewportHeight - dockAreaHeight - newHeight))
    
    updateWindowPosition(window.id, constrainedX, constrainedY)
  }

  const handleMouseDown = () => {
    focusWindow(window.id)
  }

  if (window.isMinimized) {
    return null
  }

  const position = window.isMaximized 
    ? { x: 0, y: 0 }
    : { x: window.x, y: window.y }

  const size = window.isMaximized
    ? { width: '100vw', height: '100vh' }
    : { width: window.width, height: window.height }

  // Use window bounds but we'll implement custom boundary checking
  const dragBounds = window.isMaximized ? undefined : "window"

  return (
    <Rnd
      position={position}
      size={size}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onMouseDown={handleMouseDown}
      disableDragging={window.isMaximized}
      enableResizing={!window.isMaximized}
      dragHandleClassName="window-drag-handle"
      bounds={dragBounds}
      style={{
        zIndex: window.zIndex,
      }}
      className="window rounded-xl overflow-hidden"
      minWidth={320}
      minHeight={240}
    >
      {/* Minimal Professional Window Container */}
      <div 
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
      >
        {window.hasOwnHeader ? (
          // Component manages its own header
          <Component 
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            title={window.title}
          />
        ) : (
          <>
            <div className="window-drag-handle">
              {window.customHeader ? (
                <window.customHeader
                  title={window.title}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onMaximize={() => maximizeWindow(window.id)}
                />
              ) : (
                <WindowHeader
                  title={window.title}
                  onClose={() => closeWindow(window.id)}
                  onMinimize={() => minimizeWindow(window.id)}
                  onMaximize={() => maximizeWindow(window.id)}
                />
              )}
            </div>
            
            <div className="flex-1 overflow-hidden">
              <Component />
            </div>
          </>
        )}
      </div>
    </Rnd>
  )
} 