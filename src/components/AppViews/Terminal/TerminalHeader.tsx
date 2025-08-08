'use client'

import React from 'react'
import { X, Minus, Square } from 'lucide-react'

interface TerminalHeaderProps {
  title: string
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
}

export function TerminalHeader({ title, onClose, onMinimize, onMaximize }: TerminalHeaderProps) {
  return (
    <div
      className="flex items-center justify-between border-b px-4 py-2 select-none"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px) saturate(150%)',
        WebkitBackdropFilter: 'blur(10px) saturate(150%)',
        borderBottomColor: 'rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Traffic lights */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onClose}
          className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
          style={{
            background: '#ff5f57',
            border: '0.5px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          aria-label="Close"
        >
          <X className="w-3 h-3 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2.5} />
        </button>
        <button
          onClick={onMinimize}
          className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
          style={{
            background: '#ffbd2e',
            border: '0.5px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          aria-label="Minimize"
        >
          <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2.5} />
        </button>
        <button
          onClick={onMaximize}
          className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
          style={{
            background: '#28ca42',
            border: '0.5px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          aria-label="Maximize"
        >
          <Square className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2} />
        </button>
      </div>

      {/* Center title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
        <h3 className="text-[14px] font-medium tracking-tight" style={{ color: 'rgba(0,0,0,0.65)' }}>{title}</h3>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            // bubble a custom event to the TerminalView container
            const btn = e.currentTarget as HTMLElement
            btn.dispatchEvent(new CustomEvent('terminal-theme-toggle', { bubbles: true }))
          }}
          className="px-2 py-0 rounded text-[11px]"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(0,0,0,0.7)' }}
        >
          Theme
        </button>
      </div>
    </div>
  )
} 