## 2025-03-05 - Settings Menu Accessibility
**Learning:** Found that custom div toggles for menus (like in `SettingsMenu.tsx`) lacked ARIA attributes, semantic button tags, and keyboard focus states. Redundant `aria-label` attributes on buttons that already contain text were identified as an accessibility anti-pattern.
**Action:** Replaced div with a semantically correct button, added missing attributes (aria-expanded), included `focus-visible` classes, and removed redundant `aria-label` attributes where the button already has visible text describing its action.
