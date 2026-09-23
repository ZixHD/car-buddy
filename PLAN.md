# Car Buddy — MVP Plan

Status: **Phase 1 complete and verified running on Android** (see §8). Phase 2 (real OBD-II hardware) is planned in §9, awaiting go-ahead.

## 1. Confirmed stack

| Layer | Choice | Why |
|---|---|---|
| App | React Native + Expo (TypeScript) | Cross-platform, required anyway for BLE later |
| Local DB | `expo-sqlite` + **Drizzle ORM** | Type-safe schema/queries, real migrations, far less boilerplate than raw SQL, lighter than WatermelonDB since we don't need its sync engine in Phase 1 |
| Styling | **NativeWind** (Tailwind for RN) | Fast, consistent, easy dark-mode/theming, good accessibility defaults |
| Navigation | React Navigation (native-stack + bottom-tabs) | De facto standard for Expo |
| State | Zustand (UI/app state) + TanStack Query (read layer over Drizzle) | Simple, no Redux ceremony |
| i18n | i18next / react-i18next, `en` + `sr` | Required from day one per spec |
| Notifications | expo-notifications (local only) | No push server needed for reminders |
| OBD (Phase 2, not now) | `react-native-ble-plx` behind `ObdAdapter` interface | Isolates ELM327 clone hell from the rest of the app |
| Package manager | npm | Default; say the word to switch to pnpm/yarn |
| Testing | Jest + `@testing-library/react-native` | Standard RN testing stack |

Project will live at `C:\Users\Game-R\Projects\car-buddy` (already created, session moved there).

## 2. Architecture overview

```
UI (screens/components, NativeWind)
   │
   ├─ Zustand stores        (ephemeral UI state: active vehicle, form drafts)
   ├─ TanStack Query hooks  (reads/writes against the local DB, cache + invalidation)
   │
Domain layer (pure TS, unit-testable, no RN imports)
   ├─ interval engine        → "what's due, in km or days, whichever first"
   ├─ dtc lookup service     → code → DtcInfo, behind an interface (seed JSON now, LLM-pluggable later)
   └─ ObdAdapter interface   → connect/readMileage/readLiveData/readDtcCodes/clearDtcCodes
         ├─ MockObdAdapter   (Phase 1 — fake data, used by default)
         └─ ElmObdAdapter    (Phase 2 — real BLE, not built yet)
   │
Data layer
   ├─ Drizzle schema + migrations (SQLite, on-device, source of truth)
   └─ bundled seed data (dtc-codes.json, ~100–200 common codes, en+sr)

Cross-cutting
   ├─ i18n (en/sr resource files, all strings routed through t())
   ├─ theme (light/dark tokens, severity colors + icons — never color alone)
   └─ notifications scheduler (derived from interval engine output)
```

Nothing in Phase 1 talks to the network. No account, no backend. The `ObdAdapter` interface is the seam where Phase 2 hardware slots in without touching UI code, and a future `Phase3CloudSync` seam sits next to the Drizzle layer without this plan needing to guess its shape yet.

## 3. Folder structure

```
car-buddy/
  app/                      # Expo Router screens (or React Navigation if you'd rather — flag it)
    (tabs)/
      index.tsx             # Home / dashboard ("is my car OK, what's due")
      garage.tsx
      history.tsx
      diagnostics.tsx       # DTC / "advanced" tab, kept separate from home per UX principle
      settings.tsx
    vehicle/[id]/            # vehicle detail, edit, mileage log, service intervals
  src/
    domain/
      interval-engine/       # pure functions + tests
      dtc/                   # DtcInfo lookup service + interface
      obd/                   # ObdAdapter interface, MockObdAdapter
    db/
      schema.ts               # Drizzle schema
      migrations/
      seed/dtc-codes.json
      client.ts
    stores/                   # Zustand stores
    hooks/                    # TanStack Query hooks per entity
    i18n/
      en.json
      sr.json
      index.ts
    theme/
    components/               # shared UI (Card, SeverityBadge, EmptyState, etc.)
  __tests__/
  app.json / eas.json
  README.md
```

Open question: **Expo Router vs React Navigation directly** — Expo Router gives file-based routing and is the current Expo default; I'd default to it unless you have a preference. Will note as "assumed" and proceed unless you say otherwise.

## 4. Data model (Drizzle schema, SQLite)

```ts
vehicles
  id, nickname, make, model, year,
  fuelType, engineDisplacementL, enginePowerHp, transmission,
  vin, plate, currentOdometerKm,
  purchaseDate, registrationExpiry, insuranceExpiry,
  photoUri, createdAt

odometer_readings
  id, vehicleId, valueKm, date, source ('manual' | 'obd')

service_intervals
  id, vehicleId, type ('small' | 'big' | 'yearly' | 'custom'),
  label, intervalKm (nullable), intervalMonths (nullable),
  lastServiceOdometerKm (nullable), lastServiceDate (nullable),
  enabled

service_records
  id, vehicleId, type, description, date, odometerKm,
  cost, currency ('RSD' | 'EUR' | 'USD'), location, notes, receiptUri

dtc_readings
  id, vehicleId, code, timestamp, cleared (bool)

-- bundled, not user data, ships as JSON + loaded read-only:
dtc_info (seed)
  code, name, meaning, severity ('safe' | 'soon' | 'stop'), costMin, costMax,
  ignoreConsequence, locale
```

Interval math (the one piece that MUST have tests): a `ServiceInterval` is "due" when `currentOdometer - lastServiceOdometerKm >= intervalKm` **OR** `today - lastServiceDate >= intervalMonths`, whichever trips first — and must degrade sensibly when `lastServiceOdometerKm`/`lastServiceDate` are null (never-serviced case) or when odometer readings go backwards (used-car odometer correction / bad manual entry).

## 5. Default service intervals (proposed — please confirm or edit)

| Type | Default km | Default time | Notes |
|---|---|---|---|
| Small service (oil + filter) | 10,000 km | 12 months | |
| Big service (belt, plugs, filters) | 60,000 km | 48 months | Varies hugely by engine — flagged as "confirm per car" in UI |
| Yearly / registration / inspection | — | 12 months | Serbia's mandatory annual technical inspection cadence |
| Custom (brakes, tires, coolant, etc.) | user-defined | user-defined | No default, user adds as needed |

All editable per-vehicle in the app; these are just the seed values on first vehicle creation.

## 6. Phase 1 milestones (this session)

Each milestone is a runnable state of the app, committed separately:

1. **Scaffold** — Expo + TS + NativeWind + Expo Router + Drizzle wired to an empty DB + i18n boot (en/sr) + basic tab navigation shell.
2. **Garage CRUD** — add/edit/delete vehicle, vehicle list, vehicle detail screen.
3. **Mileage tracking** — manual odometer entry, history list + simple line chart, average km/month.
4. **Service intervals + reminders** — interval engine (with unit tests) + dashboard "due soon/overdue" cards + `expo-notifications` scheduling.
5. **Service history log** — CRUD for service records, cost totals, filter by category.
6. **DTC explanation UI (mocked)** — bundled DTC seed dataset, `MockObdAdapter` returning fake live data/codes, diagnostics tab showing plain-language severity cards.
7. **Polish pass** — README (setup + run instructions), basic test suite for interval engine + DTC lookup, empty states, accessibility check on severity colors.

Deferred (explicitly not built now, but not precluded): real BLE/ELM327 adapter, EAS dev client, Supabase sync, LLM-backed DTC explanations, VIN decode API, shareable history export.

## 7. Assumptions I'm making unless corrected

- Expo Router for navigation (vs. bare React Navigation).
- npm as package manager.
- Currency default RSD with EUR/USD selectable per entry, no live FX conversion in Phase 1.
- No CI/CD setup this session (can add GitHub Actions later on request).
- No app icon/branding assets yet — placeholder Expo defaults.

## 8. Phase 1 status: done

All 7 milestones shipped, tested (16 passing unit tests), and verified running live on an Android emulator (Garage CRUD, mileage, service reminders with default-interval seeding, service history, and the mock-diagnostics DTC explanation UI all confirmed working end-to-end, not just compiled). See [README.md](./README.md) for what's implemented and the scope decisions made along the way.

## 9. Phase 2 plan: real OBD-II hardware

**Goal:** replace `MockObdAdapter` with a real `ElmObdAdapter` that talks to a Bluetooth LE ELM327 dongle. No screen should need to change — that's the entire reason the `ObdAdapter` interface exists.

### 9.1 Why this phase is fundamentally different from Phase 1

- `react-native-ble-plx` (the BLE library) contains native code. **Expo Go can no longer run this app once it's added** — we need a custom "dev client" build instead (`expo-dev-client` + either a local build or an EAS cloud build).
- Phase 1 could be fully built and verified blind, because everything was mock data and pure logic. Phase 2's core value — actually talking to an ELM327 — **cannot be fully verified without a physical dongle**, and cheap ELM327 clones are notorious for firmware quirks (slow responses, non-standard init behavior, dropped commands). I can build a correct implementation against the public, standard AT-command and SAE J1979 specs, but the last-mile "does it actually work with the batch of clone dongles" step needs your hardware and your feedback loop.

### 9.2 Staged build order

| Stage | What | Needs a dongle to verify? | Status |
|---|---|---|---|
| 1. Dev client infrastructure | Add `expo-dev-client` + `react-native-ble-plx`; Android/iOS Bluetooth permissions in `app.json`; build a custom dev client | No | ✅ Done — built and installed locally via `npx expo run:android`, boots correctly on the Android emulator |
| 2. BLE scanning UI | "Connect" flow becomes: request permissions → scan → list nearby BLE devices → pick one → attempt connection. Handle Bluetooth-off, permission-denied, no-devices-found states | Partially — scanning can be verified against *any* nearby BLE device, just not ELM327-specific behavior | ✅ Done — `src/app/ble-scan.tsx` + `useBleScanner` hook. Verified live: real Android permission dialog appeared (Bluetooth-only, no location prompt, confirming `neverForLocation` worked), correctly detected Bluetooth-off on the emulator and showed the intended fallback message. Linked from Settings, not yet wired into Diagnostics (deliberately — see 9.1) |
| 3. ELM327 protocol (`ElmObdAdapter`) | AT handshake (`ATZ`, `ATE0`, `ATL0`, `ATSP0`, …), Mode 01 PID requests for the live-data fields we already show (RPM, speed, coolant temp, battery, fuel level, intake air temp), Mode 03/04 for reading/clearing DTCs, response parsing per SAE J1979 formulas | **Yes** — real dongle required | ⏳ Blocked on you getting a dongle |
| 4. Robustness / compatibility | Per-command timeouts + retries, friendly fallback messaging (spec's own requirement: "never crash"), notes on clone-specific quirks as they're discovered | **Yes**, ideally with more than one dongle/clone over time | ⏳ Blocked on you getting a dongle |

### 9.3 A limitation worth setting expectations on now

The original spec listed "auto-read mileage" from the dongle. Standard OBD-II (SAE J1979) **does not universally expose an odometer PID** — it's inconsistent across manufacturers and older cars often don't support it at all. Rather than silently under-deliver, Phase 2 will treat auto-odometer as best-effort: use it where the vehicle supports it, fall back to manual entry with a clear "not supported on this vehicle" message otherwise. Live data (RPM, speed, temps) and DTCs are standard and reliable across virtually all OBD-II vehicles (2001+ petrol, 2003+ diesel in the EU).

### 9.4 Platform strategy

- **Android first**, built locally via `npx expo run:android` using the Android Studio/SDK already on this machine — free, no account needed, and it's what we've already got a working emulator for.
- **iOS deferred**: there's no Mac available here, so a local iOS dev-client build isn't possible. iOS would need an EAS cloud build plus an Apple Developer Program membership ($99/year) for device provisioning. Worth revisiting once Android is proven out.

### 9.5 Decisions made (as of 2026-09-23)

1. No ELM327 dongle yet — Stages 3–4 wait until one's bought.
2. Android first confirmed; iOS deferred.
3. No EAS account — not needed yet since the dev client was built locally (`npx expo run:android`, no cloud build, no account). Will only need one for an eventual iOS cloud build or distributing beyond this machine.

### 9.6 Next step

Buy an ELM327 BLE dongle to unblock Stage 3. In the meantime nothing else is planned here — Stages 1–2 are complete and there's little value in speculatively building more BLE plumbing without hardware to build it against.
