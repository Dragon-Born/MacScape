'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Minus, Square, ChevronLeft, ChevronRight, RotateCcw, Share } from 'lucide-react'

interface SafariBrowserProps {
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  title?: string
}

export function SafariBrowser({ onClose, onMinimize, onMaximize, title }: SafariBrowserProps) {
  const [currentUrl, setCurrentUrl] = useState('https://www.apple.com')
  const [addressBarValue, setAddressBarValue] = useState('apple.com')
  const [isLoading, setIsLoading] = useState(false)
  const [isAddressBarFocused, setIsAddressBarFocused] = useState(false)
  const [showCorsError, setShowCorsError] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [history, setHistory] = useState(['https://www.apple.com'])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  const addressInputRef = useRef<HTMLInputElement>(null)

  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < history.length - 1

  // List of iframe-friendly sites for better user experience
  const iframeFriendlySites = [
    'wikipedia.org',
    'github.io',
    'codepen.io',
    'jsfiddle.net',
    'stackoverflow.com',
    'developer.mozilla.org',
    'w3schools.com',
    'example.com',
    'httpbin.org',
    'duckduckgo.com'
  ]

  const isIframeFriendly = (url: string) => {
    return iframeFriendlySites.some(site => url.includes(site)) || 
           url.startsWith('data:') || 
           url.includes('apple.com')
  }

  const navigateToUrl = useCallback((url: string) => {
    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      // If it looks like a search query, use it as-is for search
      if (!normalizedUrl.includes('.') || normalizedUrl.includes(' ')) {
        normalizedUrl = `https://duckduckgo.com/?q=${encodeURIComponent(normalizedUrl)}`
      } else {
        normalizedUrl = `https://${normalizedUrl}`
      }
    }

    // Check if we're navigating to the same URL
    const isSameUrl = normalizedUrl === currentUrl
    
    setCurrentUrl(normalizedUrl)
    setIsLoading(true)
    setShowCorsError(false)
    
    // Update history only if it's a different URL
    if (!isSameUrl) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(normalizedUrl)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }

    // Always force iframe reload for proper navigation
    setIframeKey(prev => prev + 1)
    
    // For same URL navigation, clear loading after a short delay
    if (isSameUrl) {
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }
  }, [currentUrl, history, historyIndex])

  const goBack = () => {
    if (canGoBack) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCurrentUrl(history[newIndex])
      setIsLoading(true)
      setShowCorsError(false)
      setIframeKey(prev => prev + 1)
    }
  }

  const goForward = () => {
    if (canGoForward) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCurrentUrl(history[newIndex])
      setIsLoading(true)
      setShowCorsError(false)
      setIframeKey(prev => prev + 1)
    }
  }

  const refresh = () => {
    setIsLoading(true)
    setShowCorsError(false)
    setIframeKey(prev => prev + 1)
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateToUrl(addressBarValue)
    
    // Explicitly blur the input element
    if (addressInputRef.current) {
      addressInputRef.current.blur()
    }
    
    setIsAddressBarFocused(false)
    // Input will blur and show simplified URL via blur handler
  }

  const handleAddressBarFocus = () => {
    setIsAddressBarFocused(true)
    setAddressBarValue(currentUrl) // Show full URL when focused
  }

  const handleAddressBarBlur = () => {
    setIsAddressBarFocused(false)
    // Reset to simplified URL when blurred without submitting
    setAddressBarValue(getDisplayUrl(currentUrl))
  }

  // Update address bar when URL changes from other sources
  useEffect(() => {
    if (!isAddressBarFocused) {
      setAddressBarValue(getDisplayUrl(currentUrl)) // Show simplified URL when not focused
    }
  }, [currentUrl, isAddressBarFocused])

  // Handle URL changes
  useEffect(() => {
    setShowCorsError(false)
    // setIframeKey is now handled in navigateToUrl for better control
    
    // Fallback timeout to ensure loading never gets stuck
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 10000) // 10 second fallback

    return () => clearTimeout(loadingTimeout)
  }, [currentUrl])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setShowCorsError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setShowCorsError(true)
  }

  const isHomePage = currentUrl === 'https://www.apple.com'

  // Function to simplify URL for display (like Safari)
  const getDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      let domain = urlObj.hostname

      // Remove www prefix for cleaner display
      if (domain.startsWith('www.')) {
        domain = domain.substring(4)
      }

      // Special handling for our default homepage
      if (url === 'https://www.apple.com' || url === 'https://apple.com') {
        return 'apple.com'
      }

      // For search results, show a cleaner format
      if (domain === 'duckduckgo.com' && urlObj.searchParams.has('q')) {
        const query = urlObj.searchParams.get('q')
        if (query) {
          return `Search: ${query.length > 25 ? query.substring(0, 22) + '...' : query}`
        }
      }

      // For common sites, show just the domain
      // For others, include path if it's meaningful
      const path = urlObj.pathname
      if (path === '/' || path === '') {
        return domain
      }

      // Show domain + path for non-root pages, but keep it clean
      const cleanPath = path.length > 20 ? path.substring(0, 17) + '...' : path
      return domain + cleanPath
    } catch {
      // If URL parsing fails, return the original
      return url
    }
  }

  // Handle messages from iframe (for quick links on homepage)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action === 'navigate' && event.data.url) {
        navigateToUrl(event.data.url)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [navigateToUrl])

  // Detect if iframe is blocked (more accurate detection)
  useEffect(() => {
    if (!isHomePage && !showCorsError) {
      const timeout = setTimeout(() => {
        // Try to access iframe content to detect if it's blocked
        try {
          const iframe = document.querySelector('iframe[src="' + currentUrl + '"]') as HTMLIFrameElement
          if (iframe) {
            // Try to access the iframe document (will throw if blocked)
            iframe.contentDocument?.title
          }
        } catch (error) {
          // If we can't access it, it's likely blocked
          setShowCorsError(true)
          setIsLoading(false)
        }
      }, 5000) // Wait 5 seconds before checking

      return () => clearTimeout(timeout)
    }
  }, [currentUrl, isHomePage, showCorsError])

  // Default homepage content
  const defaultContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Safari</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
          background: #ffffff;
          color: #1d1d1f;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1.4;
        }
        
        .container {
          text-align: center;
          max-width: 480px;
          padding: 0 20px;
        }
        
        .safari-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
        }
        
        h1 {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 0.8rem;
          color: #1d1d1f;
          letter-spacing: -0.02em;
        }
        
        .subtitle {
          font-size: 1.1rem;
          color: #86868b;
          font-weight: 400;
          margin-bottom: 3rem;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .quick-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
        }
        
        .quick-link {
          background: #f5f5f7;
          border: none;
          border-radius: 12px;
          padding: 0.8rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #1d1d1f;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          font-family: inherit;
        }
        
        .quick-link:hover {
          background: #e8e8ed;
          transform: translateY(-1px);
        }
        
        .version {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.8rem;
          color: #86868b;
          font-weight: 400;
        }
        
        @media (max-width: 480px) {
          .safari-icon {
            font-size: 3rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .quick-links {
            gap: 0.8rem;
          }
          
          .quick-link {
            padding: 0.7rem 1rem;
            font-size: 0.85rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Safari</h1>
        <p class="subtitle">A clean, fast, and secure browsing experience</p>
        
                 <div class="quick-links">
           <button class="quick-link" onclick="parent.postMessage({action: 'navigate', url: 'https://duckduckgo.com'}, '*')">
             DuckDuckGo
           </button>
           <button class="quick-link" onclick="parent.postMessage({action: 'navigate', url: 'https://en.wikipedia.org'}, '*')">
             Wikipedia
           </button>
           <button class="quick-link" onclick="parent.postMessage({action: 'navigate', url: 'https://developer.mozilla.org'}, '*')">
             MDN Docs
           </button>
         </div>
      </div>
      
      <div class="version">macOS Web Desktop</div>
    </body>
    </html>
  `

      return (
    <div className="h-full flex flex-col bg-white">
      {/* Safari Header */}
      <div 
        className="flex items-center border-b px-3 py-1 select-none relative z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          borderBottomColor: 'rgba(0, 0, 0, 0.1)',
          minHeight: '52px',
        }}
      >
        {/* Drag Handle Area - covers the entire header */}
        <div className="window-drag-handle absolute inset-0 z-0" />
        
        {/* Left Side - Traffic Lights */}
        <div className="flex items-center space-x-2 mr-4 relative z-10">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
            style={{
              background: '#ff5f57',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <X className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2.5} />
          </button>
          
          <button
            onClick={onMinimize}
            className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
            style={{
              background: '#ffbd2e',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Minus className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2.5} />
          </button>
          
          <button
            onClick={onMaximize}
            className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
            style={{
              background: '#28ca42',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Square className="w-1 h-1 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2} />
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-1 mr-3 relative z-10">
          <button
            onClick={goBack}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/5 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canGoBack}
          >
            <ChevronLeft className="w-4 h-4 text-black/60" strokeWidth={2} />
          </button>
          
          <button
            onClick={goForward}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/5 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canGoForward}
          >
            <ChevronRight className="w-4 h-4 text-black/60" strokeWidth={2} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 mx-2 relative z-10" style={{ isolation: 'isolate' }}>
          <form onSubmit={handleUrlSubmit} className="relative z-20">
            <input
              ref={addressInputRef}
              type="text"
              value={addressBarValue}
              onChange={(e) => setAddressBarValue(e.target.value)}
              onFocus={handleAddressBarFocus}
              onBlur={handleAddressBarBlur}
              className="w-full px-3 py-1.5 text-sm rounded-md outline-none transition-all duration-200 relative z-30"
              style={{
                background: isAddressBarFocused 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(0, 0, 0, 0.05)',
                color: isAddressBarFocused ? '#333' : '#555',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: isAddressBarFocused ? '14px' : '13px',
                fontWeight: isAddressBarFocused ? '400' : '500',
                textAlign: isAddressBarFocused ? 'left' : 'center',
                boxShadow: isAddressBarFocused 
                  ? '0 0 0 2px rgba(59, 130, 246, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.05)',
                border: isAddressBarFocused 
                  ? '1px solid rgba(59, 130, 246, 0.2)' 
                  : '1px solid transparent',
                isolation: 'isolate', // Create new stacking context
              }}
              placeholder={isAddressBarFocused ? "Enter URL or search" : ""}
            />
            
            {/* Quick suggestions dropdown when focused and empty */}
            {isAddressBarFocused && addressBarValue.length === 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border shadow-lg overflow-hidden"
                style={{ 
                  zIndex: 100,
                  isolation: 'isolate' 
                }}
              >
                <div className="p-2 text-xs text-gray-500 border-b bg-gray-50">
                  Suggested sites:
                </div>
                {[
                  { url: 'duckduckgo.com', title: 'DuckDuckGo Search' },
                  { url: 'en.wikipedia.org', title: 'Wikipedia' },
                  { url: 'developer.mozilla.org', title: 'MDN Docs' },
                  { url: 'example.com', title: 'Example Site' }
                ].map((site) => (
                  <button
                    key={site.url}
                    type="button"
                    onClick={() => {
                      navigateToUrl(`https://${site.url}`)
                      setIsAddressBarFocused(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors text-sm"
                  >
                    <div className="font-medium text-gray-800">{site.title}</div>
                    <div className="text-xs text-gray-500">{site.url}</div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-1 ml-3 relative z-10">
          <button
            onClick={refresh}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/5 transition-colors duration-150"
          >
            <RotateCcw className="w-4 h-4 text-black/60" strokeWidth={2} />
          </button>
          
          <button
            onClick={() => console.log('Share page')}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/5 transition-colors duration-150"
          >
            <Share className="w-4 h-4 text-black/60" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden z-10">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Loading {currentUrl}...</p>
            </div>
          </div>
        )}

        {showCorsError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-30">
            <div className="text-center p-8 max-w-lg mx-4">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Site Cannot Be Embedded</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This website blocks embedding in frames for security reasons. Many sites like Google, Facebook, 
                and banks use this protection to prevent malicious embedding.
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Trying to load:</p>
                <p className="font-mono text-sm text-blue-600 break-all">{currentUrl}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <span>🔗</span>
                  <span>Open in New Tab</span>
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCorsError(false)
                      navigateToUrl('https://duckduckgo.com')
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Try DuckDuckGo
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowCorsError(false)
                      navigateToUrl('https://en.wikipedia.org')
                    }}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    Try Wikipedia
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowCorsError(false)
                    goBack()
                  }}
                  className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  ← Go Back
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>💡 Tip:</strong> Try iframe-friendly sites like DuckDuckGo, Wikipedia, GitHub Pages, 
                  CodePen, or developer documentation sites for the best experience.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Web Content */}
        {isHomePage ? (
          <iframe
            key={iframeKey}
            src={`data:text/html;charset=utf-8,${encodeURIComponent(defaultContent)}`}
            className="w-full h-full border-none"
            title="Safari Web Content"
            sandbox="allow-scripts allow-same-origin"
            onLoad={handleIframeLoad}
          />
        ) : (
          <iframe
            key={iframeKey}
            src={currentUrl}
            className="w-full h-full border-none"
            title="Safari Web Content"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

     
    </div>
  )
} 