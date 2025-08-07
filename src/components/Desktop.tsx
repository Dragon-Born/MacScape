'use client'

import React, { useEffect, useRef } from 'react'
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
      className="h-screen w-screen relative overflow-hidden"
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Beautiful Purple SVG Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/Desktop/bg-purple.svg)',
        }}
      />

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