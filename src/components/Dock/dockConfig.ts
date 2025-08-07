import { NotesApp } from '@/components/AppViews/NotesApp'
import { SafariBrowser } from '@/components/AppViews/SafariBrowser'
import { ComponentType } from 'react'

export interface DockAppConfig {
  id: string
  name: string
  icon: string // Emoji fallback
  iconPath?: string // Path to .icns file
  component: ComponentType<any>
  defaultPosition: { x: number; y: number }
  defaultSize: { width: number; height: number }
  isTrash?: boolean
  customHeader?: ComponentType<{
    title: string
    onClose: () => void
    onMinimize: () => void
    onMaximize: () => void
  }>
  hasOwnHeader?: boolean // Component manages its own header
}

export const dockApps: DockAppConfig[] = [
  {
    id: 'finder',
    name: 'Finder',
    icon: '📁',
    iconPath: '/AppIcons/finder.png',
    component: NotesApp, // Placeholder
    defaultPosition: { x: 120, y: 120 },
    defaultSize: { width: 800, height: 600 }
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: '📝',
    iconPath: '/AppIcons/notes.png', // Will fallback to emoji if file doesn't exist
    component: NotesApp,
    defaultPosition: { x: 100, y: 100 },
    defaultSize: { width: 600, height: 400 } 
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: '🧮',
    iconPath: '/AppIcons/calculator.png',
    component: NotesApp, // Placeholder - we'll create more apps later
    defaultPosition: { x: 150, y: 150 },
    defaultSize: { width: 300, height: 400 }
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    iconPath: '/AppIcons/terminal.png', // This one exists!
    component: NotesApp, // Placeholder
    defaultPosition: { x: 200, y: 200 },
    defaultSize: { width: 700, height: 500 }
  },
  {
    id: 'safari',
    name: 'Safari',
    icon: '🌐',
    iconPath: '/AppIcons/safari.png',
    component: SafariBrowser,
    hasOwnHeader: true,
    defaultPosition: { x: 80, y: 20 },
    defaultSize: { width: 1000, height: 700 }
  }
]

export const trashConfig: DockAppConfig = {
  id: 'trash',
  name: 'Trash',
  icon: '🗑️',
  iconPath: '/AppIcons/trash.png',
  component: NotesApp, // Placeholder
  defaultPosition: { x: 0, y: 0 },
  defaultSize: { width: 0, height: 0 },
  isTrash: true
} 