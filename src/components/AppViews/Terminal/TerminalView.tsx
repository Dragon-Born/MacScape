"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getRegistry } from './commands'
import { resolveTheme } from './theme'
import { TerminalEnv, TerminalLine } from './types'
import { fs } from './fs'

interface TerminalViewProps {
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  title?: string
}

export function TerminalView({ onClose, onMinimize, onMaximize }: TerminalViewProps) {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('/home/guest')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [env, setEnvState] = useState<TerminalEnv>({
    USER: 'guest',
    HOST: 'stellar',
    SHELL: '/bin/websh',
    PWD: '/home/guest',
    THEME: 'classic',
  })

  const termRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const welcomedRef = useRef(false)
  const currentAbortRef = useRef<AbortController | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const theme = resolveTheme(env.THEME)
  const registry = useMemo(() => getRegistry(), [])
  const commandNames = useMemo(() => Object.keys(registry).sort(), [registry])

  useEffect(() => {
    if (!welcomedRef.current) {
      println('Welcome to Stellar Terminal. Type `help` to begin.')
      println('')
      welcomedRef.current = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setEnvState(prev => (prev.PWD === cwd ? prev : { ...prev, PWD: cwd }))
  }, [cwd])

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight })
  }, [lines])

  useEffect(() => {
    if (!isRunning) {
      inputRef.current?.focus()
    }
  }, [isRunning])

  useEffect(() => {
    const handler = () => {
      setEnvState(prev => ({
        ...prev,
        THEME: prev.THEME === 'classic' ? 'monokai' : prev.THEME === 'monokai' ? 'dracula' : 'classic'
      }))
    }
    window.addEventListener('terminal-theme-toggle', handler as any)
    return () => window.removeEventListener('terminal-theme-toggle', handler as any)
  }, [])

  useEffect(() => {
    if (!isRunning) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (currentAbortRef.current) currentAbortRef.current.abort('user')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isRunning])

  const setEnv = (key: string, value: string) => {
    setEnvState(prev => ({ ...prev, [key]: value }))
  }

  const print = (text: string) => {
    setLines(prev => [...prev, { id: crypto.randomUUID(), type: 'output', text }])
  }

  const println = (text = '') => {
    print(text)
  }

  const clear = () => setLines([])

  const runCommand = async (
    raw: string,
    snapshot?: { promptUser: string; promptHost: string; promptCwd: string }
  ) => {
    const s = snapshot || { promptUser: env.USER, promptHost: env.HOST, promptCwd: cwd }

    if (!raw.trim()) {
      setLines(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'input',
          text: '',
          promptUser: s.promptUser,
          promptHost: s.promptHost,
          promptCwd: s.promptCwd,
        },
      ])
      return
    }

    setLines(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'input',
        text: raw,
        promptUser: s.promptUser,
        promptHost: s.promptHost,
        promptCwd: s.promptCwd,
      },
    ])

    setIsRunning(true)
    const controller = new AbortController()
    currentAbortRef.current = controller

    const [cmd, ...args] = raw.split(' ').filter(Boolean)
    const spec = registry[cmd]

    const ctx = {
      cwd,
      setCwd: (p: string) => setCwd(p),
      env,
      setEnv,
      fs: {
        readFile: (p: string) => fs.readFile(p),
        writeFile: (p: string, c: string) => fs.writeFile(p, c),
        appendFile: (p: string, c: string) => fs.appendFile(p, c),
        exists: (p: string) => fs.exists(p),
        isDir: (p: string) => fs.isDir(p),
        list: (p?: string) => fs.list(p),
        mkdir: (p: string) => fs.mkdir(p),
        rm: (p: string) => fs.rm(p),
        rmdir: (p: string) => fs.rmdir(p),
        tree: (p?: string, d?: number) => fs.tree(p, d),
        resolve: (p: string) => fs.resolve(cwd, p),
      },
      print,
      println,
      clear,
      history,
      signal: controller.signal,
    }

    if (!spec) {
      println(`command not found: ${cmd}`)
      currentAbortRef.current = null
      setIsRunning(false)
      return
    }
    try {
      const result = await spec.handler(args, ctx as any)
      if (result) {
        if (result.clear) clear()
        if (result.lines) result.lines.forEach((l: string) => println(l))
        if (result.cwd) setCwd(result.cwd)
      }
    } catch (e: any) {
      if (controller.signal.aborted) {
        println('^C')
      } else {
        println(String(e?.message || e))
      }
    } finally {
      currentAbortRef.current = null
      setIsRunning(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    const snapshot = { promptUser: env.USER, promptHost: env.HOST, promptCwd: cwd }
    if (!trimmed) {
      setInput('')
      setLines(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'input',
          text: '',
          promptUser: snapshot.promptUser,
          promptHost: snapshot.promptHost,
          promptCwd: snapshot.promptCwd,
        },
      ])
      return
    }
    setHistory(prev => [...prev, input])
    setHistoryIndex(null)
    const toRun = input
    setInput('')
    runCommand(toRun, snapshot)
  }

  const navigateHistory = (dir: 'up' | 'down') => {
    if (history.length === 0) return
    if (dir === 'up') {
      const idx = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(idx)
      setInput(history[idx])
    } else {
      if (historyIndex === null) return
      const idx = Math.min(history.length, historyIndex + 1)
      if (idx === history.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(idx)
        setInput(history[idx])
      }
    }
  }

  const handleFocusCapture = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.window-drag-handle')) return
    if (!isRunning) setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDownGlobal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      e.preventDefault()
      if (isRunning) {
        if (currentAbortRef.current) {
          currentAbortRef.current.abort('user')
        }
        return
      }
      if (!isRunning && input) {
        const snapshot = { promptUser: env.USER, promptHost: env.HOST, promptCwd: cwd }
        setLines(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: 'input',
            text: input + '^C',
            promptUser: snapshot.promptUser,
            promptHost: snapshot.promptHost,
            promptCwd: snapshot.promptCwd,
          },
        ])
        setInput('')
        return
      }
    }
  }

  function commonPrefix(strings: string[]): string {
    if (strings.length === 0) return ''
    let prefix = strings[0]
    for (let i = 1; i < strings.length; i++) {
      let j = 0
      while (j < prefix.length && j < strings[i].length && prefix[j] === strings[i][j]) j++
      prefix = prefix.slice(0, j)
      if (!prefix) break
    }
    return prefix
  }

  function completeOnTab() {
    if (isRunning) return
    const value = input
    const cursorAtEnd = inputRef.current?.selectionStart === value.length
    if (!cursorAtEnd) return

    const endsWithSpace = /\s$/.test(value)
    const tokens = value.trimLeft().split(/\s+/).filter(Boolean)
    const isFirstToken = tokens.length <= 1 && !endsWithSpace

    if (isFirstToken) {
      const partial = tokens[0] || ''
      if (!partial) return
      const matches = commandNames.filter(c => c.startsWith(partial))
      if (matches.length === 1) {
        setInput(matches[0] + ' ')
        return
      }
      if (matches.length > 1) {
        const pref = commonPrefix(matches)
        if (pref && pref !== partial) {
          setInput(pref)
        } else {
          print(matches.join('  '))
        }
      }
      return
    }

    const parts = value.split(/\s+/)
    const last = parts[parts.length - 1]
    if (!last) return

    let dirPart = ''
    let basePart = last
    const slashIdx = last.lastIndexOf('/')
    if (slashIdx !== -1) {
      dirPart = last.slice(0, slashIdx)
      basePart = last.slice(slashIdx + 1)
    }

    const baseDir = fs.resolve(cwd, dirPart || '.')
    if (!fs.exists(baseDir) || !fs.isDir(baseDir)) return
    const allNames = fs.list(baseDir)
    const candidates = allNames.filter(n => n.startsWith(basePart))

    if (candidates.length === 0) return
    if (candidates.length === 1) {
      const name = candidates[0]
      const completed = (dirPart ? dirPart + '/' : '') + name
      const absolute = fs.resolve(baseDir, name)
      const suffix = fs.isDir(absolute) ? '/' : ' '
      parts[parts.length - 1] = completed + suffix
      setInput(parts.join(' '))
      return
    }

    const pref = commonPrefix(candidates)
    if (pref && pref !== basePart) {
      parts[parts.length - 1] = (dirPart ? dirPart + '/' : '') + pref
      setInput(parts.join(' '))
    } else {
      print(candidates.join('  '))
    }
  }

  const PromptInline = ({ user, host, cwdValue }: { user?: string; host?: string; cwdValue?: string }) => (
    <span>
      <span style={{ color: theme.accent }}>{user ?? env.USER}@{host ?? env.HOST}</span>
      <span style={{ color: theme.subtle }}>:</span>
      <span style={{ color: theme.foreground }}>{cwdValue ?? cwd}</span>
      <span style={{ color: theme.subtle }}>$</span>
    </span>
  )

  return (
    <div className="h-full flex flex-col rounded-b-xl" style={{ background: theme.background }} onMouseDownCapture={handleFocusCapture}>
      <div ref={termRef} className="flex-1 overflow-auto rounded-b-xl" onMouseDown={handleFocusCapture} style={{
        background: theme.background,
        color: theme.foreground,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \'Liberation Mono\', \'Courier New\', monospace',
      }}>
        <div className="px-3 py-2 space-y-1 text-[13px] leading-6">
          {lines.map(line => (
            <div key={line.id} className="whitespace-pre-wrap" style={{ color: line.type === 'system' ? theme.subtle : theme.foreground }}>
              {line.type === 'input' ? (
                <>
                  <PromptInline user={line.promptUser} host={line.promptHost} cwdValue={line.promptCwd} /> <span>{line.text}</span>
                </>
              ) : (
                line.text
              )}
            </div>
          ))}

          {!isRunning && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="shrink-0">
                <PromptInline />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') { e.preventDefault(); navigateHistory('up') }
                  if (e.key === 'ArrowDown') { e.preventDefault(); navigateHistory('down') }
                  if (e.key === 'l' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); clear() }
                  if (e.key === 'Tab') { e.preventDefault(); completeOnTab() }
                  handleKeyDownGlobal(e)
                }}
                className="flex-1 bg-transparent outline-none placeholder:opacity-50"
                style={{ color: theme.foreground, caretColor: theme.cursor }}
                autoFocus
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="Type a command..."
              />
            </form>
          )}

          {isRunning && (
            <div className="text-xs opacity-60">Running… (Press Ctrl+C to abort)</div>
          )}
        </div>
      </div>
    </div>
  )
} 