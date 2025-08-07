# 🍎 macOS Web Desktop Environment

A fully interactive web-based desktop UI that replicates the look, feel, and functionality of macOS. Built with React, TypeScript, and modern web technologies, this project features draggable windows, a glass-style dock, authentic macOS interactions, and a complete window management system.

![macOS Web Desktop](https://img.shields.io/badge/macOS-Inspired-blue?style=for-the-badge&logo=apple)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)

## ✨ Features

### 🪟 Window Management
- **Draggable Windows**: Smooth drag interactions with `react-rnd`
- **Resizable Windows**: Resize from any corner or edge
- **Window Controls**: Authentic macOS traffic light buttons (close, minimize, maximize)
- **Focus Management**: Click-to-focus with proper z-index handling
- **Glass Aesthetics**: Professional translucent windows with backdrop blur

### 🚢 macOS-Style Dock
- **Glass Design**: Authentic translucent dock with backdrop blur effects
- **App Icons**: Support for both .icns files and emoji fallbacks
- **Running Indicators**: White dots show which apps are currently open
- **Hover Effects**: Smooth scaling animations on hover
- **Trash Integration**: Separate trash icon with divider like real macOS

### 🎨 Visual Design
- **Glass Materials**: Consistent glass aesthetics throughout
- **Beautiful Backgrounds**: SVG-based wallpapers with flowing gradients
- **Professional Shadows**: Realistic depth and lighting
- **Smooth Animations**: Butter-smooth transitions and interactions

### 🔧 Developer Experience
- **Modular Architecture**: Clean, reusable component structure
- **Type Safety**: Full TypeScript implementation
- **Easy Extensibility**: Simple app configuration system
- **Performance Optimized**: Efficient rendering and state management

## 🛠️ Tech Stack

| Purpose | Technology |
|---------|------------|
| **Frontend Framework** | React 18+ with TypeScript |
| **Styling** | Tailwind CSS |
| **Drag & Resize** | react-rnd |
| **Animations** | Framer Motion |
| **State Management** | React Context API |
| **Build Tool** | Next.js 15+ |
| **Icons** | Lucide React + Custom .icns |

## 📁 Project Structure

```
src/
├── components/
│   ├── Desktop.tsx               # Main desktop container
│   ├── Dock/
│   │   ├── Dock.tsx              # Glass dock with app icons
│   │   ├── DockIcon.tsx          # Individual dock icon component
│   │   └── dockConfig.ts         # App configuration and settings
│   ├── Window/
│   │   ├── Window.tsx            # Draggable, resizable window container
│   │   └── WindowHeader.tsx      # macOS-style title bar with traffic lights
│   ├── AppViews/                 # Individual app implementations
│   │   └── NotesApp.tsx          # Example notes application
│   └── ui/                       # Shared UI components
│       ├── button.tsx
│       └── input.tsx
├── context/
│   └── WindowManagerContext.tsx  # Global window state management
├── app/                          # Next.js app directory
│   ├── globals.css               # Global styles and utilities
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
└── public/
    ├── AppIcons/                 # .icns app icon files
    └── Desktop/                  # Background images and assets
        └── bg-purple.svg         # Desktop wallpaper
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd macos-web-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 👨‍💻 Developer Guide

### Adding New Apps

1. **Create App Component**
   ```tsx
   // src/components/AppViews/MyApp.tsx
   export function MyApp() {
     return (
       <div className="h-full p-4">
         <h1>My Custom App</h1>
         {/* Your app content */}
       </div>
     )
   }
   ```

2. **Add App Icon**
   - Place `.icns` file in `public/AppIcons/myapp.icns`
   - Or use emoji as fallback

3. **Configure in Dock**
   ```tsx
   // src/components/Dock/dockConfig.ts
   import { MyApp } from '@/components/AppViews/MyApp'

   export const dockApps: DockAppConfig[] = [
     // ... existing apps
     {
       id: 'myapp',
       name: 'My App',
       icon: '🚀', // Fallback emoji
       iconPath: '/AppIcons/myapp.icns',
       component: MyApp,
       defaultPosition: { x: 100, y: 100 },
       defaultSize: { width: 800, height: 600 }
     }
   ]
   ```

### Window Management

The `WindowManagerContext` provides these functions:

```tsx
const {
  windows,              // Array of open windows
  openWindow,           // Open new window
  closeWindow,          // Close window by ID
  minimizeWindow,       // Minimize window
  maximizeWindow,       // Toggle maximize
  focusWindow,          // Bring window to front
  updateWindowPosition, // Update window position
  updateWindowSize,     // Update window size
} = useWindowManager()
```

### Styling Guidelines

1. **Glass Effects**
   ```css
   background: rgba(255, 255, 255, 0.1);
   backdrop-filter: blur(20px) saturate(150%);
   border: 1px solid rgba(255, 255, 255, 0.2);
   ```

2. **Consistent Shadows**
   ```css
   box-shadow: 
     0 8px 32px rgba(0, 0, 0, 0.15),
     0 2px 8px rgba(0, 0, 0, 0.1);
   ```

3. **Smooth Transitions**
   ```css
   transition: all 200ms ease-out;
   ```

### Adding Custom Backgrounds

1. **Add SVG/Image**
   - Place in `public/Desktop/`

2. **Update Desktop Component**
   ```tsx
   // src/components/Desktop.tsx
   <div 
     className="absolute inset-0 bg-cover bg-center"
     style={{
       backgroundImage: 'url(/Desktop/your-background.svg)',
     }}
   />
   ```

### Window State Interface

```tsx
interface WindowState {
  id: string              // Unique identifier
  title: string           // Window title
  component: ComponentType // React component to render
  x: number              // X position
  y: number              // Y position  
  width: number          // Window width
  height: number         // Window height
  isMinimized: boolean   // Minimized state
  isMaximized: boolean   // Maximized state
  zIndex: number         // Layer order
}
```

## 🎨 Customization

### Dock Configuration
Modify `src/components/Dock/dockConfig.ts` to:
- Add/remove apps
- Change default window sizes
- Update app icons
- Configure app behavior

### Glass Effects
Adjust transparency and blur in:
- `src/components/Dock/Dock.tsx`
- `src/components/Window/Window.tsx`
- `src/components/Window/WindowHeader.tsx`

### Color Themes
Update the color palette in:
- `src/app/globals.css`
- Background SVGs in `public/Desktop/`

## 🔧 Performance Tips

1. **Icon Optimization**
   - Use optimized .icns files (<1MB)
   - Preload critical icons
   - Implement lazy loading for large apps

2. **Animation Performance**
   - Use CSS transforms over changing layout properties
   - Prefer `transform` and `opacity` for animations
   - Avoid animating `width`, `height`, `top`, `left`

3. **Memory Management**
   - Close unused windows
   - Implement virtualization for large lists
   - Use React.memo for expensive components

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (if configured)
npm run test
```

## 📦 Building for Production

```bash
# Build static files
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add JSDoc comments for complex functions
- Test on multiple screen sizes
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Apple Inc.** - For the incredible macOS design inspiration
- **React Team** - For the amazing React framework
- **Framer** - For the beautiful animation library
- **Tailwind CSS** - For the utility-first CSS framework

## 🐛 Known Issues

- Window resize may occasionally lag on slower devices
- Some .icns files may not display properly in certain browsers
- Touch devices may have limited drag functionality

## 🗺️ Roadmap

- [ ] File system integration
- [ ] Desktop right-click context menu
- [ ] Window snapping and tiling
- [ ] Multiple desktop support
- [ ] Notification system
- [ ] System preferences app
- [ ] Terminal emulator
- [ ] Built-in calculator app

---

**Made with ❤️ and inspired by macOS** 