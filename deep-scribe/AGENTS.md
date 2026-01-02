# Deep Scribe - Agents Configuration

A desktop application for authors to write, research, and publish content. Built with Electron + React + TypeScript frontend and Python FastAPI backend using the sidecar pattern.

## Project Overview

**Tech Stack:**
- Frontend: Electron + Vite + React 18 + TypeScript + Tailwind CSS
- Backend: Python 3 + FastAPI + Uvicorn
- Communication: HTTP REST API (Electron ↔ Python)
- State Management: Zustand (React Flow for research visualization)
- UI Components: Lucide React icons, React Flow, React Resizable Panels

**Project Structure:**
```
deep-scribe/
├── electron/               # Electron main process (TypeScript)
│   ├── main.ts            # Window creation, Python subprocess spawning
│   ├── preload.ts         # IPC bridge to renderer
│   └── services/          # Gemini SDK, Settings management
├── src/                   # React frontend
│   ├── components/        # React components
│   │   ├── Dashboard/     # Tabbed dashboard system (PRIMARY)
│   │   ├── NewsFeed/      # News article masonry grid
│   │   ├── Research/      # AI research workflow
│   │   └── Settings/      # API key & preference management
│   ├── hooks/             # useInfiniteScroll, custom hooks
│   ├── services/          # API clients (Gemini, GNews)
│   ├── store/             # Zustand stores (research state)
│   └── types/             # TypeScript interfaces
├── python_backend/        # FastAPI backend
│   ├── main.py           # Entry point, endpoints
│   └── requirements.txt   # Python dependencies
├── dist-electron/         # Built Electron code (compiled from electron/)
├── index.html            # Entry point
├── vite.config.ts        # Vite configuration
└── electron-builder.yml  # Electron builder config
```

## Build & Development

### Development Mode
```bash
# Install dependencies
npm install
python3 -m venv venv
source venv/bin/activate
pip install -r python_backend/requirements.txt

# Run development server (Vite + Electron + Python backend)
npm run dev
```

### Production Build
```bash
npm run build
```

## Code Style & Conventions

### React/TypeScript
- Use functional components with hooks (never class components)
- Use `const` for components and functions, never `var`
- Use TypeScript interfaces for props and state (no `any` types)
- Import from `lucide-react` for all icons
- Style with Tailwind CSS classes (use `clsx` and `twMerge` for conditional styles)
- Use Zustand for global state management
- Component organization: imports → types/interfaces → component definition

### File Structure
- Components in `src/components/` with `.tsx` extension
- Services/API clients in `src/services/` with `.ts` extension
- Zustand stores in `src/store/` named `*Store.ts`
- Custom hooks in `src/hooks/` named `use*.ts`
- Types in `src/types/` named `*.ts`

### Naming Conventions
- React components: PascalCase (e.g., `NewsFeed.tsx`)
- Files: kebab-case for services/hooks/types (e.g., `settings-keys.ts`)
- TypeScript interfaces: PascalCase with `I` prefix or just describe the data (e.g., `ArticleCard`, `ResearchState`)

### Tailwind CSS Usage
- Use design system colors: `bg-[#0d1117]`, `border-[#30363d]`, `text-[#8b949e]`
- Mobile-first responsive design: `sm:`, `md:`, `lg:` prefixes
- Animations: `animate-in`, `fade-in`, `duration-200` for consistent transitions
- No inline style props (except for `fontFamily` where Playfair Display serif needed)

### Error Handling
- Wrap async operations in try-catch
- Log errors to console for debugging
- Show user-friendly error messages in UI
- Never silently fail without logging

### API Integration
- All Electron IPC calls use `window.electronAPI.*` (defined in preload.ts)
- REST calls to Python backend at `http://127.0.0.1:${PORT}`
- API keys retrieved from secure Electron settings storage
- Always await async API calls before using results

## Key Components & Features

### Dashboard (NEW - PRIMARY INTERFACE)
- **File:** `src/components/Dashboard/Dashboard.tsx`
- **Tabs:** Home (default), News Feed, Research
- **Closeable tabs:** News Feed and Research can be closed
- **Future:** Add button to add new tabs dynamically
- **State:** Uses local state for tab management

### Research Tab
- **File:** `src/components/Research/ResearchTab.tsx`
- **Workflow:** TopicInput → TopicGraph → ResearchReport
- **State:** Zustand store (`useResearchStore`)
- **Status flow:** idle → surveying → reviewing_plan → researching → synthesizing → complete
- **Features:** 
  - Generate topic map (AI breaks topic into subtopics)
  - Research each subtopic in parallel
  - Synthesize findings into comprehensive report

### News Feed
- **File:** `src/components/NewsFeed.tsx`
- **Source:** GNews API
- **Layout:** Masonry grid with hero, sub-hero, and basic card types
- **Features:** 
  - Infinite scroll with Intersection Observer
  - Category filtering (Tech, Design, Crypto, Culture)
  - Fallback to mock data if API unavailable
  - Requires GNews API key in Settings

### Settings Modal
- **File:** `src/components/Settings/SettingsModal.tsx`
- **Tabs:** API Keys, Research, News Feed, Editor, Advanced
- **Features:**
  - Granular control over all app settings
  - Individual test buttons for each API key
  - Settings persisted to localStorage
  - Sliders, toggles, dropdowns, multi-select checkboxes

### API Settings
- **Gemini API Key:** For AI research and content generation
- **GNews API Key:** For news feed articles
- Keys stored securely in Electron main process
- Individual test endpoints for each key

## Development Tasks

### Frontend Implementation
- Fix any remaining TypeScript type errors
- Implement missing component logic
- Add proper error boundaries and fallbacks
- Ensure all API calls handle errors gracefully

### Backend Implementation
- Implement REST endpoints for:
  - Draft creation/update/deletion
  - Medium API integration
  - Export functionality (PDF, HTML)
  - Caching layer
- Add proper request validation
- Implement error handling and logging

### Testing
- Test research workflow end-to-end
- Test news feed infinite scroll
- Test API key validation
- Test settings persistence

### Performance
- Optimize React renders (use React.memo for expensive components)
- Implement request caching
- Lazy load components when possible

## Commands

- `npm run dev` - Start dev server (Vite + Electron + Python)
- `npm run dev:vite` - Start Vite only (port 3000)
- `npm run dev:electron` - Start Electron with existing Vite server
- `tsc -p electron` - Compile Electron TypeScript
- `npm run build` - Production build

## Environment Variables

**.env** (in deep-scribe root):
```
VITE_GNEWS_API_KEY=
PORT=  # Auto-assigned if not set
```

## Important Notes

1. **Don't use localStorage for sensitive data** - Use Electron main process settings
2. **Don't hardcode API endpoints** - Get port from Electron IPC
3. **Always mask API keys in display** - Use `maskKey()` utility
4. **Test API keys before saving** - Use individual test buttons
5. **Handle offline gracefully** - Provide mock data fallbacks
6. **Never block on API initialization** - Use lazy auth pattern
7. **Update requirements.txt** - Whenever adding Python dependencies
8. **Run type check before committing** - `tsc --noEmit`

## Security Considerations

- API keys stored in Electron secure storage (not localStorage)
- Never commit `.env` files
- Validate all user input
- Use HTTPS for external API calls
- Don't log sensitive data
- Context isolation enabled in Electron

## Future Enhancements

1. **Draft Management System** - Save/load/version drafts
2. **Markdown Editor** - Rich editor with preview
3. **Medium Publishing** - Publish drafts directly to Medium
4. **Export Formats** - PDF, HTML, DOCX export
5. **AI Editing Assistant** - Grammar, style, expansion helpers
6. **Collaboration** - Real-time collaborative editing
7. **Voice Input** - Dictation support
8. **Custom AI Models** - Fine-tuning support

---

**Generated:** January 2, 2026
**Last Updated:** When implementing tabbed dashboard system
