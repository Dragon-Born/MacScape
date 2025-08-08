'use client'

import React, { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { motion } from 'framer-motion'
import { WindowHeader } from './WindowHeader'
import { useWindowManager, type WindowState } from '@/context/WindowManagerContext'

interface WindowProps {
  window: WindowState
}

export function Window({ window }: WindowProps) {
  const { 
    windows,
    focusWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    updateWindowPosition, 
    updateWindowSize 
  } = useWindowManager()

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [isMinimizing, setIsMinimizing] = useState(false)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const minimizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const ignoreNextDragStopRef = useRef<boolean>(false)
  const hasRealDragRef = useRef<boolean>(false)
  const lastResizeAtRef = useRef<number>(0)
  const lastResizeTouchedLeftOrTopRef = useRef<boolean>(false)
  const debugSeqRef = useRef<number>(0)
  const lastEventAtRef = useRef<number>(0)
  const debugLog = (label: string, data?: Record<string, any>) => {
    const seq = ++debugSeqRef.current
    const now = Date.now()
    const sinceMs = lastEventAtRef.current ? now - lastEventAtRef.current : 0
    lastEventAtRef.current = now
    try {
      console.log(`[Window][${label}]`, { seq, sinceMs, id: window.id, ...(data || {}) })
    } catch {}
  }
  const Component = window.component

  const handleDragStart = (e: any) => {
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    // Start of a potential drag. Do not clear suppression here; we will clear only if movement is real.
    hasRealDragRef.current = false
    const targetEl = (e?.target as HTMLElement) || null
    const headerEl = targetEl ? targetEl.closest('.window-drag-handle') : null
    if (!headerEl) {
      debugLog('DragStart[Ignored:NotHeader]', {
        targetTag: (e?.target as HTMLElement)?.tagName,
        targetClasses: (e?.target as HTMLElement)?.className,
      })
      return
    }
    setIsDragging(true)
    debugLog('DragStart')
  }

  const handleDrag = (_e: any, d: { x: number; y: number }) => {
    // Mark as a real drag if movement exceeds a small threshold
    if (!hasRealDragRef.current) {
      const distance = Math.abs(d.x) + Math.abs(d.y)
      const withinCooldown = Date.now() - lastResizeAtRef.current < 200
      const threshold = withinCooldown && lastResizeTouchedLeftOrTopRef.current ? 12 : 3
      if (distance > threshold) {
        hasRealDragRef.current = true
        debugLog('Drag[ThresholdCrossed]', { distance, threshold, withinCooldown, lastResizeTouchedLeftOrTop: lastResizeTouchedLeftOrTopRef.current })
      }
    }
  }

  const handleResizeStart = () => {
    // Clear any existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    setIsResizing(true)
    debugLog('ResizeStart', {
      x: window.x,
      y: window.y,
      width: window.width,
      height: window.height,
      flags: {
        isDragging,
        isResizing,
        ignoreNextDragStop: ignoreNextDragStopRef.current,
        hasRealDrag: hasRealDragRef.current,
      }
    })
  }

  const handleDragStop = (e: any, d: any) => {
    // Ignore if no drag actually started (guards against ghost dragStops after resize)
    if (!isDragging) {
      debugLog('DragStop[Ignored:NoDragStart]', { deltaX: d?.x, deltaY: d?.y })
      return
    }

    // Ignore drag stop if we are in the middle of a resize lifecycle
    if (isResizing) {
      debugLog('DragStop[Ignored:Resizing]', { deltaX: d?.x, deltaY: d?.y, isResizing })
      setIsDragging(false)
      return
    }

    // Ignore only the very next dragStop after a resize if there was no real movement
    const withinCooldown = Date.now() - lastResizeAtRef.current < 200
    const distance = Math.abs(d?.x ?? 0) + Math.abs(d?.y ?? 0)
    if (ignoreNextDragStopRef.current && withinCooldown && !hasRealDragRef.current) {
      debugLog('DragStop[Ignored:PostResizeGhost]', { deltaX: d?.x, deltaY: d?.y, withinCooldown, hasRealDrag: hasRealDragRef.current })
      ignoreNextDragStopRef.current = false
      setIsDragging(false)
      return
    }
    // If we had suppression but user actually dragged, clear suppression and proceed
    if (ignoreNextDragStopRef.current && hasRealDragRef.current) {
      ignoreNextDragStopRef.current = false
    }
    // Enforce topbar and dock boundaries
    const topbarHeight = 30
    const dockAreaHeight = 88 // 100px from bottom
    const viewportHeight = typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1080
    const viewportWidth = typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1920
    
    // Calculate new position based on motion wrapper + drag delta
    const newX = position.x + d.x
    const newY = position.y + d.y
    
    // Constrain position to avoid topbar and dock
    const constrainedX = Math.max(0, Math.min(newX, viewportWidth - window.width))
    const constrainedY = Math.max(topbarHeight, Math.min(newY, viewportHeight - dockAreaHeight - window.height))
    
    debugLog('DragStop', {
      deltaX: d.x,
      deltaY: d.y,
      startPos: { x: position.x, y: position.y },
      proposed: { x: newX, y: newY },
      constrained: { x: constrainedX, y: constrainedY },
      size: { width: window.width, height: window.height },
      viewport: { w: viewportWidth, h: viewportHeight },
      flags: {
        isDragging,
        isResizing,
        ignoreNextDragStop: ignoreNextDragStopRef.current,
        hasRealDrag: hasRealDragRef.current,
        lastResizeAt: lastResizeAtRef.current,
        withinCooldown,
        lastResizeTouchedLeftOrTop: lastResizeTouchedLeftOrTopRef.current,
      }
    })

    updateWindowPosition(window.id, constrainedX, constrainedY)
    
    // Reset dragging state after a brief delay to prevent re-animation
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false)
    }, 100)
  }

  const handleResizeStop = (e: any, direction: string, ref: any, delta: { width: number; height: number }, position: any) => {
    const MIN_WIDTH = 320
    const MIN_HEIGHT = 240

    // Determine which edges actually moved
    const dir = (direction || '').toLowerCase()
    const isLeft = dir.includes('left')
    const isRight = dir.includes('right')
    const isTop = dir.includes('top')
    const isBottom = dir.includes('bottom')

    // Apply width change only for left/right resizes; height only for top/bottom
    const appliedDeltaWidth = (isLeft || isRight) ? (delta?.width ?? 0) : 0
    const appliedDeltaHeight = (isTop || isBottom) ? (delta?.height ?? 0) : 0

    // Compute new size from previous size + applied delta
    const computedWidth = Math.max(MIN_WIDTH, window.width + appliedDeltaWidth)
    const computedHeight = Math.max(MIN_HEIGHT, window.height + appliedDeltaHeight)

    // Compute new global position based on which edges moved
    let proposedGlobalX = window.x
    let proposedGlobalY = window.y
    const reportedOffsetX = position?.x ?? 0
    const reportedOffsetY = position?.y ?? 0
    if (isLeft) {
      // Use Rnd-reported offset to match actual handle movement (handles min-size overflow gracefully)
      proposedGlobalX = window.x + reportedOffsetX
    }
    if (isTop) {
      proposedGlobalY = window.y + reportedOffsetY
    }

    // Enforce boundaries after resize
    const topbarHeight = 32
    const dockAreaHeight = 100 // 100px from bottom
    const viewportHeight = typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1080
    const viewportWidth = typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1920

    const constrainedX = Math.max(0, Math.min(proposedGlobalX, viewportWidth - computedWidth))
    const constrainedY = Math.max(topbarHeight, Math.min(proposedGlobalY, viewportHeight - dockAreaHeight - computedHeight))

    debugLog('ResizeStop', {
      direction,
      dirLower: dir,
      isLeft,
      isRight,
      isTop,
      isBottom,
      delta,
      appliedDelta: { width: appliedDeltaWidth, height: appliedDeltaHeight },
      rndReportedPosition: position,
      before: { x: window.x, y: window.y, width: window.width, height: window.height },
      computed: { width: computedWidth, height: computedHeight },
      after: { x: proposedGlobalX, y: proposedGlobalY, width: computedWidth, height: computedHeight },
      constrained: { x: constrainedX, y: constrainedY },
      viewport: { w: viewportWidth, h: viewportHeight },
      flags: {
        ignoreNextDragStop: ignoreNextDragStopRef.current,
        hasRealDrag: hasRealDragRef.current,
      }
    })

    updateWindowSize(window.id, computedWidth, computedHeight)
    updateWindowPosition(window.id, constrainedX, constrainedY)

    // Suppress the next dragStop that can be emitted immediately after resize
    ignoreNextDragStopRef.current = true
    lastResizeAtRef.current = Date.now()
    lastResizeTouchedLeftOrTopRef.current = isLeft || isTop
    hasRealDragRef.current = false

    // Reset resizing state after a brief delay to prevent re-animation
    resizeTimeoutRef.current = setTimeout(() => {
      setIsResizing(false)
    }, 100)
  }

  const handleMouseDown = () => {
    const topZ = windows.length ? Math.max(...windows.map(w => w.zIndex)) : window.zIndex
    if (window.zIndex === topZ) {
      debugLog('MouseDownFocus[Ignored:AlreadyTop]', { zIndex: window.zIndex })
      return
    }
    focusWindow(window.id)
    debugLog('MouseDownFocus', { zIndex: window.zIndex })
  }

  // Clear dragging and resizing state when maximize/minimize happens
  const handleMaximizeToggle = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current)
    }
    setIsDragging(false)
    setIsResizing(false)
    setIsZooming(true)
    maximizeWindow(window.id)
    // End zoom mode after animation duration
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZooming(false)
    }, 320)
  }

  const handleMinimize = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    if (minimizeTimeoutRef.current) {
      clearTimeout(minimizeTimeoutRef.current)
    }
    setIsDragging(false)
    setIsResizing(false)
    // Animate out, then actually minimize in context
    setIsMinimizing(true)
    minimizeTimeoutRef.current = setTimeout(() => {
      setIsMinimizing(false)
      minimizeWindow(window.id)
    }, 280)
  }

  const handleClose = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    setIsDragging(false)
    setIsResizing(false)
    closeWindow(window.id)
  }

  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.altKey) {
      handleMinimize()
    } else {
      handleMaximizeToggle()
    }
  }


  const position = window.isMaximized 
    ? { x: 3, y: 30 }
    : { x: window.x, y: window.y }

  const size = window.isMaximized
    ? { 
        width: (typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1920) - 6, 
        height: (typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1080) - 120 
      }
    : { width: window.width, height: window.height }

  // Use window bounds but we'll implement custom boundary checking
  const dragBounds = window.isMaximized ? undefined : "window"

  const currentTransition = (isDragging || isResizing)
    ? { duration: 0 } // No animation during drag or resize
    : { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }

   // Keep component mounted when minimized; just hide it visually
  const isHidden = window.isMinimized && !isMinimizing

  // Determine if this window is the active (top-most) one
  const topZ = windows.length ? Math.max(...windows.map(w => w.zIndex)) : window.zIndex
  const isActiveWindow = window.zIndex === topZ


  return (
    <motion.div
      animate={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        opacity: isMinimizing ? 0 : 1,
        scale: isMinimizing ? 0.92 : 1,
      }}
      transition={currentTransition}
      style={{
        position: 'fixed',
        zIndex: window.zIndex,
        pointerEvents: isHidden ? 'none' : 'auto',
        display: isHidden ? 'none' : 'block',
        // Shadow now applied on the Rnd container so it moves during drag/resize
      }}
    >
      <Rnd
        position={{ x: 0, y: 0 }}
        size={ (isZooming || window.isMaximized)
          ? { width: '100%', height: '100%' }
          : { width: size.width, height: size.height }
        }
        style={{
          borderRadius: window.isMaximized ? '0px' : '12px',
          boxShadow: isActiveWindow
            ? '0 18px 30px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.12)'
            : '0 12px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 180ms ease, border-radius 180ms ease',
        }}
        cancel=".react-resizable-handle"
        default={{ x: 0, y: 0, width: size.width, height: size.height }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        onMouseDown={handleMouseDown}
        disableDragging={window.isMaximized}
        enableResizing={!window.isMaximized}
        dragHandleClassName="window-drag-handle"
        bounds={dragBounds}
        className="window rounded-xl overflow-hidden"
        minWidth={320}
        minHeight={240}
      >
       {/* Minimal Professional Window Container */}
       <motion.div   
         className="h-full flex flex-col"
         style={{
           background: 'rgba(255, 255, 255, 0.65)',
           backdropFilter: 'blur(20px) saturate(150%)',
           WebkitBackdropFilter: 'blur(50px) saturate(150%)',
           border: '1px solid rgba(255, 255, 255, 0.3)'
         }}
         animate={{
           scale: window.isMaximized ? 1 : 1,
           borderRadius: window.isMaximized ? '12px' : '12px',
         }}
         transition={{
           duration: 0.3,
           ease: [0.25, 0.46, 0.45, 0.94],
         }}
       >
         {window.hasOwnHeader ? (
           // Component manages its own header
           <Component 
             onClose={handleClose}
             onMinimize={handleMinimize}
             onMaximize={handleMaximizeToggle}
             title={window.title}
           />
         ) : (
           <>
             <div className="window-drag-handle" onDoubleClick={handleHeaderDoubleClick}>
               {window.customHeader ? (
                 <window.customHeader
                   title={window.title}
                   onClose={handleClose}
                   onMinimize={handleMinimize}
                   onMaximize={handleMaximizeToggle}
                 />
               ) : (
                 <WindowHeader
                   title={window.title}
                   onClose={handleClose}
                   onMinimize={handleMinimize}
                   onMaximize={handleMaximizeToggle}
                 />
               )}
             </div>
             
             <div className="flex-1 overflow-hidden">
               <Component />
             </div>
           </>
         )}
       </motion.div>
     </Rnd>
     </motion.div>
   )
 }