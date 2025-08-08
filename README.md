## macos-web

<p align="center">
  <img src="images/image.png" alt="macOS Web Desktop preview" width="900" />
</p>

A minimal macOS‑style desktop, built with pure Next.js + React. Windows, Dock, Top Bar, and a few demo apps (Notes, Terminal, Safari, VSCode, Music).

### Philosophy
- **KISS + YAGNI**: simple state, straightforward components
- **Pure Next.js**: no backend, no DB, no heavy state libraries
- **Small helpers only**: a few lightweight libs where they earn their keep

### Tiny stack
- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS 4** for styling
- **framer-motion** for subtle animations
- **react-rnd** for window drag/resize
- **@radix-ui/react-dropdown-menu** for context menus
- Optional utilities: **clsx**, **class-variance-authority**, **tailwind-merge**, **next-themes**, icons

That’s it. No Redux, no server, no ORM.

### Key pieces
- `src/context/WindowManagerContext.tsx` — window lifecycle (open/close/minimize/maximize), focus and z‑index
- `src/components/Desktop.tsx` — desktop surface and right‑click menu
- `src/components/Dock/` — dock UI and app launcher (`Dock.tsx`, `dockConfig.ts`)
- `src/components/Window/Window.tsx` — window frame with drag/resize/maximize animations
- `src/components/AppViews/NotesApp.tsx` — minimal notes editor
- `src/components/AppViews/Terminal/` — in‑browser terminal with a small in‑memory FS

### Run locally
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`

### Add an app to the Dock
1) Create your app component.
2) Add an entry in `src/components/Dock/dockConfig.ts` under `dockApps`:

```ts
{
  id: 'myapp',
  name: 'My App',
  iconPath: '/AppIcons/myapp.png',
  component: MyApp,
  defaultPosition: { x: 120, y: 120 },
  defaultSize: { width: 800, height: 600 },
}
```

Launch it from the Dock; the window system takes care of positioning, focus, and resizing.
