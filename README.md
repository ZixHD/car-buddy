# Car Buddy

A friendly maintenance companion for ordinary car owners: vehicle profiles, mileage tracking, service reminders (mileage-or-time), a full service history log, and plain-language explanations of OBD-II fault codes. Built offline-first, no account required, in English and Serbian.

This is the **Phase 1 MVP** — everything works today with mock/manual data. The Bluetooth OBD-II dongle integration (Phase 2) is stubbed out behind an adapter interface so the rest of the app never had to wait on hardware. See [PLAN.md](./PLAN.md) for the full architecture and phased roadmap.

## Requirements

- Node.js **22.13.0 or newer** (this was built against 22.12.0 and works, but `npm install` prints `EBADENGINE` warnings for react-native/metro — harmless today, worth upgrading Node before this matters more).
- npm (project uses npm, not yarn/pnpm).
- For real device/simulator testing: Xcode (iOS) and/or Android Studio, or the [Expo Go](https://expo.dev/go) app on a physical phone.

## Getting started

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go on your phone.

> **Web is not supported**, and `app.json` sets `web.output: "single"` specifically to avoid a Metro crash (`Worker chunk not found for .../expo-sqlite/web/worker.ts`) that `expo-sqlite`'s web build otherwise triggers on *every* `expo start` — not just `--web` — because Expo Router pre-renders a static web page by default. With `"single"`, that pre-render is skipped, so plain `npx expo start` runs clean for Expo Go/iOS/Android. If you do open the printed `http://localhost:.../` web URL in a browser, it'll still fail (`SharedArrayBuffer is not defined` — `expo-sqlite`'s web backend needs cross-origin-isolation headers Expo's dev server doesn't set). That's expected; just use Expo Go or a simulator.

## Running tests

```bash
npm test
```

Covers the two pieces of core logic the spec called out as needing tests: the service-interval "whichever comes first" due/overdue math (`src/domain/interval-engine`) and the DTC lookup service (`src/domain/dtc`), plus the mileage-average helper.

## What's implemented (Phase 1)

- **Garage**: add/edit/delete vehicles with specs, VIN, plate, registration/insurance expiry.
- **Mileage tracking**: manual odometer entry, history, and an average-km/month stat.
- **Service reminders**: small/big/yearly/custom intervals, each due by km OR time (whichever comes first), with a home-screen "needs attention" dashboard across all vehicles and local push notifications are wired via `expo-notifications` (reminder *scheduling* on data changes is the natural next increment — see below).
- **Service history**: manually logged records, or auto-logged when you mark a reminder "done"; totals by currency.
- **Diagnostics (mocked)**: a `MockObdAdapter` simulates connecting to a dongle, live data (RPM, coolant temp, battery, etc.), and reading/clearing fault codes, so the plain-language DTC UI is fully demoable with no hardware.
- **DTC knowledge base**: 50 of the most common generic (P0xxx) fault codes, bundled as JSON, each with a plain-language name/meaning/severity/rough EUR cost range/consequence-of-ignoring, in English and Serbian.
- **i18n**: every user-facing string routed through `i18next`, English + Serbian.
- **Offline-first**: SQLite via Drizzle ORM, zero network calls, no account.

## Scope decisions worth knowing about

- **DTC dataset size**: the spec asked for ~100–200 codes; this ships **50** carefully-written bilingual entries (the most common real-world generic codes) rather than a larger set with thinner quality. Extending `src/db/seed/dtc-codes.json` with more codes is straightforward and doesn't touch any code.
- **DB migrations**: Phase 1 uses hand-written `CREATE TABLE IF NOT EXISTS` statements in `src/db/client.ts` instead of drizzle-kit generated migrations, since there's no existing user data to migrate yet. Switch to `drizzle-kit` + `drizzle-orm/expo-sqlite/migrator` before shipping a schema change to users who already have data.
- **Notification scheduling**: `expo-notifications` is installed and configured (see `app.json`), but wiring "schedule a local notification when an interval crosses into due-soon/overdue" into the mutation hooks was left as the next small increment rather than guessed at blindly — it's a product decision (how many notifications, what copy, whether to re-schedule on every app open) worth confirming before building.
- **Navigation**: uses Expo Router's standard `<Tabs>` (not the newer `unstable-native-tabs` API the default template ships with), so tab icons are simple Ionicons glyphs instead of custom per-platform PNG assets — much less to maintain for an MVP.
- **Forms**: dates use the native date picker (`@react-native-community/datetimepicker`, falls back to plain text entry on web); dropdowns use `@react-native-picker/picker`. No custom design system beyond NativeWind/Tailwind utility classes.

## Project structure

```
src/
  app/                 Expo Router screens (file-based routing)
    (tabs)/            Home, Garage, History, Diagnostics, Settings
    vehicle/           Add/edit vehicle, and per-vehicle odometer/service/interval screens
  domain/              Pure TypeScript, no React/RN imports — the testable core
    interval-engine/   "Due by km or date, whichever first" logic
    dtc/               DTC lookup service (seeded from src/db/seed/dtc-codes.json)
    obd/               ObdAdapter interface + MockObdAdapter (Phase 2 swaps this for real BLE)
  db/                  Drizzle schema, SQLite client, seed data, per-entity repositories
  hooks/               TanStack Query hooks wrapping the repositories
  stores/              Zustand stores (active vehicle selection, settings/i18n persistence)
  components/ui/       Small shared UI primitives (Button, Card, TextField, SeverityBadge, ...)
  components/forms/    Larger composite form components (VehicleForm)
  i18n/                en.json / sr.json + i18next bootstrap
```

## Next steps toward Phase 2

Per [PLAN.md](./PLAN.md): EAS dev client + `react-native-ble-plx` for a real `ElmObdAdapter`, then robust ELM327 compatibility/error handling — none of which should require touching any screen, since everything already talks to the `ObdAdapter` interface.
