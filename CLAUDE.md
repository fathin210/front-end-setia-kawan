# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Admin dashboard for "Setia Kawan" (a dental clinic) — patient records, queue management, deposits, employee commissions, and earning reports. React + Vite SPA, no TypeScript, in Bahasa Indonesia (route labels, comments, UI text, form fields).

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # production build
npm run lint      # eslint .
npm run preview   # preview production build
```

No test suite is configured in this repo.

## Environment

Requires a `.env` with `VITE_API_BASE_URL` pointing at the backend API. The app is deployed under the `/admin-setiakawan` base path (see `base: "./"` in `vite.config.js` and `basename="/admin-setiakawan"` in `src/App.jsx`) — hardcoded redirects (e.g. in the fetcher's 401 handler) target `/admin-setiakawan/login`.

## Architecture

**Routing & role-based access** (`src/routes.jsx`, `src/constants/routes.js`, `src/App.jsx`, `src/components/ProtectedRoute.jsx`):
Routes are defined as a single data structure in `src/routes.jsx` (`routes` array), each entry carrying `path`, `element`, `text`, `icon`, `roles`, and `showInSidebar`. `App.jsx` walks this array (including nested `children`) to generate `<Route>` elements, wrapping any route with a non-empty `roles` array in `ProtectedRoute`, which checks `useAuthStore` for a token and the user's `level` against `allowedRoles`. `Sidebar.jsx` consumes the same `routes` array (via `filterRoutesByRole`) to render nav — so adding a page means adding one entry to `routes.jsx` plus a path constant in `constants/routes.js`, not touching multiple files.

**Data fetching** (`src/hooks/`): One hook file per resource, split into `useFetch*` (queries) and `useMutate*` (mutations), both built on `@tanstack/react-query`. Query keys are arrays like `["deposit", nomorpasien, iddp]`; mutations call `queryClient.refetchQueries({ queryKey: [...], type: 'all' })` on success to invalidate. Every mutation hook wires `onMutate`/`onSuccess`/`onError` to `useAlertStore` (`showAlert(message, severity)`) for user feedback — follow this pattern for new mutations rather than handling loading/error state locally.

**HTTP layer** (`src/utils/fetcher.js`): All requests go through `baseFetcher`, which attaches `Authorization: Bearer <token>` from `localStorage` and, on a 401 or a message matching `/token/i`, clears `localStorage` and hard-redirects to `/admin-setiakawan/login`. Use the exported `fetcher`/`postFetcher`/`putFetcher`/`deleteFetcher`/`pdfFetcher` helpers rather than calling `fetch` directly so this auth handling stays centralized.

**Global state** (`src/store/`, Zustand, one store per concern, no combined root store):
- `useAuthStore` — persisted (`zustand/middleware persist`) user/token, `login`/`logout`.
- `useAlertStore` / `snackbarStore` — global alert dialog / snackbar, driven from mutation hooks rather than local component state.
- `pdfStore` — drives the app-wide `DialogPdf` (rendered once in `Layout.jsx`) used for generated PDF previews (cards, invoices, deposits — see `useFetchPDF*` hooks).
- `themeStore` — light/dark toggle feeding `theme.js` (MUI `ThemeProvider`).
- `patientStore` — in-flight patient/queue UI state for the Home page flow.

**Layout shell** (`src/components/Layout.jsx`): Wraps every non-login route (mounted at `/` in `App.jsx`, pages render via `<Outlet />`). Renders the AppBar, `Sidebar`, and the three global overlay components (`GlobalSnackbar`, `GlobalAlertDialog`, `DialogPdf`) once — pages don't need to render their own snackbar/dialog/pdf-viewer instances, just drive the corresponding store.

**Pages** (`src/pages/`): Grouped by feature (`home`, `patient`, `employee`, `earning`, `settings`, `dashboard`, `login`), each a directory of a top-level page plus its dialogs/subcomponents (e.g. `home/DialogDeposit.jsx`, `home/DialogQueue.jsx`). Dates are handled with `moment` via MUI's `AdapterMoment` (`LocalizationProvider` in `App.jsx`).

## Conventions

- MUI (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`) is the UI library; `@emotion` is its styling engine. Don't introduce another component library or CSS approach.
- No TypeScript — plain `.jsx`/`.js` throughout.
- Form state uses `react-hook-form`.
- ESLint config (`eslint.config.js`) flags unused vars except those matching `^[A-Z_]`, and enforces `react-hooks` rules — run `npm run lint` before considering frontend changes done.
