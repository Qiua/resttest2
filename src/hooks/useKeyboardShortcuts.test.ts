/*
    REST Test 2.0
    Copyright (C) 2025  Andrey Aires @ Gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// src/hooks/useKeyboardShortcuts.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let callbacks: {
    simple: ReturnType<typeof vi.fn>
    withCtrl: ReturnType<typeof vi.fn>
    withShift: ReturnType<typeof vi.fn>
    withAlt: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    callbacks = {
      simple: vi.fn(),
      withCtrl: vi.fn(),
      withShift: vi.fn(),
      withAlt: vi.fn(),
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call callback when shortcut is pressed', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
      },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(callbacks.withCtrl).toHaveBeenCalledTimes(1)
  })

  it('should not call callback when modifier keys do not match', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
      },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    // Without Ctrl
    const event = new KeyboardEvent('keydown', {
      key: 'n',
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(callbacks.withCtrl).not.toHaveBeenCalled()
  })

  it('should not trigger when typing in input field', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
      },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    })
    input.dispatchEvent(event)

    expect(callbacks.withCtrl).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('should not trigger when typing in textarea', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
      },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    })
    textarea.dispatchEvent(event)

    expect(callbacks.withCtrl).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })

  it('should support multiple shortcuts', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
      },
      {
        key: 's',
        ctrlKey: true,
        shiftKey: true,
        callback: callbacks.withShift,
        description: 'Save',
      },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    // First shortcut
    let event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(callbacks.withCtrl).toHaveBeenCalledTimes(1)
    expect(callbacks.withShift).not.toHaveBeenCalled()

    // Second shortcut
    event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(callbacks.withShift).toHaveBeenCalledTimes(1)
    expect(callbacks.withCtrl).toHaveBeenCalledTimes(1) // Still 1 from before
  })

  it('should respect enabled flag', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
      },
    ]

    const { rerender } = renderHook(({ enabled }) => useKeyboardShortcuts(shortcuts, enabled), {
      initialProps: { enabled: false },
    })

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(callbacks.withCtrl).not.toHaveBeenCalled()

    // Enable shortcuts
    rerender({ enabled: true })
    window.dispatchEvent(event)

    expect(callbacks.withCtrl).toHaveBeenCalledTimes(1)
  })

  it('should prevent default behavior when specified', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
        preventDefault: true,
      },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should not prevent default when preventDefault is false', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
        preventDefault: false,
      },
    ]

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)

    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })

  it('should clean up event listeners on unmount', () => {
    const shortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        callback: callbacks.withCtrl,
        description: 'New tab',
      },
    ]

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts))

    unmount()

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(callbacks.withCtrl).not.toHaveBeenCalled()
  })
})
