## 2025-07-21 - Added aria-labels to icon-only buttons in Sidebar

**Learning:** Many icon-only buttons have a `title` prop for tooltips but are missing the `aria-label` attribute, which is crucial for screen readers. Using the same translation string for both `title` and `aria-label` provides a consistent accessible experience.
**Action:** Always add `aria-label` to icon-only buttons when a `title` attribute is present.
