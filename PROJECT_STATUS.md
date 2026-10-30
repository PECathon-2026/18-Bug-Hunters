# PROJECT_STATUS — Tsukuyomi Watch

## Current milestone

**M9 Complete — Bug Fixes, React 19 Lint Cleanliness, In-Browser Astro Engine & Polish**
Ready for live demonstration. Fully runnable without Python prerequisites.

## Completed features

- [x] M0 — Japanese aesthetic theme, navigation, routes, typography, status & README.
- [x] M1 — Shared UI components (gauges, toasts, loading skeletons, error states).
- [x] M2 — Location search (geocoding + coordinates + device geolocation), Open-Meteo weather integration, explainable 5-factor Night Honor Score with 7 passing unit tests.
- [x] M3 — Leaflet map with distinct custom markers (pulsing crimson observer base, gold curated sites, illuminated selected beacon), observing windows calculation, site comparison panel.
- [x] M4 — Celestial Scroll event timeline (meteor showers, solar/lunar eclipses, real-time moon phase calculation via `astronomy-engine`, Launch Library 2 rocket launches, ISS pass predictions via CelesTrak TLE and `satellite.js`, tab-based reminders).
- [x] M5 — Spirit Lens interactive UI: drag-and-drop file upload, size/type validation, pointer-draggable before/after comparison slider with fullscreen view and zoom controls.
- [x] M6 — Dual-mode image restoration:
  - **In-Browser Classical Engine:** Unsharp-mask sharpening + adaptive contrast stretch (always works offline, zero Python requirement).
  - **Neural Real-ESRGAN Backend:** FastAPI ONNX service on port 8000 when Python is running.
- [x] M7 — Dual-mode astronomical object detection:
  - **In-Browser Detector:** Classical local background estimation, thresholding, and connected-component centroid/size extraction.
  - **Python Detector:** OpenCV connected-component analysis.
  - Interactive clickable markers with candidate classification (`point_candidate` vs `extended_candidate`) and honest uncalibrated pixel-unit disclaimers.
- [x] M8 — Dojo dashboard overview with live weather check, moon phase, and module access cards.
- [x] M9 — Bug fixes & quality pass:
  - Resolved all React 19 / Next.js 16 compiler ESLint errors (0 errors, 0 warnings).
  - Added 5-minute in-memory caching to `/api/weather` for snappy multi-site comparisons.
  - Added fallback mechanisms so the live hackathon demo never fails even without Python or external internet.

## Features awaiting implementation / deferred (Post-Hackathon)

- User authentication & user accounts
- Database persistence (saved stargazing sessions)
- Cloud-hosted GPU cluster for real-time model training
- Background push notification service worker (when app tab is closed)
- Live satellite photometer light pollution sensor network

## Architecture decisions

- **Option C:** Next.js BFF (Backend for Frontend) in TypeScript with optional Python service for AI.
- **In-Browser Resilient Fallback:** Canvas-based classical astro enhancement and candidate star detection runs directly in the client so the app demo succeeds seamlessly on any laptop.
- **Stateless MVP:** Clean, zero-database architecture with in-memory caching.
- **Scientific Honesty:** Clear disclaimers that qualitative image enhancement is not scientifically calibrated data, and detected objects are candidate pixel regions rather than confirmed catalog bodies.

## Test and build results (Verified on local machine)

- **`npm.cmd run test`**: 15 / 15 unit tests passed (Night Honor Score, event filters, file validation).
- **`npm.cmd run lint`**: 0 errors, 0 warnings (100% clean Next.js / React 19 compiler pass).
- **`npm.cmd run typecheck`**: 0 TypeScript errors.
- **`npm.cmd run build`**: Production build succeeds (Turbopack, static page generation, dynamic API routes).

## How to run the application

```cmd
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
