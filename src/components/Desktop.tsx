'use client'

import React, { useEffect, useRef } from 'react'
import { Window } from './Window/Window'
import { useWindowManager } from '@/context/WindowManagerContext'
import { NotesApp } from './AppViews/NotesApp'
import { Dock } from './Dock/Dock'
import { TopBar } from './TopBar'

export function Desktop() {
  const { windows, openWindow } = useWindowManager()
  const initializedRef = useRef(false)

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
  }, []) // Empty dependency array - only run once

  return (
    <div className="h-screen w-screen relative overflow-hidden">
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
    </div>
  )
} 