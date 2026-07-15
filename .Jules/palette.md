## 2023-10-27 - Icon-only Buttons Missing ARIA Labels in Sidebar
**Learning:** Found several icon-only buttons in `src/components/Sidebar.tsx` that relied solely on the `title` attribute for tooltip display, but lacked `aria-label`s. This is a common accessibility anti-pattern as `title` is not reliably announced by all screen readers.
**Action:** Always ensure icon-only buttons have an explicit `aria-label` matching the intended action, even if a `title` attribute is present for sighted users. Look out for this pattern in other components across the app.
