'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface WindowState {
  id: string
  title: string
  component: React.ComponentType<any>
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  customHeader?: React.ComponentType<{
    title: string
    onClose: () => void
    onMinimize: () => void
    onMaximize: () => void
  }>
  hasOwnHeader?: boolean
}

interface WindowManagerContextType {
  windows: WindowState[]
  openWindow: (window: Omit<WindowState, 'zIndex'>) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void
  getTopZIndex: () => number
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined)

export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider')
  }
  return context
}

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [highestZIndex, setHighestZIndex] = useState(1000)

  const getTopZIndex = useCallback(() => {
    return highestZIndex + 1
  }, [highestZIndex])

  const openWindow = useCallback((window: Omit<WindowState, 'zIndex'>) => {
    const newZIndex = getTopZIndex()
    setHighestZIndex(newZIndex)
    
    setWindows(prev => {
      // Check if window already exists
      const existingIndex = prev.findIndex(w => w.id === window.id)
      if (existingIndex !== -1) {
        // Focus existing window
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], zIndex: newZIndex, isMinimized: false }
        return updated
      }
      
      // Add new window
      return [...prev, { ...window, zIndex: newZIndex }]
    })
  }, [getTopZIndex])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ))
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ))
  }, [])

  const focusWindow = useCallback((id: string) => {
    const newZIndex = getTopZIndex()
    setHighestZIndex(newZIndex)
    
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: newZIndex, isMinimized: false } : w
    ))
  }, [getTopZIndex])

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, x, y } : w
    ))
  }, [])

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, width, height } : w
    ))
  }, [])

  return (
    <WindowManagerContext.Provider value={{
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      getTopZIndex
    }}>
      {children}
    </WindowManagerContext.Provider>
  )
} 