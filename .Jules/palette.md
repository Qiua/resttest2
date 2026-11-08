## 2023-10-27 - Icon-only Buttons Missing ARIA Labels in Sidebar

**Learning:** Found several icon-only buttons in `src/components/Sidebar.tsx` that relied solely on the `title` attribute for tooltip display, but lacked `aria-label`s. This is a common accessibility anti-pattern as `title` is not reliably announced by all screen readers.
**Action:** Always ensure icon-only buttons have an explicit `aria-label` matching the intended action, even if a `title` attribute is present for sighted users. Look out for this pattern in other components across the app.

## 2025-03-05 - Settings Menu Accessibility

**Learning:** Found that custom div toggles for menus (like in `SettingsMenu.tsx`) lacked ARIA attributes, semantic button tags, and keyboard focus states. Redundant `aria-label` attributes on buttons that already contain text were identified as an accessibility anti-pattern.
**Action:** Replaced div with a semantically correct button, added missing attributes (aria-expanded), included `focus-visible` classes, and removed redundant `aria-label` attributes where the button already has visible text describing its action.
## 2025-02-12 - Exposing hidden buttons on focus
**Learning:** For elements that are hidden by default and rely on hover states to become visible (e.g. `opacity-0 group-hover:opacity-100`), ensuring they receive `focus-visible:opacity-100` is critical for keyboard accessibility so they appear when a user tabs onto them.
**Action:** When adding focus states to interactive elements, look for opacity or visibility classes and add equivalent focus-visible states to ensure the element becomes visible via keyboard navigation.
