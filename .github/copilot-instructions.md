# Copilot Instructions · REST Test 2.0

## Quick Start

- Install dependencies with `npm install`; run the dev server via `npm run dev` (Vite on port 5173).
- `npm run quality` runs TypeScript, ESLint, and Prettier; there is no automated test suite yet.
- Build artifacts with `npm run build`; proxy settings for local CORS fixes live in `vite.config.ts`.

## Architecture at a Glance

- React + TypeScript + Tailwind. Routing is single-page; state relies on hooks and contexts, no Redux.
- `src/components/` holds reusable UI (e.g., `SettingsMenu.tsx`, `EnvironmentManager.tsx`, modal components).
- `src/features/` implements product areas: `RequestForm.tsx` assembles Axios requests, `ResponseDisplay.tsx` renders results, `SavedRequests.tsx` manages saved payloads.
- `src/contexts/ThemeContext.tsx` exposes theming; other global state flows through custom hooks in `src/hooks/` (`useEnvironments.ts`, `useRequestTabs.ts`, `useRequestHistory.ts`).
- Local persistence (environments, history, saved requests) is handled via wrappers in `useLocalStorage.ts` and supporting utils under `src/utils/`.

## Core Flows to Understand

- **Request lifecycle**: `RequestForm.tsx` builds the payload using environment interpolation (`useEnvironments.ts`), sends via Axios, and pushes history through `useRequestHistory.ts`; `ResponseDisplay.tsx` reads the same state slice.
- **Environment resolution**: Variables written as `{{token}}` cascade from the active environment to the global one (`EnvironmentManager.tsx` + `useEnvironments.ts`). Keep substitutions pure—no side effects in the resolver.
- **Tabbed workspace**: `useRequestTabs.ts` manages open request state; UI bindings live in `src/components/RequestTabs.tsx` and `Tabs.tsx`.
- **Proxy handling**: `src/utils/corsProxy.ts` normalizes URLs before they hit Axios; the UI for configuring options is `ProxySettings.tsx`.
- **Internationalization**: Strings come from `src/i18n/index.ts`; keys must exist in both `src/locales/en/translation.json` and `src/locales/pt/translation.json`.

## Implementation Conventions

- **Component structure**: All files include GPL-3.0-or-later license headers (17 lines). Components export typed `React.FC` with interface props.
- **Props patterns**: Define `ComponentNameProps` interfaces above components; use destructuring in function signatures (see `RequestTabs.tsx`, `FileInput.tsx`).
- **Icons**: Import from `react-icons/fi` (Feather Icons); use consistently across the app (e.g., `FiX` for close, `FiSettings` for settings).
- **Styling**: Tailwind utilities only; dark mode via `dark:` prefix is mandatory for all colored elements. Status colors follow `getStatusClass()` pattern in `ResponseDisplay.tsx`.
- **Modals**: Use `useModal()` hook for confirm/prompt/notification modals; render `ConfirmModal`, `PromptModal`, `NotificationModal` components in `App.tsx`.
- **Persistence**: Never use `localStorage` directly—always go through `useLocalStorage.ts` hook pattern for type safety and reactivity.
- **TypeScript**: Shared types in `src/types/index.ts`; use `interface` over `type` for object shapes. ESLint enforces `prefer-const`, `no-var`, `eqeqeq`, and unused var patterns with `_` prefix.

## Integration Notes

- **Axios**: Sole HTTP client; interceptors in `RequestForm.tsx` handle environment variable substitution before sending.
- **Resizable panels**: `react-resizable-panels` in `WorkspacePanel.tsx`; maintain panel IDs and min/max sizes when adding new panes.
- **File uploads**: `FileInput.tsx` builds FormData; extend `FileParameter` type in `src/types/index.ts` for new fields.
- **Import/export**: `src/utils/importExport.ts` supports Postman/Insomnia/native formats; use `detectImportFormat()` before parsing.
- **Theme**: `ThemeProvider` wraps app in `main.tsx`; theme state in `ThemeContext.tsx`, toggle via `useTheme()` hook.

## Reference Material

- `README.md`, `ENVIRONMENTS.md`, and `CORS-PROXY-GUIDE.md` document user-facing flows that mirror the code structure.
- Screenshots and demo assets sit under `public/assets/`; update them in sync with major UI changes.
