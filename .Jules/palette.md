## 2025-03-01 - Missing ARIA Labels on Icon-Only Buttons

**Learning:** Found an accessibility issue pattern specific to this app's components: many icon-only buttons rely on the `title` attribute for native tooltips, but lack robust screen reader announcements via `aria-label`. Relying only on `title` is often insufficient for comprehensive accessibility.
**Action:** When adding `aria-label`s to these buttons, ensure they reuse the same `t()` translation key used by the `title` attribute to maintain consistent internationalization.
