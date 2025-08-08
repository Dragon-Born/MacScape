'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, 
  Battery, 
  Volume2, 
  Search,
  Settings,
  User
} from 'lucide-react'
import { useWindowManager } from '@/context/WindowManagerContext'

export function TopBar() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const { windows } = useWindowManager()

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dayName = days[date.getDay()]
    const monthName = months[date.getMonth()]
    const day = date.getDate()
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return `${dayName} ${monthName} ${day} ${hours}:${minutes} ${ampm}`
  }

  const activeTitle = useMemo(() => {
    if (!windows || windows.length === 0) return 'Finder'
    const visible = windows.filter(w => !w.isMinimized)
    if (visible.length === 0) return 'Finder'
    const top = visible.reduce((a, b) => (a.zIndex >= b.zIndex ? a : b))
    return top?.title || 'Finder'
  }, [windows])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[99999]"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className="h-7 px-1.5 flex items-center justify-between text-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(200px) saturate(150%)',
          WebkitBackdropFilter: 'blur(200px) saturate(150%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Left Side - Apple Logo & Menu Items */}
        <div className="flex items-center">
          {/* Apple Logo */}
          <button className="flex items-center rounded-md transition-all duration-150 active:bg-white/20 ml-2">
            <span className="text-[1.2rem] text-white text-shadow-sm pl-2 pr-2"></span>
          </button>
          {/* App Menu Items */}
          <div className="flex items-center space-x-1 text-white font-medium text-[0.9rem] mx-2">
            <button className="px-2 py-1 rounded-md transition-all duration-150 active:bg-white/20 text-shadow-sm font-bold">
              {activeTitle}
            </button>
            <button className="px-2 py-1 rounded-md transition-all duration-150 active:bg-white/20 text-shadow-sm">
              File
            </button>
            <button className="px-2 py-1 rounded-md transition-all duration-150 active:bg-white/20 text-shadow-sm">
              Edit
            </button>
            <button className="px-2 py-1 rounded-md transition-all duration-150 active:bg-white/20 text-shadow-sm">
              View
            </button>
            <button className="px-2 py-1 rounded-md transition-all duration-150 active:bg-white/20 text-shadow-sm">
              Window
            </button>
            <button className="px-2 py-1 rounded-md transition-all duration-150 active:bg-white/20 text-shadow-sm">
              Help
            </button>
          </div>
        </div>

        {/* Right Side - System Controls */}
        <div className="flex items-center space-x-3">
          {/* System Status Icons */}
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded-md transition-all duration-150 hover:bg-white/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 26 16" fill="currentColor">
                <rect x="1" y="2" width="22" height="12" rx="2.5" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="23.5" y="5.5" width="1.5" height="5" rx="0.75" ry="0.75" fill="currentColor"/>
                <rect x="2.5" y="3.5" width="18.8" height="9" rx="1.5" ry="1.5" fill="currentColor"/>
              </svg>
            </button>
            <button className="p-1 rounded-md transition-all duration-150 hover:bg-white/20">
              <svg className="w-4 h-4 text-white" viewBox="0 0 146 104" fill="currentColor">
                <path d="m.707 30.407 13.139 13.138a83.621 83.621 0 0 1 118.249 0l13.139-13.139a102.256 102.256 0 0 0-144.527.001Z"/>
                <path d="M26.984 56.684l13.139 13.139a46.469 46.469 0 0 1 65.694 0l13.139-13.139a65.1 65.1 0 0 0-91.972 0Z"/>
                <path d="m53.262 82.961 19.708 19.708 19.708-19.708a27.834 27.834 0 0 0-39.416 0Z"/>
              </svg>
            </button>
            <button className="p-1 rounded-md transition-all duration-150 hover:bg-white/20">
              <Volume2 className="w-4 h-4 text-white" />
            </button>
          </div>
          {/* Search */}
          <button className="p-1 rounded-md transition-all duration-150 hover:bg-white/20">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="6.5" r="4" />
              <path d="m13 13-3-3" strokeLinecap="round" />
            </svg>
          </button>
          {/* Siri */}
          <button className="p-1 rounded-md transition-all duration-150 hover:bg-white/20">
            <img 
              src="/TopBar/siri.png" 
              alt="Siri" 
              className="w-4 h-4"
            />
          </button>
          {/* Date & Time */}
          <button className="rounded-md transition-all duration-150 active:bg-white/20 text-white font-medium text-[0.85rem] pr-3 py-1 px-1">
            {mounted && currentTime ? formatTime(currentTime) : ''}
          </button>
        </div>
      </div>
    </motion.div>
  )
} 