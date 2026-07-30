## 2026-07-30 - Adding aria-label to icon buttons using translations
**Learning:** Found an accessibility issue pattern where icon buttons only relied on `title` attributes. Adding `aria-label` to these buttons is necessary for screen readers. Using the existing translation keys for `title` ensures internationalization works for `aria-label` too.
**Action:** When creating icon-only buttons, consistently add an `aria-label` attribute alongside or instead of `title`, using the appropriate `t(...)` keys for i18n.
