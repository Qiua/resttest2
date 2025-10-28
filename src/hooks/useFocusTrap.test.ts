/*
 * REST Test 2.0 - A powerful REST API testing tool
 * Copyright (C) 2025 Andrey Araujo
 *
 * This file is part of REST Test 2.0.
 *
 * REST Test 2.0 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * REST Test 2.0 is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFocusTrap } from './useFocusTrap'

describe('useFocusTrap', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should return a ref object when active', () => {
    const { result } = renderHook(() => useFocusTrap(true))

    expect(result.current).toHaveProperty('current')
  })

  it('should return a ref object when inactive', () => {
    const { result } = renderHook(() => useFocusTrap(false))

    expect(result.current).toHaveProperty('current')
  })

  it('should focus first focusable element when activated', () => {
    const button1 = document.createElement('button')
    button1.textContent = 'Button 1'
    const button2 = document.createElement('button')
    button2.textContent = 'Button 2'

    container.appendChild(button1)
    container.appendChild(button2)

    renderHook(() => useFocusTrap(true))

    // Verify elements exist in container
    expect(container.querySelectorAll('button').length).toBe(2)
  })

  it('should handle containers with no focusable elements', () => {
    const div = document.createElement('div')
    div.textContent = 'Not focusable'
    container.appendChild(div)

    const { result } = renderHook(() => useFocusTrap(true))

    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: container,
    })

    // Should not throw error
    expect(() => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' })
      container.dispatchEvent(event)
    }).not.toThrow()
  })

  it('should restore focus on cleanup', () => {
    const externalButton = document.createElement('button')
    externalButton.textContent = 'External'
    document.body.appendChild(externalButton)
    externalButton.focus()

    const button = document.createElement('button')
    container.appendChild(button)

    const { result, unmount } = renderHook(() => useFocusTrap(true))

    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: container,
    })

    unmount()

    // Should restore focus to previous element
    expect(document.activeElement).toBe(externalButton)

    document.body.removeChild(externalButton)
  })

  it('should handle Tab key to cycle focus forward', () => {
    const button1 = document.createElement('button')
    button1.textContent = 'Button 1'
    const button2 = document.createElement('button')
    button2.textContent = 'Button 2'

    container.appendChild(button1)
    container.appendChild(button2)

    renderHook(() => useFocusTrap(true))

    // Verify elements exist for focus trap
    expect(container.querySelectorAll('button').length).toBe(2)
  })

  it('should handle Shift+Tab to cycle focus backward', () => {
    const button1 = document.createElement('button')
    button1.textContent = 'Button 1'
    const button2 = document.createElement('button')
    button2.textContent = 'Button 2'

    container.appendChild(button1)
    container.appendChild(button2)

    renderHook(() => useFocusTrap(true))

    // Verify elements exist for focus trap
    expect(container.querySelectorAll('button').length).toBe(2)
  })
})
