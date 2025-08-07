'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, 
  Battery, 
  Volume2, 
  Search,
  Settings,
  User
} from 'lucide-react'

export function TopBar() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

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
    hours = hours ? hours : 12 // 0 should be 12
    
    return `${dayName} ${monthName} ${day} ${hours}:${minutes} ${ampm}`
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[99999]"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        className="h-7 px-4 flex items-center justify-between text-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Left Side - Apple Logo & Menu Items */}
        <div className="flex items-center space-x-2">
          {/* Apple Logo */}
          <button className="flex items-center space-x-1 py-1 rounded transition-all duration-150 active:bg-white/20">
            <span className="text-[1.2rem] text-white text-shadow-sm"></span>
          </button>
          
          {/* App Menu Items */}
          <div className="flex items-center space-x-1 text-white font-medium text-[0.9rem]">
            <button className="px-2 py-1 rounded transition-all duration-150 active:bg-white/20 text-shadow-sm font-bold">
              Finder
            </button>
            <button className="px-2 py-1 rounded transition-all duration-150 active:bg-white/20 text-shadow-sm">
              File
            </button>
            <button className="px-2 py-1 rounded transition-all duration-150 active:bg-white/20 text-shadow-sm">
              Edit
            </button>
            <button className="px-2 py-1 rounded transition-all duration-150 active:bg-white/20 text-shadow-sm">
              View
            </button>
            <button className="px-2 py-1 rounded transition-all duration-150 active:bg-white/20 text-shadow-sm">
              Window
            </button>
            <button className="px-2 py-1 rounded transition-all duration-150 active:bg-white/20 text-shadow-sm">
              Help
            </button>
          </div>
        </div>

        {/* Right Side - System Controls */}
        <div className="flex items-center space-x-3">
          {/* System Status Icons */}
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded transition-all duration-150 hover:bg-white/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 26 16" fill="currentColor">
                {/* Battery body */}
                <rect x="1" y="2" width="22" height="12" rx="2.5" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
                {/* Battery terminal */}
                <rect x="23.5" y="5.5" width="1.5" height="5" rx="0.75" ry="0.75" fill="currentColor"/>
                {/* Battery level indicator (showing full charge) with padding */}
                <rect x="2.5" y="3.5" width="18.8" height="9" rx="1.5" ry="1.5" fill="currentColor"/>
              </svg>
            </button>
            <button className="p-1 rounded transition-all duration-150 hover:bg-white/20">
              <svg className="w-4 h-4 text-white" viewBox="0 0 146 104" fill="currentColor">
                {/* WiFi icon with macOS design - 3 concentric arcs */}
                <path d="m.707 30.407 13.139 13.138a83.621 83.621 0 0 1 118.249 0l13.139-13.139a102.256 102.256 0 0 0-144.527.001Z"/>
                <path d="M26.984 56.684l13.139 13.139a46.469 46.469 0 0 1 65.694 0l13.139-13.139a65.1 65.1 0 0 0-91.972 0Z"/>
                <path d="m53.262 82.961 19.708 19.708 19.708-19.708a27.834 27.834 0 0 0-39.416 0Z"/>
              </svg>
            </button>
            <button className="p-1 rounded transition-all duration-150 hover:bg-white/20">
              <Volume2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Search */}
          <button className="p-1 rounded transition-all duration-150 hover:bg-white/20">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="6.5" r="4" />
              <path d="m13 13-3-3" strokeLinecap="round" />
            </svg>
          </button>

        

        {/* Siri */}
        <button className="p-1 rounded transition-all duration-150 hover:bg-white/20">
            <img 
              src="/TopBar/siri.png" 
              alt="Siri" 
              className="w-4 h-4"
            />
          </button>
          {/* Date & Time */}
          <div className="text-white font-medium text-[0.8rem]">
            {mounted && currentTime ? formatTime(currentTime) : ''}
          </div>

        
        </div>
      </div>
    </motion.div>
  )
} 