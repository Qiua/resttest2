## 2024-07-20 - Missing ARIA Labels on Icon-Only Buttons

**Learning:** Icon-only buttons often rely on `title` attributes for tooltips, but without `aria-label`, they lack context for screen readers. In addition, missing keyboard focus indicators (`focus-visible:ring`) on these buttons hinder keyboard navigation.
**Action:** Always verify icon-only buttons include `aria-label` (using translation strings where available) and explicit keyboard focus styles (`focus-visible:ring-2 focus-visible:ring-blue-500`).
