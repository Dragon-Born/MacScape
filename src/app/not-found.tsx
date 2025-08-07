'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Home, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 120
    }
  }
}

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(163,71,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(163,71,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary/20 rounded-full blur-sm" />
      <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-secondary/30 rounded-full blur-sm" />
      <div className="absolute bottom-1/3 left-2/3 w-4 h-4 bg-tertiary/20 rounded-full blur-sm" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* 404 Number */}
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="inline-block"
            >
              <h1 className="text-8xl sm:text-9xl lg:text-[12rem] font-bold leading-none">
                <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                  404
                </span>
              </h1>
            </motion.div>
          </motion.div>

          {/* Message */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Oops! Page not found
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Looks like this page went on a date and never came back.{' '}
              <br />
              <span className="text-foreground font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Let's get you back to finding connections.
              </span>
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button
                  size="lg"
                  className="group relative overflow-hidden text-base px-8 py-5 h-auto rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 font-medium transform hover:scale-[1.02] w-full sm:w-48"
                >
                  <div className="relative z-10 flex items-center justify-center">
                    <Home className="mr-3 h-5 w-5" />
                    Back to Home
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="lg"
                className="group text-base px-8 py-5 h-auto rounded-2xl border-2 border-border hover:border-primary/30 hover:bg-primary/8 transition-all duration-500 font-medium backdrop-blur-sm hover:shadow-lg w-full sm:w-48"
                onClick={() => window.open('https://t.me/dopaversebot/app', '_blank')}
              >
                <MessageCircle className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                Try DOPA Instead
              </Button>
            </div>
            
            <motion.div 
              className="inline-flex items-center gap-8 px-6 py-4 bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 border border-border/30 rounded-2xl text-sm text-muted-foreground backdrop-blur-sm shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full shadow-sm" />
                Still looking for love?
              </span>
              <span className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-secondary to-tertiary rounded-full shadow-sm" />
                DOPA is here for you
              </span>
            </motion.div>
          </motion.div>

       
        </motion.div>
      </div>
    </div>
  )
} 