'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContextMenu, ContextMenuItem } from '@/context/ContextMenuContext'

export function ContextMenu() {
  const { contextMenu, closeContextMenu } = useContextMenu()

  const isOpen = !!contextMenu?.isOpen

  const isDark = useMemo(() => {
    if (typeof document === 'undefined') return false
    return (
      document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark')
    )
  }, [isOpen])

  if (!isOpen) return null

  const handleItemClick = (item: ContextMenuItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item.disabled) {
      item.onClick()
      closeContextMenu()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed select-none"
          style={{
            left: contextMenu!.x,
            top: contextMenu!.y,
            zIndex: 10000,
          }}
          initial={{ opacity: 0, scale: 0.98, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          onMouseDown={(e) => e.stopPropagation()}
        >
                      <div
            className={`container ${isDark ? '' : ''}`}
            style={{
              minWidth: '12rem',
              maxWidth: '14rem',
              padding: '0.5rem',
              backgroundColor: isDark
                ? 'hsla(var(--system-color-light-hsl, 240, 24%, 100%), .5)'
                : 'hsla(var(--system-color-light-hsl, 240, 24%, 100%), .8)',
              boxShadow: '#0000004d 0px 0px 6px 0px, inset 0 0 0 .9px hsla(0,0%,100%,.4)',
              borderRadius: '0.5rem',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitBackdropFilter: 'blur(15px)',
              backdropFilter: 'blur(15px)',
            }}
          >
            <div className="py-0">
              {contextMenu!.items.map((item) => (
                <React.Fragment key={item.id}>
                  {item.separator ? (
                    <div
                      className="divider"
                      style={{
                        height: '1px',
                        margin: '0.2rem 0.7rem 0.2rem 0.7rem',
                        background:
                          isDark
                            ? 'linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))'
                            : 'linear-gradient(to right, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06))',
                      }}
                    />
                  ) : (
                    <button
                      className="menu-item w-full text-left rounded px-1 py-1"
                      onClick={(e) => handleItemClick(item, e)}
                      disabled={item.disabled}
                      style={{
                        padding: '0.3rem 0.4rem ',
                      
                        fontSize: '12.5px',
                        fontWeight: '400',
                        color: item.disabled
                          ? (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)')
                          : (isDark ? 'rgba(10, 10, 10, 1)' : 'rgba(0,0,0,0.80)'),
                        cursor: item.disabled ? 'not-allowed' : 'pointer',
                        border: 'none',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (item.disabled) return
                        const btn = e.currentTarget as HTMLButtonElement
                        if (isDark) {
                          btn.style.backgroundColor = 'var(--system-color-primary, #0a85ff)'
                          btn.style.color = '#ffffff'
                        } else {
                          btn.style.backgroundColor = 'rgba(0,0,0,0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement
                        btn.style.backgroundColor = 'transparent'
                        btn.style.color = isDark ? 'rgba(10, 10, 10, 0.85)' : 'rgba(0,0,0,0.80)'
                      }}
                    >
                      {item.label}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 