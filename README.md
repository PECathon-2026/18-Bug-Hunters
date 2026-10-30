# Tsukuyomi Watch — The Samurai's Celestial Guide

PECathon 2026 problem statement **PS-002**: a Japanese-inspired celestial guide for stargazing conditions, astronomy events, and astronomical image exploration.

## Problem statement and objectives

Help users:

1. Find suitable stargazing times/locations using real weather (and honest light-pollution handling).
2. Discover source-backed astronomical events.
3. Upload sky images for qualitative AI restoration and candidate object detection.
4. Explore these features in one cohesive Dojo experience.

## Features

| Module | Status |
| --- | --- |
| **Dojo Dashboard** | Live weather/moon/event summary + navigation |
| **Watchtower** | Geocoding, Open-Meteo weather, Night Honor Score, curated map sites, observing windows |
| **Celestial Scroll** | Filters, moon phase (calculated), curated showers/eclipses, LL2 launches, ISS passes when TLE+SGP4 work |
| **Spirit Lens** | Upload/compare UI + local Python ONNX restore + classical detection |

## Architecture

```text
Browser (Next.js UI)
   ├─ Route Handlers /api/*  → Open-Meteo, LL2, geocode, events, sites
   ├─ Local TS libs          → Night Honor Score, moon phase, filters
   └─ Spirit Lens service    → FastAPI + ONNX Real-ESRGAN + OpenCV detect
```

**Stack decision:** Next.js (TypeScript) BFF + slim Python service only for AI/imaging. No Java, no database, no auth for MVP.

## Technology stack

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Open-Meteo (weather + geocoding)
- Leaflet / react-leaflet + OpenStreetMap tiles
- astronomy-engine (moon)
- Launch Library 2 (rockets)
- CelesTrak TLE + satellite.js (ISS, when available)
- Python FastAPI, ONNX Runtime, OpenCV, Pillow

## Environment variables

Create `.env.local` as needed:

```bash
# Optional: higher LL2 rate limit
LL2_API_TOKEN=

# Optional: use stale unrestricted LL2 dev API during local testing only
LL2_USE_DEV=false

# Browser → Python service
NEXT_PUBLIC_SPIRIT_LENS_URL=http://127.0.0.1:8000

# Optional: local ONNX model path for Spirit Lens
SPIRIT_LENS_MODEL_PATH=
```

Never commit secrets.

## Local installation

### Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Spirit Lens (Python)

```bash
cd services/spirit-lens
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

First restore call may download the ONNX model from Hugging Face (`Heliosoph/realesrgan-onnx`).

## Development commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Testing

```bash
npm run test
```

Covers Night Honor Score, event filters, and upload validation. External APIs are exercised live through the UI / Route Handlers (not mocked as “passing” without a run).

## Production build

```bash
npm run build
npm start
```

Spirit Lens is intended for **local demo** (CPU ONNX). Free serverless hosts typically cannot run the model reliably.

## Deployment

- **Frontend:** Vercel or similar Node host for the Next.js app.
- **Spirit Lens:** Run on the demo machine (or a small VM with enough RAM). Point `NEXT_PUBLIC_SPIRIT_LENS_URL` at that service.
- Expect Open-Meteo attribution and LL2 rate limits (~15 req/hour without a token; cache is used).

## Image restoration methodology

- Model: Real-ESRGAN general x4v3 ONNX (~5 MB), CPU, tiled inference.
- Output is resized back for before/after comparison.
- **Qualitative enhancement only.** The network can invent plausible detail. Original pixels are preserved client-side as a separate blob URL.

## Astronomical object analysis methodology

- Classical pipeline: grayscale → blur → median/MAD threshold → connected components.
- Reports pixel coordinates, approximate size, relative brightness.
- Classifications are `point_candidate` / `extended_candidate` only — not catalog IDs or calibrated magnitudes.

## Night Honor Score

Project metric 0–100 (not official science):

| Factor | Base weight | Better when |
| --- | --- | --- |
| Cloud cover | 45% | Lower |
| Visibility | 25% | Higher (≤2 km poor, ≥20 km excellent) |
| Humidity | 15% | Lower |
| Moon illumination | 10% | Lower |
| Light pollution | 5% | Lower (only if curated/trusted value provided) |

Missing factors are **excluded and weights renormalized**. Unknown is never treated as perfect.

Labels: **favorable** ≥ 70, **moderate** ≥ 40, else **poor**.

## Data sources and attribution

- Weather / geocoding: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0)
- Map tiles: OpenStreetMap contributors
- Launches: [Launch Library 2 / The Space Devs](https://thespacedevs.com/llapi/)
- Moon: astronomy-engine calculations
- ISS TLE: CelesTrak (when reachable)
- Meteor/eclipse entries: curated demo dataset (labelled)
- Observing sites: curated real coordinates with approximate light-pollution estimates (labelled)

## Security assumptions

- No authentication; public demo app.
- Image uploads validated by type/size; Python service re-validates with Pillow.
- Route Handlers only call fixed upstream APIs (not open URL proxies).
- Uploads are processed in memory for the request; not permanently stored by design.
- Timeouts applied on client fetches to the Spirit Lens service.

## Known limitations

- Light pollution is curated/optional, not a live global sensor feed.
- LL2 unauthenticated rate limit is low; cache mitigates but demos should avoid spam refresh.
- ISS predictions require network TLE + satellite.js propagation; otherwise an honest warning is shown.
- Spirit Lens not suitable for free serverless GPU-less hosts.
- Visibility may be missing from some Open-Meteo model responses; UI labels it unavailable.

## Demonstration script

1. Open Dojo — confirm summary weather/moon/events.
2. Watchtower — search a city, confirm Open-Meteo hour + score breakdown.
3. Inspect curated map markers and comparing sites.
4. Celestial Scroll — filter types, open a launch (live) and a meteor shower (curated).
5. Confirm moon phase is calculated.
6. Optionally set an in-tab reminder (works only while tab open).
7. Start Spirit Lens Python service; upload a sky JPEG/PNG.
8. Run restoration; confirm before/after differ.
9. Run detection; inspect candidate list/overlay.
10. Stop the Python service and show the graceful “unavailable” state.

See also [PROJECT_STATUS.md](./PROJECT_STATUS.md).
