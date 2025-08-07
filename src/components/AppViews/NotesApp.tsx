'use client'

import React, { useState } from 'react'

export function NotesApp() {
  const [notes, setNotes] = useState('Welcome to Notes!\n\nThis is a clean, elegant notes app with beautiful glass styling.\n\nStart typing your thoughts here...')

  return (
    <div className="h-full flex flex-col">
      {/* Content area */}
      <div className="flex-1 p-6">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-full resize-none border-none outline-none bg-transparent text-black/80 leading-relaxed placeholder:text-black/40 font-medium"
          placeholder="Start writing..."
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          }}
        />
      </div>
    </div>
  )
} 