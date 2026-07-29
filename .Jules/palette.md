## 2025-07-29 - [Loading State Feedback for Requests]

**Learning:** Adding a spinner specifically using `FiLoader` with `animate-spin` inside primary async buttons (like Send Request) gives critical immediate visual feedback. Along with text changes ("Sending..."), it provides clarity, while aria-labels on nearby icon-only buttons (like Save) fix significant accessibility gaps.
**Action:** When adding async states to forms, always add a visual spinner inside the button with flex centering, alongside the text change, to enhance perceptual performance.
