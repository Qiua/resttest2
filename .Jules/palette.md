## 2024-05-15 - ARIA Labels and Focus States on Sidebar Icons
**Learning:** Icon-only buttons often lack proper accessibility context (aria-labels) for screen readers and visible focus indicators for keyboard navigation, making them inaccessible to certain users.
**Action:** When adding or modifying icon-only buttons, always include `aria-label` (typically using a translation key) and appropriate `focus-visible` styling classes (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`) to ensure they are accessible via both screen readers and keyboards.
