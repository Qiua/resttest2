# Testing Infrastructure Implementation

## Overview

This document describes the comprehensive testing infrastructure implemented for REST Test 2.0, including configuration, tools, patterns, and best practices.

## Test Stack

### Core Testing Libraries

- **Vitest** (v4.0.4): Fast, modern test runner with native ESM support
- **@testing-library/react** (v16.3.0): React component testing utilities
- **@testing-library/jest-dom** (v6.9.1): Custom DOM matchers
- **@testing-library/user-event** (v14.6.1): User interaction simulation
- **@vitest/ui** (v4.0.4): Browser-based UI for test visualization

### Test Environments

- **jsdom**: Primary DOM environment for testing
- **happy-dom**: Alternative lightweight DOM implementation

## Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/**', 'src/test/**', '**/*.test.{ts,tsx}', '**/*.config.{ts,js}', '**/types/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

**Key Settings:**

- **Coverage Provider**: v8 (fastest and most accurate)
- **Coverage Threshold**: 70% across all metrics
- **Reporters**: Text, JSON, HTML, and LCOV formats
- **Setup File**: Global test configuration and mocks

### Test Setup (`src/test/setup.ts`)

Global test environment configuration:

```typescript
import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia (required for responsive hooks)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock scrollIntoView (not implemented in JSDOM)
Element.prototype.scrollIntoView = vi.fn()

// Mock crypto.randomUUID
Object.defineProperty(global.crypto, 'randomUUID', {
  value: vi.fn(() => 'test-uuid-1234' as `${string}-${string}-${string}-${string}-${string}`),
})
```

## Available Test Commands

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

**Usage:**

- `npm test` - Run all tests in watch mode
- `npm run test:ui` - Open interactive test UI in browser
- `npm run test:coverage` - Generate coverage report
- `npm run test:watch` - Run tests in watch mode (same as `npm test`)

## Test Files Created

### Hook Tests

#### 1. `useKeyboardShortcuts.test.ts` (10 tests)

Tests keyboard shortcut management:

- Callback triggering with correct modifiers
- Multiple modifier key combinations
- Input/textarea detection (prevents shortcuts when typing)
- Multiple simultaneous shortcuts
- Enabled/disabled state
- preventDefault behavior
- Event listener cleanup

#### 2. `useLiveRegion.test.ts` (7 tests)

Tests screen reader announcement hook:

- Initialization state
- Polite vs assertive announcements
- Default politeness level
- Message clearing
- Multiple sequential announcements
- Politeness level updates

#### 3. `useFocusTrap.test.ts` (7 tests)

Tests focus management for modals:

- Ref object creation
- First element focus on activation
- Tab key cycling (forward and backward)
- Empty container handling
- Focus restoration on cleanup

#### 4. `useLocalStorage.test.ts` (15 tests)

Tests persistent storage hook:

- Default value initialization
- Stored value retrieval
- Value updates and persistence
- Complex object handling
- Array handling
- Function updater pattern
- Null/undefined values
- Boolean and number values
- Nested objects
- Invalid JSON handling
- Empty strings

#### 5. `useModal.test.ts` (12 tests)

Tests modal state management:

- Initialization state
- Confirm modal open/close
- Prompt modal open/close
- Notification modal open/close
- Promise resolution
- Custom text and types
- Multiple notification types

### Component Tests

#### 6. `SkipToContent.test.tsx` (6 tests)

Tests accessibility skip link:

- Component rendering
- sr-only class application
- Focus management
- Scroll behavior
- Error handling for missing main content
- ARIA label validation

#### 7. `LiveRegion.test.tsx` (12 tests)

Tests live region announcements:

- Default polite politeness
- Assertive politeness
- Message display
- Auto-clear timer functionality
- Message updates
- ARIA attributes (aria-atomic, aria-live)
- sr-only class for visual hiding
- Persistent messages
- Empty message handling
- Timer cleanup on unmount

## Testing Patterns and Best Practices

### Hook Testing Pattern

```typescript
import { renderHook, act } from '@testing-library/react'

it('should update state', () => {
  const { result } = renderHook(() => useCustomHook())

  act(() => {
    result.current.updateValue('new value')
  })

  expect(result.current.value).toBe('new value')
})
```

### Component Testing Pattern

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('should handle user interaction', async () => {
  const user = userEvent.setup()
  const handleClick = vi.fn()

  render(<Button onClick={handleClick}>Click me</Button>)

  await user.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Async Testing Pattern

```typescript
import { waitFor } from '@testing-library/react'

it('should load data asynchronously', async () => {
  render(<AsyncComponent />)

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

### Timer Testing Pattern

```typescript
import { vi } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('should clear after timeout', () => {
  render(<AutoClearComponent />)

  vi.advanceTimersByTime(1000)

  expect(screen.queryByText('Message')).not.toBeInTheDocument()
})
```

### Mocking i18n Pattern

```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))
```

## Coverage Goals

Current coverage thresholds set at **70%** for:

- Lines
- Functions
- Branches
- Statements

**Coverage Reports:**

- HTML: `coverage/index.html` (visual report)
- JSON: `coverage/coverage.json` (CI/CD integration)
- LCOV: `coverage/lcov.info` (external tools)
- Text: Printed to console

## Testing Checklist

When creating new features, ensure:

- [ ] Unit tests for all hooks
- [ ] Component tests for UI elements
- [ ] Accessibility tests (ARIA, keyboard navigation)
- [ ] User interaction tests
- [ ] Edge case handling
- [ ] Error state testing
- [ ] Async operation testing
- [ ] Cleanup and unmounting tests

## Next Steps

### Priority Test Files to Create

1. **ErrorBoundary.test.tsx** - Error boundary component tests
2. **PromptModal.test.tsx** - Prompt modal component tests
3. **NotificationModal.test.tsx** - Notification modal component tests
4. **useRequestHistory.test.ts** - Request history hook tests
5. **useRequestTabs.test.ts** - Tab management tests
6. **useEnvironments.test.ts** - Environment variable tests
7. **corsProxy.test.ts** - CORS proxy utility tests
8. **importExport.test.ts** - Import/export functionality tests

### Integration Tests

Consider adding integration tests for:

- Complete request flow (form → axios → response)
- Environment variable interpolation
- File upload handling
- Import/export workflows
- Theme switching
- Internationalization

### E2E Tests (Future)

For complete user flow testing, consider:

- Playwright or Cypress
- Critical user paths
- Multi-step workflows

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"  
**Solution**: Ensure `tsconfig.json` includes test files and has proper path resolution

**Issue**: Timer tests behave inconsistently  
**Solution**: Always use `vi.useFakeTimers()` in beforeEach and `vi.useRealTimers()` in afterEach

**Issue**: DOM queries fail  
**Solution**: Use `screen.debug()` to inspect rendered HTML

**Issue**: Async tests timeout  
**Solution**: Increase timeout with `{ timeout: 5000 }` or check waitFor conditions

### Debugging Tests

```typescript
import { screen } from '@testing-library/react'

it('should render component', () => {
  render(<Component />)

  // Print rendered HTML
  screen.debug()

  // Print specific element
  screen.debug(screen.getByRole('button'))
})
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Summary

The testing infrastructure provides:

- ✅ Comprehensive test coverage (70% threshold)
- ✅ Fast test execution (Vitest)
- ✅ Modern testing patterns (Testing Library)
- ✅ Interactive test UI
- ✅ Coverage reporting
- ✅ Accessibility testing support
- ✅ Mock setup for common APIs
- ✅ TypeScript support

**Total Tests Created**: 69 tests across 7 files  
**Test Coverage Target**: 70% minimum  
**Test Runner**: Vitest v4.0.4  
**Status**: ✅ Infrastructure Complete, Ready for Expansion
