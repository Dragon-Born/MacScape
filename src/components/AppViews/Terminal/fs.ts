import { DirNode, FileNode, FsNode } from './types'

const now = () => Date.now()

function makeDir(name: string): DirNode {
  const t = now()
  return { name, type: 'dir', createdAt: t, updatedAt: t, children: {} }
}

function makeFile(name: string, content = ''): FileNode {
  const t = now()
  return { name, type: 'file', createdAt: t, updatedAt: t, content }
}

export interface FsStat {
  path: string
  name: string
  type: 'file' | 'dir'
  size: number
  createdAt: number
  updatedAt: number
}

export class VirtualFS {
  private root: DirNode

  constructor() {
    this.root = makeDir('/')
    // seed
    this.mkdir('/home')
    this.mkdir('/home/guest')
    this.writeFile('/home/guest/readme.txt', 'Welcome to Terminal. Type `help` to get started.')
    this.mkdir('/projects')
    this.writeFile('/projects/todo.md', '- build terminal\n- ship app')
  }

  private splitPath(path: string): string[] {
    const clean = path.replace(/\\+/g, '/').replace(/\/+$/g, '')
    const parts = clean.split('/').filter(Boolean)
    return parts
  }

  resolve(cwd: string, input: string): string {
    if (!input || input === '.') return cwd || '/'
    if (input.startsWith('/')) return input === '' ? '/' : input
    const base = cwd.endsWith('/') ? cwd.slice(0, -1) : cwd
    const raw = (base ? base : '/') + '/' + input
    const normalized = raw
      .replace(/\\+/g, '/')
      .split('/')
      .reduce<string[]>((acc, part) => {
        if (!part || part === '.') return acc
        if (part === '..') {
          acc.pop()
        } else {
          acc.push(part)
        }
        return acc
      }, [])
    return '/' + normalized.join('/')
  }

  private getNode(path: string): FsNode | undefined {
    if (path === '/' || path === '') return this.root
    const parts = this.splitPath(path)
    let node: FsNode = this.root
    for (const part of parts) {
      if (node.type !== 'dir') return undefined
      node = node.children[part]
      if (!node) return undefined
    }
    return node
  }

  private ensureDir(path: string): DirNode | undefined {
    const node = this.getNode(path)
    if (node && node.type === 'dir') return node
    return undefined
  }

  exists(path: string): boolean {
    return !!this.getNode(path)
  }

  isDir(path: string): boolean {
    const node = this.getNode(path)
    return !!node && node.type === 'dir'
  }

  list(path = '/'): string[] {
    const node = this.ensureDir(path)
    if (!node) return []
    return Object.keys(node.children).sort()
  }

  mkdir(path: string): void {
    if (this.exists(path)) return
    const parts = this.splitPath(path)
    let node: DirNode = this.root
    for (const part of parts) {
      if (!node.children[part]) {
        node.children[part] = makeDir(part)
      }
      const next = node.children[part]
      if (next.type !== 'dir') throw new Error('Path segment is a file: ' + part)
      node = next
    }
  }

  writeFile(path: string, content: string) {
    const parts = this.splitPath(path)
    if (parts.length === 0) throw new Error('Invalid path')
    const filename = parts.pop() as string
    let dir = this.root
    for (const part of parts) {
      if (!dir.children[part]) dir.children[part] = makeDir(part)
      const next = dir.children[part]
      if (next.type !== 'dir') throw new Error('Path segment is a file: ' + part)
      dir = next
    }
    dir.children[filename] = makeFile(filename, content)
  }

  appendFile(path: string, content: string) {
    const node = this.getNode(path)
    if (!node) {
      this.writeFile(path, content)
      return
    }
    if (node.type !== 'file') throw new Error('Not a file: ' + path)
    node.content += content
    node.updatedAt = now()
  }

  readFile(path: string): string {
    const node = this.getNode(path)
    if (!node) throw new Error('No such file')
    if (node.type !== 'file') throw new Error('Not a file')
    return node.content
  }

  rm(path: string): void {
    const parts = this.splitPath(path)
    if (parts.length === 0) return
    const name = parts.pop() as string
    const parentPath = '/' + parts.join('/')
    const parent = this.ensureDir(parentPath)
    if (!parent) throw new Error('No such path: ' + path)
    delete parent.children[name]
  }

  rmdir(path: string): void {
    const node = this.getNode(path)
    if (!node) return
    if (node.type !== 'dir') throw new Error('Not a directory')
    if (Object.keys(node.children).length) throw new Error('Directory not empty')
    this.rm(path)
  }

  tree(path = '/', depth = 2): string {
    const node = this.getNode(path)
    if (!node || node.type !== 'dir') return ''
    const lines: string[] = []
    const walk = (dir: DirNode, prefix: string, level: number) => {
      if (level < 0) return
      const names = Object.keys(dir.children).sort()
      names.forEach((name, idx) => {
        const child = dir.children[name]
        const isLast = idx === names.length - 1
        const connector = isLast ? '└── ' : '├── '
        lines.push(prefix + connector + name + (child.type === 'dir' ? '/' : ''))
        if (child.type === 'dir') {
          const newPrefix = prefix + (isLast ? '    ' : '│   ')
          walk(child, newPrefix, level - 1)
        }
      })
    }
    lines.push(path === '/' ? '/' : path + '/')
    walk(node, '', depth)
    return lines.join('\n')
  }

  stat(path: string): FsStat {
    const node = this.getNode(path)
    if (!node) throw new Error('No such path')
    const name = path === '/' ? '/' : this.splitPath(path).slice(-1)[0]
    const size = node.type === 'file' ? (node.content?.length ?? 0) : 0
    return {
      path,
      name,
      type: node.type,
      size,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    }
  }

  touch(path: string) {
    const node = this.getNode(path)
    if (!node) {
      this.writeFile(path, '')
      return
    }
    node.updatedAt = now()
  }

  copyFile(src: string, dest: string) {
    const srcNode = this.getNode(src)
    if (!srcNode) throw new Error('No such file: ' + src)
    if (srcNode.type !== 'file') throw new Error('Is a directory: ' + src)
    const content = srcNode.content
    this.writeFile(dest, content)
  }

  rename(src: string, dest: string) {
    const srcNode = this.getNode(src)
    if (!srcNode) throw new Error('No such path: ' + src)
    const srcParts = this.splitPath(src)
    const srcName = srcParts.pop() as string
    const srcParentPath = '/' + srcParts.join('/')
    const parent = this.ensureDir(srcParentPath)
    if (!parent) throw new Error('Invalid parent for: ' + src)

    // Moving across directories: create at dest then delete src
    if (srcNode.type === 'file') {
      this.writeFile(dest, srcNode.content)
      delete parent.children[srcName]
      return
    }
    throw new Error('rename: directories not supported')
  }
}

export const fs = new VirtualFS() 