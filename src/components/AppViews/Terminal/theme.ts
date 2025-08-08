import { TerminalTheme } from './types'

export const THEMES: Record<TerminalTheme['name'], TerminalTheme> = {
  classic: {
    name: 'classic',
    background: '#0b0c0e',
    foreground: '#e6edf3',
    accent: '#58d68d',
    subtle: '#8b949e',
    cursor: '#2ecc71',
  },
  monokai: {
    name: 'monokai',
    background: '#1f201c',
    foreground: '#f8f8f2',
    accent: '#a6e22e',
    subtle: '#8a8a7e',
    cursor: '#a6e22e',
  },
  dracula: {
    name: 'dracula',
    background: '#1e1f29',
    foreground: '#f8f8f2',
    accent: '#50fa7b',
    subtle: '#9aa3c0',
    cursor: '#50fa7b',
  }
}

export function resolveTheme(name: TerminalTheme['name']): TerminalTheme {
  return THEMES[name] || THEMES.classic
} 