'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  onClick: () => void
  disabled?: boolean
  separator?: boolean
}

export interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
  items: ContextMenuItem[]
  type: 'desktop' | 'dock-icon' | 'window'
  targetId?: string
}

interface ContextMenuContextType {
  contextMenu: ContextMenuState | null
  openContextMenu: (x: number, y: number, items: ContextMenuItem[], type: ContextMenuState['type'], targetId?: string) => void
  closeContextMenu: () => void
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined)

export function useContextMenu() {
  const context = useContext(ContextMenuContext)
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider')
  }
  return context
}

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const openContextMenu = useCallback((
    x: number, 
    y: number, 
    items: ContextMenuItem[], 
    type: ContextMenuState['type'],
    targetId?: string
  ) => {
    // Prevent context menu from going off-screen
    const menuWidth = 120
    const menuHeight = items.length * 32 + 12
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const adjustedX = x + menuWidth > viewportWidth ? viewportWidth - menuWidth - 10 : x
    const adjustedY = y + menuHeight > viewportHeight ? viewportHeight - menuHeight - 10 : y

    setContextMenu({
      isOpen: true,
      x: adjustedX,
      y: adjustedY,
      items,
      type,
      targetId
    })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  // Close context menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu?.isOpen) {
        closeContextMenu()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && contextMenu?.isOpen) {
        closeContextMenu()
      }
    }

    if (contextMenu?.isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu?.isOpen, closeContextMenu])

  // Prevent default context menu
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  return (
    <ContextMenuContext.Provider value={{
      contextMenu,
      openContextMenu,
      closeContextMenu
    }}>
      {children}
    </ContextMenuContext.Provider>
  )
} 