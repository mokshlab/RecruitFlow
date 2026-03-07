# Frontend - RecruitFlow

React single-page application for the RecruitFlow job portal with Material-UI and real-time WebSocket features.

## Quick Start

```bash
npm install
npm start  # http://localhost:3000
```

**Environment Setup:**
```bash
echo "REACT_APP_API_URL=http://localhost:5000" > .env
echo "REACT_APP_API_BASE_URL=http://localhost:5000/api" >> .env
```

## Tech Stack

**Core:** React 19.1.1 (Hooks) • React Router 7.9.2 • Material-UI 7.3.2  
**HTTP:** Axios 1.12.2 (auto-retry, JWT interceptors)  
**Real-time:** Socket.io-client 4.6.1 (WebSocket notifications)  
**Auth:** jwt-decode 4.0.0 • localStorage token management

## Architecture

```
src/
├── api/          # Axios instance + API endpoints
├── components/   # Navbar, Footer, JobCard, ProtectedRoutes
├── context/      # AuthContext (global auth state)
├── pages/        # 13 pages (User: 7, Admin: 5, Public: 1)
├── utils/        # constants, errorHandler
└── theme.js      # Material-UI customization
```

## Application Features

**Single-Page Application** with dual authentication flows:

**User Portal:**
- Job search with advanced filters
- Resume and profile photo upload
- Application tracking with real-time status updates
- Job bookmarking

**Admin Portal:**
- Analytics dashboard with statistics
- Job CRUD operations
- Applicant management
- Multi-admin system

**Real-time Features:**
- Socket.io notifications
- Auto-reconnection with retry logic
- Toast alerts for instant updates

## Authentication

**User Authentication:**
- JWT stored in `localStorage.token`
- Protected routes via `UserProtectedRoute` component
- Token automatically attached to API requests

**Admin Authentication:**
- Separate JWT in `localStorage.adminToken`
- Protected routes via `AdminProtectedRoute` component
- Isolated admin API endpoints

## Environment Variables

```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_API_BASE_URL=https://your-backend.onrender.com/api
GENERATE_SOURCEMAP=false  # Production only
CI=true  # Vercel deployment
```

## Production Build

```bash
npm run build  # Creates optimized production build in build/ directory
```

**Deployment:**
- **Platform**: Vercel
- **CI/CD**: Auto-deploy on Git push
- **Routing**: SPA routing configured via `vercel.json` rewrites

> **Note:** The `build/` folder is generated during deployment and is not version controlled.

## Responsive Design

- Mobile-first approach using Material-UI Grid (12-column system)
- Responsive navigation with collapsible Drawer
- Optimized Card components for all screen sizes
- Breakpoints: xs, sm, md, lg, xl

---

**For complete project documentation, see [Main README](../README.md)**
