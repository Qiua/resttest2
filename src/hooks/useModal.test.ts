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

import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useModal } from './useModal'

describe('useModal', () => {
  it('should initialize with closed modals', () => {
    const { result } = renderHook(() => useModal())

    expect(result.current.confirmModal.isOpen).toBe(false)
    expect(result.current.promptModal.isOpen).toBe(false)
    expect(result.current.notificationModal.isOpen).toBe(false)
  })

  it('should open confirm modal with correct options', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showConfirm({
        title: 'Confirm Action',
        message: 'Are you sure?',
      })
    })

    expect(result.current.confirmModal.isOpen).toBe(true)
    expect(result.current.confirmModal.options.title).toBe('Confirm Action')
    expect(result.current.confirmModal.options.message).toBe('Are you sure?')
  })

  it('should resolve promise when confirm is called', async () => {
    const { result } = renderHook(() => useModal())

    let promise: Promise<boolean>

    act(() => {
      promise = result.current.showConfirm({
        title: 'Test',
        message: 'Test message',
      })
    })

    act(() => {
      result.current.confirmModal.onConfirm()
    })

    await waitFor(async () => {
      const resolved = await promise
      expect(resolved).toBe(true)
    })

    expect(result.current.confirmModal.isOpen).toBe(false)
  })

  it('should close confirm modal', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showConfirm({
        title: 'Test',
        message: 'Test',
      })
    })

    expect(result.current.confirmModal.isOpen).toBe(true)

    act(() => {
      result.current.closeConfirm()
    })

    expect(result.current.confirmModal.isOpen).toBe(false)
  })

  it('should open prompt modal with correct options', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showPrompt({
        title: 'Enter Name',
        message: 'Please enter your name',
        initialValue: 'John',
      })
    })

    expect(result.current.promptModal.isOpen).toBe(true)
    expect(result.current.promptModal.options.title).toBe('Enter Name')
    expect(result.current.promptModal.options.message).toBe('Please enter your name')
    expect(result.current.promptModal.options.initialValue).toBe('John')
  })

  it('should resolve promise with input value when prompt is confirmed', async () => {
    const { result } = renderHook(() => useModal())

    let promise: Promise<string | null>

    act(() => {
      promise = result.current.showPrompt({
        title: 'Test',
        message: 'Test message',
      })
    })

    act(() => {
      result.current.promptModal.onConfirm('User Input')
    })

    await waitFor(async () => {
      const resolved = await promise
      expect(resolved).toBe('User Input')
    })

    expect(result.current.promptModal.isOpen).toBe(false)
  })

  it('should close prompt modal', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showPrompt({
        title: 'Test',
        message: 'Test',
      })
    })

    expect(result.current.promptModal.isOpen).toBe(true)

    act(() => {
      result.current.closePrompt()
    })

    expect(result.current.promptModal.isOpen).toBe(false)
  })

  it('should open notification modal with correct options', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showNotification({
        title: 'Success',
        message: 'Operation completed',
        type: 'success',
      })
    })

    expect(result.current.notificationModal.isOpen).toBe(true)
    expect(result.current.notificationModal.options.title).toBe('Success')
    expect(result.current.notificationModal.options.message).toBe('Operation completed')
    expect(result.current.notificationModal.options.type).toBe('success')
  })

  it('should close notification modal', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showNotification({
        title: 'Info',
        message: 'Information',
        type: 'info',
      })
    })

    expect(result.current.notificationModal.isOpen).toBe(true)

    act(() => {
      result.current.closeNotification()
    })

    expect(result.current.notificationModal.isOpen).toBe(false)
  })

  it('should handle different notification types', () => {
    const { result } = renderHook(() => useModal())

    const types: Array<'success' | 'error' | 'info'> = ['success', 'error', 'info']

    types.forEach(type => {
      act(() => {
        result.current.showNotification({
          title: `${type} title`,
          message: `${type} message`,
          type,
        })
      })

      expect(result.current.notificationModal.options.type).toBe(type)

      act(() => {
        result.current.closeNotification()
      })
    })
  })

  it('should handle confirm modal with custom text', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showConfirm({
        title: 'Delete Item',
        message: 'This action cannot be undone',
        confirmText: 'Delete',
        cancelText: 'Keep',
        type: 'danger',
      })
    })

    expect(result.current.confirmModal.options.confirmText).toBe('Delete')
    expect(result.current.confirmModal.options.cancelText).toBe('Keep')
    expect(result.current.confirmModal.options.type).toBe('danger')
  })

  it('should handle prompt modal with placeholder', () => {
    const { result } = renderHook(() => useModal())

    act(() => {
      result.current.showPrompt({
        title: 'Enter Email',
        message: 'Please enter your email',
        placeholder: 'email@example.com',
      })
    })

    expect(result.current.promptModal.options.placeholder).toBe('email@example.com')
  })
})
