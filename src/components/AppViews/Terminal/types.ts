export type TerminalLine = {
  id: string
  type: 'input' | 'output' | 'system'
  text: string
  promptUser?: string
  promptHost?: string
  promptCwd?: string
}

export interface TerminalTheme {
  name: 'monokai' | 'classic' | 'dracula'
  background: string
  foreground: string
  accent: string
  subtle: string
  cursor: string
}

export type FileNodeType = 'file' | 'dir'

export interface BaseNode {
  name: string
  type: FileNodeType
  createdAt: number
  updatedAt: number
}

export interface FileNode extends BaseNode {
  type: 'file'
  content: string
}

export interface DirNode extends BaseNode {
  type: 'dir'
  children: Record<string, FileNode | DirNode>
}

export type FsNode = FileNode | DirNode

export interface TerminalEnv {
  USER: string
  HOST: string
  SHELL: string
  PWD: string
  THEME: TerminalTheme['name']
  [key: string]: string
}

export interface CommandResult {
  lines?: string[]
  clear?: boolean
  cwd?: string
}

export type CommandHandler = (
  args: string[],
  ctx: CommandContext
) => Promise<CommandResult | void> | CommandResult | void

export interface CommandSpec {
  name: string
  description: string
  usage?: string
  handler: CommandHandler
}

export interface CommandRegistry {
  [name: string]: CommandSpec
}

export interface CommandContext {
  cwd: string
  setCwd: (path: string) => void
  env: TerminalEnv
  setEnv: (key: string, value: string) => void
  fs: {
    readFile: (path: string) => string
    writeFile: (path: string, content: string) => void
    appendFile: (path: string, content: string) => void
    exists: (path: string) => boolean
    isDir: (path: string) => boolean
    list: (path?: string) => string[]
    mkdir: (path: string) => void
    rm: (path: string) => void
    rmdir: (path: string) => void
    tree: (path?: string, depth?: number) => string
    resolve: (path: string) => string
  }
  print: (text: string) => void
  println: (text?: string) => void
  clear: () => void
  history: string[]
  signal: AbortSignal
} 