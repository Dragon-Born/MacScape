'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Window } from './Window/Window'
import { useWindowManager } from '@/context/WindowManagerContext'
import { useContextMenu, ContextMenuItem } from '@/context/ContextMenuContext'
import { NotesApp } from './AppViews/NotesApp'
import { Dock } from './Dock/Dock'
import { TopBar } from './TopBar'
import { ContextMenu } from './ui/ContextMenu'

export function Desktop() {
  const { windows, openWindow } = useWindowManager()
  const { openContextMenu } = useContextMenu()
  const initializedRef = useRef(false)

  // Selection rectangle state
  const [isSelecting, setIsSelecting] = useState(false)
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null)
  const [selectionCurrent, setSelectionCurrent] = useState<{ x: number; y: number } | null>(null)

  const selectionRect = useMemo(() => {
    if (!isSelecting || !selectionStartRef.current || !selectionCurrent) return null
    const x1 = selectionStartRef.current.x
    const y1 = selectionStartRef.current.y
    const x2 = selectionCurrent.x
    const y2 = selectionCurrent.y
    const left = Math.min(x1, x2)
    const top = Math.min(y1, y2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)
    return { left, top, width, height }
  }, [isSelecting, selectionCurrent])

  // While selecting, disable text/icon selection globally
  useEffect(() => {
    if (!isSelecting) return
    const bodyStyle = document.body.style as any
    const prevUserSelect = bodyStyle.userSelect
    const prevWebkitUserSelect = bodyStyle.webkitUserSelect
    const prevMsUserSelect = bodyStyle.msUserSelect
    bodyStyle.userSelect = 'none'
    bodyStyle.webkitUserSelect = 'none'
    bodyStyle.msUserSelect = 'none'
    return () => {
      bodyStyle.userSelect = prevUserSelect
      bodyStyle.webkitUserSelect = prevWebkitUserSelect
      bodyStyle.msUserSelect = prevMsUserSelect
    }
  }, [isSelecting])

  // Desktop context menu items
  const getDesktopContextMenuItems = (): ContextMenuItem[] => [
    {
      id: 'new-folder',
      label: 'New Folder',
      onClick: () => console.log('Create new folder')
    },
    {
      id: 'separator-1',
      label: '',
      separator: true,
      onClick: () => {}
    },
    {
      id: 'get-info',
      label: 'Get Info',
      onClick: () => console.log('Get desktop info')
    },
    {
      id: 'separator-2',
      label: '',
      separator: true,
      onClick: () => {}
    },
    {
      id: 'change-wallpaper',
      label: 'Change Desktop Background...',
      onClick: () => console.log('Change wallpaper')
    },
    {
      id: 'use-stacks',
      label: 'Use Stacks',
      onClick: () => console.log('Toggle stacks')
    },
    {
      id: 'separator-3',
      label: '',
      separator: true,
      onClick: () => {}
    },
    {
      id: 'show-view-options',
      label: 'Show View Options',
      onClick: () => console.log('Show view options')
    }
  ]

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only show context menu if clicking on the desktop background (not on windows or dock)
    const target = e.target as HTMLElement
    if (target.closest('.window') || target.closest('.dock')) {
      return
    }

    openContextMenu(
      e.clientX,
      e.clientY,
      getDesktopContextMenuItems(),
      'desktop'
    )
  }

  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    // Only start selection on primary button (no Ctrl+click)
    if (e.button !== 0 || e.ctrlKey) return

    const target = e.target as HTMLElement
    // Ignore clicks that originate over windows, dock, or within the topbar area
    const TOPBAR_HEIGHT_PX = 30
    if (target.closest('.window') || target.closest('.dock') || e.clientY <= TOPBAR_HEIGHT_PX) {
      return
    }

    // Prevent native text/image selection start
    e.preventDefault()

    setIsSelecting(true)
    const startPoint = { x: e.clientX, y: e.clientY }
    selectionStartRef.current = startPoint
    setSelectionCurrent(startPoint)

    const handleMove = (ev: MouseEvent) => {
      setSelectionCurrent({ x: ev.clientX, y: ev.clientY })
    }

    const handleUp = () => {
      setIsSelecting(false)
      selectionStartRef.current = null
      setSelectionCurrent(null)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp, { once: true })
  }

  // Open a sample notes window on mount for demonstration
  useEffect(() => {
    if (!initializedRef.current) {
    //   openWindow({
    //     id: 'notes-1',
    //     title: 'Notes',
    //     component: NotesApp,
    //     x: 100,
    //     y: 100,
    //     width: 600,
    //     height: 400,
    //     isMinimized: false,
    //     isMaximized: false,
    //   })
      initializedRef.current = true
    }
  }, [openWindow]) // Added openWindow to dependencies

  return (
    <div 
      className={`h-screen w-screen relative overflow-hidden ${isSelecting ? 'select-none' : ''}`}
      onContextMenu={handleDesktopContextMenu}
      onMouseDown={handleDesktopMouseDown}
      onDragStart={(e) => { if (isSelecting) e.preventDefault() }}
    >
      {/* Beautiful Purple SVG Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/Desktop/bg-purple.svg)',
        }}
      />

      {/* Selection rectangle overlay */}
      {selectionRect && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: selectionRect.left,
            top: selectionRect.top,
            width: selectionRect.width,
            height: selectionRect.height,
            zIndex: 100,
            border: '0.1px solid rgba(255, 255, 255, 0.5)', // macOS light
            background: 'rgba(255, 255, 255, 0.08)', // macOS light
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          }}
        />
      )}

      {/* TopBar */}
      <TopBar />

      {/* Windows */}
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}

      {/* Dock */}
      <Dock />

      {/* Context Menu */}
      <ContextMenu />
    </div>
  )
} 