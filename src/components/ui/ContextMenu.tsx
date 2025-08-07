'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContextMenu, ContextMenuItem } from '@/context/ContextMenuContext'

export function ContextMenu() {
  const { contextMenu, closeContextMenu } = useContextMenu()

  if (!contextMenu?.isOpen) return null

  const handleItemClick = (item: ContextMenuItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item.disabled) {
      item.onClick()
      closeContextMenu()
    }
  }

  return (
    <AnimatePresence>
      {contextMenu.isOpen && (
        <motion.div
          className="fixed z-[9999] w-[120px] select-none"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{
            duration: 0.15,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="backdrop-blur-xl rounded-md shadow-2xl border overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: `
                0 10px 40px rgba(0, 0, 0, 0.2),
                0 4px 12px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.6)
              `,
            }}
          >
            <div className="py-0.5">
              {contextMenu.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {item.separator ? (
                    <div 
                      className="mx-1.5 my-0.5 border-t"
                      style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
                    />
                  ) : (
                    <button
                      className={`
                        w-full px-1 py-1 text-left text-xs transition-all duration-150
                        ${item.disabled 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-800 cursor-pointer'
                        }
                      `}
                      onClick={(e) => handleItemClick(item, e)}
                      disabled={item.disabled}
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                        fontSize: '12px',
                        fontWeight: '400',
                      }}
                      onMouseEnter={(e) => {
                        if (!item.disabled) {
                          const target = e.currentTarget
                          const hoverBg = target.querySelector('.hover-bg') as HTMLElement
                          const textEl = target.querySelector('.hover-text') as HTMLElement
                          if (hoverBg) {
                            hoverBg.style.backgroundColor = 'rgb(59, 130, 246)'
                          }
                          if (textEl) {
                            textEl.style.color = 'white'
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget
                        const hoverBg = target.querySelector('.hover-bg') as HTMLElement
                        const textEl = target.querySelector('.hover-text') as HTMLElement
                        if (hoverBg) {
                          hoverBg.style.backgroundColor = 'transparent'
                        }
                        if (textEl) {
                          textEl.style.color = 'rgb(31, 41, 55)' // text-gray-800
                        }
                      }}
                    >
                      <div 
                        className="hover-bg transition-all duration-150 rounded px-2 py-1.5 mx-1"
                        style={{ backgroundColor: 'transparent' }}
                      >
                        <span className="hover-text transition-colors duration-150">
                          {item.label}
                        </span>
                      </div>
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