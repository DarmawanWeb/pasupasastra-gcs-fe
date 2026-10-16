<div align="center">

<img src="docs/logo.svg" width="96" alt="PASUPASASTRA logo">

# PASUPASASTRA GCS console

**The operator console of PASUPASASTRA: a QGroundControl-style multi-drone ground control station
with a CesiumJS 3D map, fly and plan views, payload drop, live video with AI overlays and a voice
assistant. Runs in the browser and as a Tauri desktop app, with a full in-browser demo mode.**

[![CI](https://github.com/DarmawanWeb/pasupasastra-gcs-fe/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/DarmawanWeb/pasupasastra-gcs-fe/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16%20static%20export-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9%20strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Cesium](https://img.shields.io/badge/CesiumJS-3D%20map-6CADDF?logo=cesium&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-2%20desktop-24C8D8?logo=tauri&logoColor=white)
![Biome](https://img.shields.io/badge/lint-Biome-60A5FA?logo=biome&logoColor=white)
![UI](https://img.shields.io/badge/UI-Bahasa%20Indonesia-FF9F43)
[![License](https://img.shields.io/badge/license-proprietary-B42318)](LICENSE)

[Features](#features) · [Quick start](#quick-start) · [Desktop](#desktop-tauri-2) ·
[Backend contract](#backend-contract) · [Structure](#structure) · [Develop](#develop)

</div>

---

Part of [PASUPASASTRA](https://github.com/DarmawanWeb/Pasupasastra), which serves it as a static
export behind Caddy with the [backend](https://github.com/DarmawanWeb/pasupasastra-gcs-be). Next.js 16
(static export), React 19, TypeScript, Tailwind CSS 4, Zustand and CesiumJS; packaged for the desktop
with Tauri 2. The interface is in Bahasa Indonesia; code and comments are in English. Operators have
their own guide, the [Manual Pengguna](https://github.com/DarmawanWeb/Pasupasastra/blob/main/docs/PASUPASASTRA-Manual-Pengguna.pdf).

## Features

- **Terbang** (fly): active-vehicle toolbar (mode, arm state, GPS, battery, link, flight time,
  mission progress, payload), action strip (motors on and off, takeoff, land, RTL, hold, mission,
  go to point, payload release) behind slide-to-confirm, attitude indicator, compass with home
  bearing, flight values, video picture-in-picture.
- **Misi** (plan): click to add waypoints, drag to move, altitude, speed, hold and action per
  waypoint, survey (lawnmower) generator, patrol repeat, distance, duration and battery estimate,
  save, load, import, export, upload and start.
- **Titik drop**: pick coordinates on the map or type them (decimal, MGRS, a pasted "lat, lon"),
  assign a drone, drop altitude and approach speed, execute and track
  `enroute → stabilizing → released → returning → completed`, cancel, drag targets.
- **Peta armada**: fleet overview, drone panel, live track, flight history replay.
- **Video**: grid with paging, a detection model per stream, focus mode with bounding boxes, live
  scene captions and an AI assistant (visual Q&A) with speech-to-text input.
- **Drone**: registry with several video sources (RTMP, RTSP, WebRTC/WHEP, HLS, SRT), telemetry
  link (MAVLink UDP, TCP or serial, WebSocket bridge) with a link test, and the flight limits the
  failsafes use. **Kamera**: fixed cameras, phones and CCTV.
- **Model AI**: drag-and-drop upload with progress and cancel, load and unload on the inference
  worker, edit classes, delete.
- **Log**: event log with filters and CSV export; flight history with GPX export.
- **Pengaturan**: password, coordinate format (DD, DMS, MGRS), speed units, map layer, alert
  sound, speech-to-text engine and language, connection test.

## Quick start

```bash
npm ci                # also copies the Cesium assets into public/cesium
npm run dev           # http://localhost:3000
```

Without `NEXT_PUBLIC_API_URL` the console runs in **demo mode**: the whole backend is simulated in
the browser (flight physics, missions, payload drop, failsafes, video and AI mocks).

| Username   | Password     | Role          |
| ---------- | ------------ | ------------- |
| `operator` | `pasupati`   | Operator      |
| `admin`    | `admin12345` | Administrator |

Optional mock videos: put `stream-1.mp4` … `stream-4.mp4` in `public/mock/`. Demo data persists in
`localStorage`; reset it in **Pengaturan → Koneksi**.

| Variable               | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`  | REST base URL, e.g. `http://192.168.1.10:8081/api`. Empty = demo. |
| `NEXT_PUBLIC_WS_URL`   | Realtime base URL. Defaults to the API URL with `ws(s)://`.  |
| `NEXT_PUBLIC_USE_MOCK` | `true` forces demo mode even with an API URL.                |

Values are inlined at build time (static export), desktop builds included.

## Desktop (Tauri 2)

Prerequisites: Rust stable (`rustup`) and the platform packages from
<https://tauri.app/start/prerequisites/> (WebView2 on Windows, Xcode Command Line Tools on macOS,
`webkit2gtk-4.1` and friends on Linux).

```bash
npm run tauri:dev
NEXT_PUBLIC_API_URL=http://192.168.1.10:8081/api npm run tauri:build
npm run tauri -- icon src-tauri/icons/app-icon.png   # regenerate every icon size
```

The desktop shell loads the static export from `out/`. Because dynamic segments cannot be exported
for IDs known only at runtime, detail views use query parameters: `/dashboard/map?drone=<id>`,
`/dashboard/video/focus?stream=<id>`, `/dashboard/settings?tab=<tab>`.

## Backend contract

All REST calls go through one axios instance (`src/lib/api/client/http.ts`) that
sends `Authorization: Bearer <token>`; a `401` clears the session. WebSocket and
SSE cannot carry headers, so they receive the token as `?access_token=`.

Interfaces live in `src/lib/api/contracts/`; implement the backend against them.

| Method | Path                               | Contract                         |
| ------ | ---------------------------------- | -------------------------------- |
| POST   | `/auth/login`                      | `AuthApi.login`                  |
| GET    | `/auth/me`                         | `AuthApi.me`                     |
| POST   | `/auth/change-password`            | `AuthApi.changePassword`         |
| POST   | `/auth/logout`                     | `AuthApi.logout`                 |
| GET    | `/drones`, `/drones/:id`           | `DronesApi.list / get`           |
| POST   | `/drones`                          | `DronesApi.create`               |
| PUT    | `/drones/:id`                      | `DronesApi.update`               |
| DELETE | `/drones/:id`                      | `DronesApi.remove`               |
| POST   | `/drones/test-link`                | `DronesApi.testLink`             |
| GET    | `/drones/:id/flights`              | `DronesApi.flights`              |
| POST   | `/drones/:id/commands`             | `VehicleApi.send`                |
| POST   | `/drones/:id/mission`              | `MissionsApi.upload`             |
| GET    | `/cameras`                         | `CamerasApi.list`                |
| POST   | `/cameras`, PUT `/cameras/:id`     | `CamerasApi.create / update`     |
| DELETE | `/cameras/:id`                     | `CamerasApi.remove`              |
| GET    | `/streams`                         | `StreamsApi.list`                |
| PUT    | `/streams/:id/model`               | `StreamsApi.setModel`            |
| POST   | `/streams/focus`                   | `StreamsApi.setFocus`            |
| GET    | `/streams/:id/detections/latest`   | `StreamsApi.latestDetections`    |
| SSE    | `/streams/:id/captions`            | `StreamsApi.subscribeCaptions`   |
| GET    | `/models`                          | `ModelsApi.list`                 |
| POST   | `/models` (multipart)              | `ModelsApi.upload`               |
| PATCH  | `/models/:id`                      | `ModelsApi.update`               |
| DELETE | `/models/:id`                      | `ModelsApi.remove`               |
| POST   | `/models/:id/load`, `/unload`      | `ModelsApi.load / unload`        |
| POST   | `/vlm/ask`                         | `AssistantApi.askVlm`            |
| POST   | `/stt/transcribe` (multipart)      | `AssistantApi.transcribe`        |
| GET    | `/missions?droneId=`               | `MissionsApi.list`               |
| GET    | `/missions/:id`                    | `MissionsApi.get`                |
| POST   | `/missions`, PUT `/missions/:id`   | `MissionsApi.save`               |
| DELETE | `/missions/:id`                    | `MissionsApi.remove`             |
| GET    | `/drops`                           | `DropsApi.list`                  |
| POST   | `/drops`, PUT `/drops/:id`         | `DropsApi.create / update`       |
| DELETE | `/drops/:id`                       | `DropsApi.remove`                |
| POST   | `/drops/:id/execute`, `/cancel`    | `DropsApi.execute / cancel`      |
| GET    | `/events?limit=`                   | `EventsApi.list`                 |
| GET    | `/health`                          | `SystemApi.health`               |
| WS     | `/ws/realtime`                     | `RealtimeApi.connect`            |

Realtime messages (`RealtimeMessage`), single objects or JSON arrays:

```ts
{ type: "telemetry", droneId, data: DroneTelemetry }   // partial frames are merged
{ type: "link", droneId, link: "connected" | "degraded" | "lost" | "offline" }
{ type: "event", event: GcsEvent }
{ type: "drop", target: DropTarget }
```

Error bodies may carry `message` or `detail` (FastAPI style); it is shown to the
operator as-is, so return it in Bahasa Indonesia.

## Structure

```
src/
  app/                  routes (login, dashboard/*) with route-local _components/ and _lib/
  components/
    map/                Cesium canvas and declarative layers (drones, markers, lines, camera)
    layout/             header, fleet bar, footer, shell
    providers/          auth guard, realtime buffer, store hydration, redirects
    ui/                 buttons, fields, dialog, slide-to-confirm, toaster, tabs
    video/, events/, assistant/
  hooks/                fleet, speech-to-text, vehicle commands, streams
  lib/
    api/                contracts, axios client, http and mock implementations, simulator
    geo.ts, mgrs.ts, mission.ts, format.ts, validators.ts
  stores/               Zustand stores (persisted ones hydrate after mount)
  types/                domain types shared with the backend
src-tauri/              Tauri 2 desktop shell
```

- Base map tiles come from ArcGIS and OpenStreetMap. For closed networks, point
  `src/components/map/map-layers.ts` at an on-premise tile server.
- Browser speech recognition (Web Speech API) needs internet access; the **Server** engine records
  audio and posts it to `/stt/transcribe` instead (Whisper), which also works in the desktop app.

## Develop

```bash
npm run lint && npm run typecheck   # Biome lint and format check, tsc --noEmit
npm run build                       # static export to out/
lefthook install                    # git hooks: Biome, tsc, conventional commits
```

CI ([ci.yml](.github/workflows/ci.yml)) runs the lint, the type check and the static export on every
push and pull request.

Proprietary: © 2026 I Wayan Agus Darmawan (DarmawanWeb), all rights reserved. See [LICENSE](LICENSE).
