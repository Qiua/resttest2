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

// src/hooks/useLiveRegion.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLiveRegion } from './useLiveRegion'

describe('useLiveRegion', () => {
  it('should initialize with empty message', () => {
    const { result } = renderHook(() => useLiveRegion())

    expect(result.current.message).toBe('')
    expect(result.current.politeness).toBe('polite')
  })

  it('should announce message with polite politeness', () => {
    const { result } = renderHook(() => useLiveRegion())

    act(() => {
      result.current.announce('Test message', 'polite')
    })

    expect(result.current.message).toBe('Test message')
    expect(result.current.politeness).toBe('polite')
  })

  it('should announce message with assertive politeness', () => {
    const { result } = renderHook(() => useLiveRegion())

    act(() => {
      result.current.announce('Error message', 'assertive')
    })

    expect(result.current.message).toBe('Error message')
    expect(result.current.politeness).toBe('assertive')
  })

  it('should default to polite when no politeness specified', () => {
    const { result } = renderHook(() => useLiveRegion())

    act(() => {
      result.current.announce('Default message')
    })

    expect(result.current.message).toBe('Default message')
    expect(result.current.politeness).toBe('polite')
  })

  it('should clear message', () => {
    const { result } = renderHook(() => useLiveRegion())

    act(() => {
      result.current.announce('Test message')
    })

    expect(result.current.message).toBe('Test message')

    act(() => {
      result.current.clear()
    })

    expect(result.current.message).toBe('')
  })

  it('should update message on multiple announcements', () => {
    const { result } = renderHook(() => useLiveRegion())

    act(() => {
      result.current.announce('First message')
    })

    expect(result.current.message).toBe('First message')

    act(() => {
      result.current.announce('Second message')
    })

    expect(result.current.message).toBe('Second message')
  })

  it('should update politeness level on subsequent announcements', () => {
    const { result } = renderHook(() => useLiveRegion())

    act(() => {
      result.current.announce('Info message', 'polite')
    })

    expect(result.current.politeness).toBe('polite')

    act(() => {
      result.current.announce('Error message', 'assertive')
    })

    expect(result.current.politeness).toBe('assertive')
  })
})
