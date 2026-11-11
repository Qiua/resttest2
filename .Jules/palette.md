## 2023-10-27 - Icon-only Buttons Missing ARIA Labels in Sidebar

**Learning:** Found several icon-only buttons in `src/components/Sidebar.tsx` that relied solely on the `title` attribute for tooltip display, but lacked `aria-label`s. This is a common accessibility anti-pattern as `title` is not reliably announced by all screen readers.
**Action:** Always ensure icon-only buttons have an explicit `aria-label` matching the intended action, even if a `title` attribute is present for sighted users. Look out for this pattern in other components across the app.

## 2025-03-05 - Settings Menu Accessibility

**Learning:** Found that custom div toggles for menus (like in `SettingsMenu.tsx`) lacked ARIA attributes, semantic button tags, and keyboard focus states. Redundant `aria-label` attributes on buttons that already contain text were identified as an accessibility anti-pattern.
**Action:** Replaced div with a semantically correct button, added missing attributes (aria-expanded), included `focus-visible` classes, and removed redundant `aria-label` attributes where the button already has visible text describing its action.

## 2025-03-05 - Interactive Lists Lack Keyboard Accessibility

**Learning:** Discovered that custom interactive list items (collections and requests) in `WorkspacePanel.tsx` were using `div` elements with `onClick` handlers but lacked keyboard accessibility attributes (`role="button"`, `tabIndex={0}`, and `onKeyDown`). Additionally, nested action buttons visible only on `group-hover` were inaccessible via keyboard focus.
**Action:** Ensure interactive lists use proper ARIA roles and tab indices, handle Space/Enter keys for activation, and use `focus-visible:opacity-100` for actions revealed on hover to maintain keyboard accessibility.
