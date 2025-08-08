import { CommandRegistry, CommandSpec } from './types'
import { fs as rootFs } from './fs'

const registry: CommandRegistry = {}

function add(spec: CommandSpec) {
  registry[spec.name] = spec
}

function alias(newName: string, existingName: string, description?: string) {
  const base = registry[existingName]
  if (!base) return
  registry[newName] = { ...base, name: newName, description: description || `${base.description} (alias)` }
}

function padRight(s: string, n: number) {
  return s + ' '.repeat(Math.max(0, n - s.length))
}

function humanDate(t: number) {
  const d = new Date(t)
  return d.toLocaleString()
}

add({
  name: 'help',
  description: 'List available commands or show help for one',
  usage: 'help [command]',
  handler: (args) => {
    if (args[0] && registry[args[0]]) {
      const c = registry[args[0]]
      const lines = [`${c.name} - ${c.description}`]
      if (c.usage) lines.push(`usage: ${c.usage}`)
      return { lines }
    }
    const names = Object.keys(registry).sort()
    const maxName = Math.max(...names.map(n => n.length))
    const rows: string[] = ['Available commands:']
    for (const name of names) {
      const desc = registry[name]?.description || ''
      rows.push(`${padRight(name, maxName)}  - ${desc}`)
    }
    rows.push('Use `help <command>` or `man <command>` to learn more.')
    return { lines: rows }
  }
})

add({
  name: 'man',
  description: 'Show manual/help for a command',
  usage: 'man <command>',
  handler: (args) => {
    const cmd = args[0]
    if (!cmd) return { lines: ['usage: man <command>'] }
    const c = registry[cmd]
    if (!c) return { lines: [`man: ${cmd}: not found`] }
    const lines = [`${c.name} - ${c.description}`]
    if (c.usage) lines.push(`usage: ${c.usage}`)
    return { lines }
  }
})

add({
  name: 'clear',
  description: 'Clear the terminal screen',
  handler: () => ({ clear: true })
})

// common aliases
alias('cls', 'clear', 'Clear the terminal screen (alias)')

add({
  name: 'echo',
  description: 'Print text',
  usage: 'echo [text...]',
  handler: (args) => ({ lines: [args.join(' ')] })
})

add({
  name: 'pwd',
  description: 'Print working directory',
  handler: (_args, ctx) => ({ lines: [ctx.cwd] })
})

add({
  name: 'whoami',
  description: 'Show current user',
  handler: (_a, ctx) => ({ lines: [ctx.env.USER] })
})

add({
  name: 'uname',
  description: 'Show system information',
  handler: () => ({ lines: ['Darwin Web 24.4.0 x86_64 (Browser)'] })
})

add({
  name: 'date',
  description: 'Print the current date and time',
  handler: () => ({ lines: [new Date().toString()] })
})

add({
  name: 'ls',
  description: 'List directory contents',
  usage: 'ls [-l] [-a] [path]',
  handler: (args, ctx) => {
    const flags = new Set(args.filter(a => a.startsWith('-')).join('').replace(/-/g, '').split('').filter(Boolean))
    const pathArg = args.find(a => !a.startsWith('-')) || '.'
    const path = rootFs.resolve(ctx.cwd, pathArg)
    if (!rootFs.exists(path)) return { lines: [`ls: ${pathArg}: No such file or directory`] }
    if (!rootFs.isDir(path)) return { lines: [pathArg] }

    let items = rootFs.list(path)

    if (flags.has('a')) {
      const parentParts = path.split('/').filter(Boolean)
      parentParts.pop()
      const parentPath = '/' + parentParts.join('/') || '/'
      items = ['.', '..', ...items]
      if (!flags.has('l')) {
        return { lines: [items.join('  ')] }
      }
      const rows: string[] = []
      const maxName = Math.max(4, ...items.map(n => n.length + (n !== '.' && n !== '..' && rootFs.isDir(rootFs.resolve(path, n)) ? 1 : 0)))
      rows.push(padRight('name', maxName) + '  type  size  updated')
      rows.push('-'.repeat(maxName + 2 + 4 + 2 + 6 + 2 + 16))
      const stDot = (rootFs as any).stat(path)
      rows.push(
        padRight('.', maxName) + '  ' +
        padRight(stDot.type, 4) + '  ' +
        padRight(String(stDot.size), 6) + '  ' +
        humanDate(stDot.updatedAt)
      )
      const stDotDot = (rootFs as any).stat(parentPath)
      rows.push(
        padRight('..', maxName) + '  ' +
        padRight(stDotDot.type, 4) + '  ' +
        padRight(String(stDotDot.size), 6) + '  ' +
        humanDate(stDotDot.updatedAt)
      )
      const rest = rootFs.list(path)
      for (const name of rest) {
        const childPath = rootFs.resolve(path, name)
        const st = (rootFs as any).stat(childPath)
        const display = name + (st.type === 'dir' ? '/' : '')
        rows.push(
          padRight(display, maxName) + '  ' +
          padRight(st.type, 4) + '  ' +
          padRight(String(st.size), 6) + '  ' +
          humanDate(st.updatedAt)
        )
      }
      return { lines: rows }
    }

    if (!flags.has('l')) {
      return { lines: [items.join('  ')] }
    }
    const rows: string[] = []
    const maxName = Math.max(4, ...items.map(n => n.length + (rootFs.isDir(rootFs.resolve(path, n)) ? 1 : 0)))
    rows.push(padRight('name', maxName) + '  type  size  updated')
    rows.push('-'.repeat(maxName + 2 + 4 + 2 + 6 + 2 + 16))
    for (const name of items) {
      const childPath = rootFs.resolve(path, name)
      const st = (rootFs as any).stat(childPath)
      const display = name + (st.type === 'dir' ? '/' : '')
      rows.push(
        padRight(display, maxName) + '  ' +
        padRight(st.type, 4) + '  ' +
        padRight(String(st.size), 6) + '  ' +
        humanDate(st.updatedAt)
      )
    }
    return { lines: rows }
  }
})

// aliases for ls
alias('dir', 'ls', 'List directory contents (alias)')

add({
  name: 'cd',
  description: 'Change directory',
  usage: 'cd [path] | cd - | cd ~',
  handler: (args, ctx) => {
    const targetArg = args[0] ?? '/'
    const resolved = targetArg === '~'
      ? '/home/guest'
      : targetArg === '-'
        ? (ctx.env.OLDPWD || ctx.cwd)
        : rootFs.resolve(ctx.cwd, targetArg)
    if (!rootFs.exists(resolved)) return { lines: [`cd: ${targetArg}: No such file or directory`] }
    if (!rootFs.isDir(resolved)) return { lines: [`cd: ${targetArg}: Not a directory`] }
    const prev = ctx.cwd
    ctx.setCwd(resolved)
    ctx.setEnv('OLDPWD', prev)
    if (targetArg === '-') return { cwd: resolved, lines: [resolved] }
    return { cwd: resolved }
  }
})

add({
  name: 'cat',
  description: 'Print file content',
  usage: 'cat <file>',
  handler: (args, ctx) => {
    if (!args[0]) return { lines: ['usage: cat <file>'] }
    const path = rootFs.resolve(ctx.cwd, args[0])
    try {
      const content = rootFs.readFile(path)
      return { lines: content.split('\n') }
    } catch (e: any) {
      return { lines: [`cat: ${args[0]}: ${e.message}`] }
    }
  }
})

add({
  name: 'touch',
  description: 'Create file or update timestamp',
  usage: 'touch <file>',
  handler: (args, ctx) => {
    if (!args[0]) return { lines: ['usage: touch <file>'] }
    const path = rootFs.resolve(ctx.cwd, args[0])
    ;(rootFs as any).touch(path)
    return { }
  }
})

add({
  name: 'mkdir',
  description: 'Create directory',
  usage: 'mkdir [-p] <dir>',
  handler: (args, ctx) => {
    const recursive = args.includes('-p')
    const pathArg = args.find(a => !a.startsWith('-'))
    if (!pathArg) return { lines: ['usage: mkdir [-p] <dir>'] }
    const path = rootFs.resolve(ctx.cwd, pathArg)
    try {
      if (recursive) {
        const parts = path.split('/').filter(Boolean)
        let p = ''
        for (const part of parts) {
          p += '/' + part
          rootFs.mkdir(p)
        }
      } else {
        rootFs.mkdir(path)
      }
      return {}
    } catch (e: any) {
      return { lines: [`mkdir: ${pathArg}: ${e.message}`] }
    }
  }
})

add({
  name: 'rm',
  description: 'Remove files or directories',
  usage: 'rm [-r] <path>',
  handler: (args, ctx) => {
    const recursive = args.includes('-r')
    const pathArg = args.find(a => !a.startsWith('-'))
    if (!pathArg) return { lines: ['usage: rm [-r] <path>'] }
    const path = rootFs.resolve(ctx.cwd, pathArg)

    try {
      if (recursive && (rootFs.isDir(path))) {
        const stack = [path]
        const toDelete: string[] = []
        while (stack.length) {
          const current = stack.pop() as string
          if (rootFs.isDir(current)) {
            const children = rootFs.list(current)
            for (const name of children) {
              const child = rootFs.resolve(current, name)
              stack.push(child)
            }
            toDelete.push(current)
          } else {
            toDelete.push(current)
          }
        }
        for (const p of toDelete.sort((a, b) => b.length - a.length)) {
          if (rootFs.isDir(p)) (rootFs as any).rmdir(p)
          else rootFs.rm(p)
        }
      } else {
        if (rootFs.isDir(path)) return { lines: ['rm: is a directory (use -r)'] }
        rootFs.rm(path)
      }
      return {}
    } catch (e: any) {
      return { lines: [`rm: ${pathArg}: ${e.message}`] }
    }
  }
})

add({
  name: 'tree',
  description: 'Show directory tree',
  usage: 'tree [path] [depth]',
  handler: (args, ctx) => {
    const path = rootFs.resolve(ctx.cwd, args[0] || '.')
    const depth = args[1] ? Math.max(0, parseInt(args[1], 10) || 2) : 2
    const out = rootFs.tree(path, depth)
    return { lines: out.split('\n') }
  }
})

add({
  name: 'env',
  description: 'Print environment variables',
  handler: (_a, ctx) => {
    const keys = Object.keys(ctx.env).sort()
    const lines = keys.map(k => `${k}=${ctx.env[k]}`)
    return { lines }
  }
})

// common env aliases
alias('printenv', 'env', 'Print environment variables (alias)')

add({
  name: 'set',
  description: 'Set an environment variable',
  usage: 'set KEY=value',
  handler: (args, ctx) => {
    if (!args[0] || !args[0].includes('=')) return { lines: ['usage: set KEY=value'] }
    const [key, ...rest] = args[0].split('=')
    const value = rest.join('=')
    ctx.setEnv(key, value)
    if (key === 'PWD') ctx.setCwd(value)
    return {}
  }
})

// export alias behaves like set
alias('export', 'set', 'Set an environment variable (alias)')

add({
  name: 'theme',
  description: 'Change or inspect terminal theme',
  usage: 'theme [name] | theme list | theme current',
  handler: (args, ctx) => {
    const sub = (args[0] || '').toLowerCase()
    const allowed = ['classic', 'monokai', 'dracula']
    if (!sub) {
      return { lines: [`Current theme: ${ctx.env.THEME}`, `Available themes: ${allowed.join(', ')}`] }
    }
    if (sub === 'list') {
      return { lines: ['Available themes: ' + allowed.join(', ')] }
    }
    if (sub === 'current') {
      return { lines: [`Current theme: ${ctx.env.THEME}`] }
    }
    if (!allowed.includes(sub)) {
      return { lines: ['Available themes: classic, monokai, dracula'] }
    }
    ctx.setEnv('THEME', sub)
    return { lines: [`Theme set to ${sub}`] }
  }
})

add({
  name: 'open',
  description: 'Open a URL in a new tab',
  usage: 'open <url>',
  handler: (args) => {
    const raw = args[0]
    if (!raw) return { lines: ['usage: open <url>'] }
    try {
      const toUrl = (s: string) => /:\/\//.test(s) ? s : `https://${s}`
      const urlStr = toUrl(raw)
      // validate
      // eslint-disable-next-line no-new
      new URL(urlStr)
      window.open(urlStr, '_blank', 'noopener,noreferrer')
      return { lines: [`Opening ${urlStr}...`] }
    } catch {
      return { lines: ['open: invalid URL'] }
    }
  }
})

add({
  name: 'about',
  description: 'About this terminal',
  handler: () => ({
    lines: [
      'Stellar Terminal v1.1',
      'Web terminal with a virtual filesystem and rich commands.',
      'Type `help` to see commands.'
    ]
  })
})

add({
  name: 'mv',
  description: 'Move/rename a file',
  usage: 'mv <src> <dest>',
  handler: (args, ctx) => {
    const [src, dest] = args
    if (!src || !dest) return { lines: ['usage: mv <src> <dest>'] }
    try {
      ;(rootFs as any).rename(rootFs.resolve(ctx.cwd, src), rootFs.resolve(ctx.cwd, dest))
      return {}
    } catch (e: any) {
      return { lines: [`mv: ${e.message}`] }
    }
  }
})

add({
  name: 'cp',
  description: 'Copy a file',
  usage: 'cp <src> <dest>',
  handler: (args, ctx) => {
    const [src, dest] = args
    if (!src || !dest) return { lines: ['usage: cp <src> <dest>'] }
    try {
      ;(rootFs as any).copyFile(rootFs.resolve(ctx.cwd, src), rootFs.resolve(ctx.cwd, dest))
      return {}
    } catch (e: any) {
      return { lines: [`cp: ${e.message}`] }
    }
  }
})

add({
  name: 'head',
  description: 'Output the first part of files',
  usage: 'head [-n N] <file>',
  handler: (args, ctx) => {
    let count = 10
    const nIdx = args.indexOf('-n')
    if (nIdx !== -1) {
      const nVal = args[nIdx + 1]
      if (!nVal) return { lines: ['usage: head [-n N] <file>'] }
      count = Math.max(1, parseInt(nVal, 10) || 10)
    }
    const file = nIdx === -1 ? args[0] : args.filter((_, i) => i !== nIdx && i !== nIdx + 1)[0]
    if (!file) return { lines: ['usage: head [-n N] <file>'] }
    try {
      const lines = rootFs.readFile(rootFs.resolve(ctx.cwd, file)).split('\n').slice(0, count)
      return { lines }
    } catch (e: any) {
      return { lines: [`head: ${e.message}`] }
    }
  }
})

add({
  name: 'tail',
  description: 'Output the last part of files',
  usage: 'tail [-n N] <file>',
  handler: (args, ctx) => {
    let count = 10
    const nIdx = args.indexOf('-n')
    if (nIdx !== -1) {
      const nVal = args[nIdx + 1]
      if (!nVal) return { lines: ['usage: tail [-n N] <file>'] }
      count = Math.max(1, parseInt(nVal, 10) || 10)
    }
    const file = nIdx === -1 ? args[0] : args.filter((_, i) => i !== nIdx && i !== nIdx + 1)[0]
    if (!file) return { lines: ['usage: tail [-n N] <file>'] }
    try {
      const content = rootFs.readFile(rootFs.resolve(ctx.cwd, file))
      const split = content.split('\n')
      const out = split.slice(Math.max(0, split.length - count))
      return { lines: out }
    } catch (e: any) {
      return { lines: [`tail: ${e.message}`] }
    }
  }
})

add({
  name: 'grep',
  description: 'Search for patterns in files',
  usage: 'grep [-i] [-n] <pattern> <file>',
  handler: (args, ctx) => {
    const flags = new Set(args.filter(a => a.startsWith('-')).join('').replace(/-/g, '').split('').filter(Boolean))
    const nonFlags = args.filter(a => !a.startsWith('-'))
    const [pattern, file] = nonFlags
    if (!pattern || !file) return { lines: ['usage: grep [-i] [-n] <pattern> <file>'] }
    try {
      const re = new RegExp(pattern, flags.has('i') ? 'i' : undefined)
      const list = rootFs.readFile(rootFs.resolve(ctx.cwd, file)).split('\n')
      const out = list
        .map((l, idx) => ({ l, idx }))
        .filter(({ l }) => re.test(l))
        .map(({ l, idx }) => flags.has('n') ? `${idx + 1}:${l}` : l)
      return { lines: out.length ? out : ['(no matches)'] }
    } catch (e: any) {
      return { lines: [`grep: ${e.message}`] }
    }
  }
})

add({
  name: 'wc',
  description: 'Word, line, byte counts',
  usage: 'wc <file>',
  handler: (args, ctx) => {
    const [file] = args
    if (!file) return { lines: ['usage: wc <file>'] }
    try {
      const content = rootFs.readFile(rootFs.resolve(ctx.cwd, file))
      const lines = content.split('\n').length
      const words = content.trim() ? content.trim().split(/\s+/).length : 0
      const bytes = content.length
      return { lines: [`${lines} ${words} ${bytes} ${file}`] }
    } catch (e: any) {
      return { lines: [`wc: ${e.message}`] }
    }
  }
})

add({
  name: 'nano',
  description: 'Simple inline editor',
  usage: 'nano <file> (type ":wq" on a new line to save and exit) ',
  handler: (args, ctx) => {
    const file = args[0]
    if (!file) return { lines: ['usage: nano <file>'] }
    const path = rootFs.resolve(ctx.cwd, file)
    let content = ''
    try { content = rootFs.readFile(path) } catch {}

    ctx.println(`--- Editing ${file} (type :wq to save & exit) ---`)
    ctx.println(content)
    ctx.println('')
    ctx.println('(editor not interactive in this demo)')
    return {}
  }
})

add({
  name: 'history',
  description: 'Show command history',
  usage: 'history [-n N]',
  handler: (args, ctx) => {
    const nIdx = args.indexOf('-n')
    if (nIdx !== -1) {
      const val = parseInt(args[nIdx + 1] || '', 10)
      if (!Number.isFinite(val) || val <= 0) return { lines: ['usage: history [-n N]'] }
      const slice = ctx.history.slice(-val)
      return { lines: slice.map((h, i) => `${ctx.history.length - slice.length + i + 1}  ${h}`) }
    }
    return { lines: ctx.history.map((h, i) => `${i + 1}  ${h}`) }
  }
})

add({
  name: 'uptime',
  description: 'Show how long the page has been open',
  handler: () => {
    const secs = Math.floor(performance.now() / 1000)
    return { lines: [`up ${secs}s`] }
  }
})

add({
  name: 'alias',
  description: 'List or set command aliases (no-op demo)',
  usage: 'alias [name=value]...'
  , handler: (args) => {
    if (!args.length) return { lines: ['(alias not implemented)'] }
    return { lines: ['(alias set - no effect in demo)'] }
  }
})

add({
  name: 'which',
  description: 'Locate a command',
  usage: 'which <command>',
  handler: (args) => {
    const [cmd] = args
    if (!cmd) return { lines: ['usage: which <command>'] }
    return { lines: [registry[cmd] ? `/bin/${cmd}` : `${cmd} not found`] }
  }
})

add({
  name: 'ping',
  description: 'Ping a host using browser fetch timings',
  usage: 'ping [-c N] <host|url>',
  handler: async (args, ctx) => {
    let count = 4
    const cIdx = args.indexOf('-c')
    if (cIdx !== -1) {
      const val = args[cIdx + 1]
      if (!val) return { lines: ['usage: ping [-c N] <host|url>'] }
      count = Math.max(1, parseInt(val, 10) || 4)
    }
    const targetArg = cIdx === -1 ? args[0] : args.filter((_, i) => i !== cIdx && i !== cIdx + 1)[0]
    if (!targetArg) return { lines: ['usage: ping [-c N] <host|url>'] }

    const toUrl = (s: string) => /:\/\//.test(s) ? s : `https://${s}`
    const url = toUrl(targetArg)

    const results: number[] = []
    ctx.println(`PING ${targetArg} with browser fetch (${count} packets)`)    

    const delay = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve) => {
      const t = setTimeout(() => resolve(), ms)
      if (signal) {
        const onAbort = () => { clearTimeout(t); resolve() }
        signal.addEventListener('abort', onAbort, { once: true })
      }
    })

    for (let i = 0; i < count; i++) {
      if (ctx.signal.aborted) {
        throw new Error('abort')
      }
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort('timeout'), 5000)
      const onAbort = () => controller.abort('user')
      ctx.signal.addEventListener('abort', onAbort, { once: true })
      const start = performance.now()
      try {
        await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: controller.signal })
        const ms = Math.round(performance.now() - start)
        results.push(ms)
        ctx.println(`seq=${i} time=${ms} ms`)
      } catch (e: any) {
        if (ctx.signal.aborted) {
          throw new Error('abort')
        }
        ctx.println(`seq=${i} timeout`)
      } finally {
        clearTimeout(timeout)
        ctx.signal.removeEventListener('abort', onAbort as any)
      }
      await delay(400, ctx.signal)
    }

    if (results.length) {
      const min = Math.min(...results)
      const max = Math.max(...results)
      const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length)
      ctx.println(`--- ${targetArg} ping statistics ---`)
      ctx.println(`${count} packets transmitted, ${results.length} received`)
      ctx.println(`rtt min/avg/max = ${min}/${avg}/${max} ms`)
    } else {
      ctx.println(`--- ${targetArg} ping statistics ---`)
      ctx.println(`${count} packets transmitted, 0 received`)
    }

    return {}
  }
})

export function getRegistry(): CommandRegistry {
  return registry
} 