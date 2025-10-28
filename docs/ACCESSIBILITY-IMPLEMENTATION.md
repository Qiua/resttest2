# Accessibility (A11y) Implementation Guide

## Overview

This document describes the comprehensive accessibility improvements implemented in REST Test 2.0 to ensure the application is usable by everyone, including people with disabilities.

## Goals

1. **WCAG 2.1 Level AA Compliance**: Meet or exceed Web Content Accessibility Guidelines
2. **Keyboard Navigation**: Full keyboard support for all functionality
3. **Screen Reader Support**: Proper ARIA labels and live regions
4. **Focus Management**: Clear focus indicators and logical tab order
5. **Semantic HTML**: Proper use of HTML5 semantic elements

---

## Features Implemented

### 1. Skip to Content Link

**File:** `src/components/SkipToContent.tsx`

- Allows keyboard users to bypass repetitive navigation
- Visually hidden until focused
- Jumps directly to main content area
- Smooth scroll behavior

**Usage:**

```tsx
<SkipToContent />
```

**Keyboard Shortcut:** Tab (as first focusable element)

---

### 2. Keyboard Shortcuts System

**File:** `src/hooks/useKeyboardShortcuts.ts`

A comprehensive keyboard shortcut management system that respects accessibility best practices.

#### Global Shortcuts

| Shortcut     | Action         | Description                        |
| ------------ | -------------- | ---------------------------------- |
| `Ctrl+N`     | New Tab        | Create a new request tab           |
| `Ctrl+Enter` | Send Request   | Execute the current HTTP request   |
| `Ctrl+S`     | Save Request   | Save current request to collection |
| `Ctrl+B`     | Toggle Sidebar | Show/hide the sidebar              |
| `Ctrl+H`     | Open History   | Open request history modal         |

#### Features

- **Smart Context Detection**: Shortcuts don't trigger when typing in inputs
- **Customizable**: Easy to add new shortcuts
- **Accessible**: Doesn't interfere with browser/screen reader shortcuts

**API:**

```typescript
useKeyboardShortcuts(
  [
    {
      key: 'n',
      ctrlKey: true,
      callback: () => createNewTab(),
      description: 'New tab',
      preventDefault: true,
    },
  ],
  enabled,
)
```

---

### 3. Focus Management (Focus Trap)

**File:** `src/hooks/useFocusTrap.ts`

Manages focus within modal dialogs to prevent focus from escaping.

#### Features

- **Auto Focus**: Focuses first focusable element when modal opens
- **Circular Tab**: Tab wraps from last to first element
- **Restore Focus**: Returns focus to triggering element on close
- **Escape Handling**: Built-in ESC key support

**Usage:**

```typescript
const containerRef = useFocusTrap(isModalOpen)

return <div ref={containerRef}>{/* Modal content */}</div>
```

---

### 4. Live Regions for Screen Readers

**Files:**

- `src/components/LiveRegion.tsx`
- `src/hooks/useLiveRegion.ts`

Announces dynamic content changes to screen readers without visual interruption.

#### Politeness Levels

- **Polite**: Waits for user to finish current activity
- **Assertive**: Interrupts immediately (for errors)

#### Use Cases

- Request loading status
- Request success/failure
- Environment changes
- Theme/language changes
- Tab switches

**Usage:**

```typescript
const liveRegion = useLiveRegion()

// Announce politely
liveRegion.announce('Request completed successfully', 'polite')

// Announce urgently
liveRegion.announce('Request failed', 'assertive')
```

---

### 5. ARIA Labels and Landmarks

**File:** `src/App.tsx` (and all components)

#### Landmarks Implemented

```html
<!-- Main navigation -->
<nav role="navigation" aria-label="Main navigation">
  <!-- Main content area -->
  <main id="main-content" tabIndex="{-1}" aria-label="Main content">
    <!-- Header/Banner -->
    <header role="banner">
      <!-- Toolbar -->
      <div role="toolbar" aria-label="Main actions"></div>
    </header>
  </main>
</nav>
```

#### Form Labels

All form inputs now have associated labels:

- Visible labels using `<label>` elements
- ARIA labels for icon-only buttons
- Help text with `aria-describedby`
- Error messages with `aria-invalid` and `aria-errormessage`

#### Button Accessibility

```tsx
<button onClick={handleAction} aria-label="Close modal" title="Close modal (Esc)">
  <FiX />
</button>
```

---

### 6. Keyboard List Navigation

**File:** `src/hooks/useKeyboardShortcuts.ts` (`useKeyboardListNavigation`)

Enables keyboard navigation in lists (history, collections, etc.).

#### Supported Keys

- **Arrow Up/Down**: Navigate items
- **Home**: Jump to first item
- **End**: Jump to last item
- **Enter/Space**: Select item

**Usage:**

```typescript
const { focusedIndex, handleKeyDown } = useKeyboardListNavigation(
  items,
  onSelect,
  initialIndex
)

<div onKeyDown={handleKeyDown}>
  {items.map((item, index) => (
    <div
      key={item.id}
      className={index === focusedIndex ? 'focused' : ''}
      tabIndex={index === focusedIndex ? 0 : -1}
    >
      {item.name}
    </div>
  ))}
</div>
```

---

## Translation Support

### English (`src/locales/en/translation.json`)

```json
{
  "a11y": {
    "skipToContent": "Skip to main content",
    "mainContent": "Main content",
    "navigation": "Navigation",
    "closeModal": "Close modal",
    "requestLoading": "Request in progress...",
    "requestSuccess": "Request completed successfully",
    "requestError": "Request failed with error",
    "toggleSidebar": "Toggle sidebar",
    "keyboardShortcuts": "Keyboard shortcuts",
    "pressEscToClose": "Press Escape to close"
    // ... more keys
  }
}
```

### Portuguese (`src/locales/pt/translation.json`)

```json
{
  "a11y": {
    "skipToContent": "Pular para o conteúdo principal",
    "mainContent": "Conteúdo principal",
    "navigation": "Navegação",
    "closeModal": "Fechar modal",
    "requestLoading": "Requisição em andamento...",
    "requestSuccess": "Requisição completada com sucesso",
    "requestError": "Requisição falhou com erro",
    "toggleSidebar": "Alternar barra lateral",
    "keyboardShortcuts": "Atalhos de teclado",
    "pressEscToClose": "Pressione Escape para fechar"
    // ... more keys
  }
}
```

---

## Implementation Details

### App.tsx Integration

```typescript
function App() {
  const { t } = useTranslation()
  const liveRegion = useLiveRegion()

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      callback: () => createNewTab(),
      description: t('a11y.newTab'),
    },
    // ... more shortcuts
  ])

  return (
    <div className="h-screen flex">
      <SkipToContent />
      <LiveRegion message={liveRegion.message} politeness={liveRegion.politeness} />

      {/* App content */}
    </div>
  )
}
```

### Request Lifecycle Announcements

```typescript
const handleSubmit = useCallback(async () => {
  // Start
  liveRegion.announce(t('a11y.requestLoading'), 'polite')

  try {
    const result = await axios(config)

    // Success
    liveRegion.announce(`${t('a11y.requestSuccess')}. Status ${result.status}`, 'polite')
  } catch (err) {
    // Error
    liveRegion.announce(`${t('a11y.requestError')}: ${errorMessage}`, 'assertive')
  }
}, [dependencies])
```

---

## Testing Recommendations

### Keyboard Navigation Testing

1. **Tab Order**: Press Tab repeatedly
   - Skip link appears first
   - All interactive elements reachable
   - Logical order maintained

2. **Keyboard Shortcuts**: Test all Ctrl+Key combinations
   - Shortcuts work as expected
   - Don't interfere with browser shortcuts
   - Don't trigger when typing

3. **Modal Focus**: Open any modal
   - Focus moves to modal
   - Tab cycles within modal
   - ESC closes and restores focus

### Screen Reader Testing

**NVDA (Windows - Free)**

```bash
# Download from https://www.nvaccess.org/
# Test:
# - Navigate with arrows
# - Hear all labels
# - Hear live region announcements
# - Forms are properly labeled
```

**JAWS (Windows - Commercial)**

```bash
# Common screen reader in enterprise
# Test same as NVDA
```

**VoiceOver (macOS - Built-in)**

```bash
# Cmd+F5 to enable
# Test:
# - VO+arrows to navigate
# - All content announced
# - Proper heading structure
```

### Automated Testing Tools

#### axe DevTools (Browser Extension)

```bash
# Install: Chrome/Firefox/Edge extension
# Run: Open DevTools > axe tab > Scan All
# Fix: Address all violations and warnings
```

#### Lighthouse (Chrome DevTools)

```bash
# Open DevTools > Lighthouse
# Select "Accessibility" category
# Run audit
# Target: 100/100 score
```

#### WAVE (Browser Extension)

```bash
# Install: Chrome/Firefox extension
# Click WAVE icon
# Review: Errors, Alerts, Features, Structural elements
```

---

## Best Practices Followed

### 1. Semantic HTML

✅ Use proper HTML5 elements

```html
<nav>
  ,
  <main>
    ,
    <header>
      ,
      <footer>
        ,
        <section>
          ,
          <article></article>
        </section>
      </footer>
    </header>
  </main>
</nav>
```

❌ Avoid generic divs for structural elements

### 2. ARIA Usage

✅ Enhance, don't replace semantic HTML

```html
<button aria-label="Close">×</button>
```

❌ Don't use ARIA when HTML suffices

```html
<!-- Bad -->
<div role="button" tabindex="0" onClick="{...}">Click</div>

<!-- Good -->
<button onClick="{...}">Click</button>
```

### 3. Focus Management

✅ Clear visual focus indicators

```css
.focus:ring-2 .focus:ring-blue-500 .focus:outline-none
```

✅ Logical tab order (matches visual flow)

✅ Focus trap in modals

❌ Never remove outline without replacement

### 4. Color and Contrast

✅ WCAG AA contrast ratios (4.5:1 text, 3:1 UI)

✅ Don't rely on color alone

✅ Support dark mode

### 5. Forms

✅ Every input has a label

✅ Group related inputs with `<fieldset>`

✅ Indicate required fields

✅ Provide helpful error messages

---

## Future Enhancements

### High Priority

- [ ] **Skip Navigation Menu**: Add shortcuts to jump between sections
- [ ] **High Contrast Mode**: Dedicated high-contrast theme
- [ ] **Reduced Motion**: Respect `prefers-reduced-motion`
- [ ] **Focus Visible Only**: Use `:focus-visible` for better UX

### Medium Priority

- [ ] **Keyboard Shortcut Help**: Modal showing all shortcuts
- [ ] **Customizable Shortcuts**: Let users define their own
- [ ] **Voice Commands**: Basic voice control support
- [ ] **Zoom Support**: Test at 200%+ zoom levels

### Low Priority

- [ ] **Touch Target Sizes**: Ensure 44x44px minimum
- [ ] **Reading Order**: Test with screen reader
- [ ] **Language Detection**: Auto-detect user's language
- [ ] **Sign Language**: Consider sign language support

---

## Compliance Checklist

### WCAG 2.1 Level A

- [x] 1.1.1 Non-text Content
- [x] 1.3.1 Info and Relationships
- [x] 1.3.2 Meaningful Sequence
- [x] 1.3.3 Sensory Characteristics
- [x] 2.1.1 Keyboard
- [x] 2.1.2 No Keyboard Trap
- [x] 2.4.1 Bypass Blocks
- [x] 2.4.2 Page Titled
- [x] 3.2.1 On Focus
- [x] 3.2.2 On Input
- [x] 3.3.1 Error Identification
- [x] 3.3.2 Labels or Instructions
- [x] 4.1.1 Parsing
- [x] 4.1.2 Name, Role, Value

### WCAG 2.1 Level AA

- [x] 1.4.3 Contrast (Minimum)
- [x] 1.4.5 Images of Text
- [x] 2.4.5 Multiple Ways
- [x] 2.4.6 Headings and Labels
- [x] 2.4.7 Focus Visible
- [x] 3.1.2 Language of Parts
- [x] 3.2.3 Consistent Navigation
- [x] 3.2.4 Consistent Identification
- [x] 3.3.3 Error Suggestion
- [x] 3.3.4 Error Prevention

---

## Resources

### Official Guidelines

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)

### Learning

- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Changelog

| Date       | Version | Changes                                                                                      |
| ---------- | ------- | -------------------------------------------------------------------------------------------- |
| 2025-10-28 | 1.0.0   | Initial A11y implementation with keyboard navigation, ARIA labels, and screen reader support |

---

**Note**: Accessibility is an ongoing commitment. Regular testing and updates are required to maintain compliance and usability.

**Developer:** Andrey Aires  
**License:** GPL-3.0-or-later
