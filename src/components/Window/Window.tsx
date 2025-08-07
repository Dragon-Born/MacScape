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
    updateWindowPosition(window.id, d.x, d.y)
  }

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    updateWindowSize(
      window.id,
      parseInt(ref.style.width),
      parseInt(ref.style.height)
    )
    updateWindowPosition(window.id, position.x, position.y)
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
      style={{
        zIndex: window.zIndex,
      }}
      className="rounded-xl overflow-hidden"
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