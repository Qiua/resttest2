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

// src/components/LiveRegion.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { LiveRegion } from './LiveRegion'

describe('LiveRegion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should render with polite politeness by default', () => {
    const { container } = render(<LiveRegion message="Test message" />)

    const liveRegion = container.querySelector('[role="status"]')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
  })

  it('should render with assertive politeness when specified', () => {
    const { container } = render(<LiveRegion message="Error message" politeness="assertive" />)

    const liveRegion = container.querySelector('[role="status"]')
    expect(liveRegion).toHaveAttribute('aria-live', 'assertive')
  })

  it('should display message when provided', () => {
    render(<LiveRegion message="Test message" />)

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should clear message after specified time', async () => {
    const { unmount } = render(<LiveRegion message="Test message" clearAfter={1000} />)

    expect(screen.getByText('Test message')).toBeInTheDocument()

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(1001)
    })

    // Check if message was cleared
    expect(screen.queryByText('Test message')).not.toBeInTheDocument()

    unmount()
  })

  it('should update message when prop changes', () => {
    const { rerender } = render(<LiveRegion message="First message" />)

    expect(screen.getByText('First message')).toBeInTheDocument()

    rerender(<LiveRegion message="Second message" />)

    expect(screen.getByText('Second message')).toBeInTheDocument()
    expect(screen.queryByText('First message')).not.toBeInTheDocument()
  })

  it('should have aria-atomic="true"', () => {
    const { container } = render(<LiveRegion message="Test message" />)

    const liveRegion = container.querySelector('[role="status"]')
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
  })

  it('should have sr-only class for visual hiding', () => {
    const { container } = render(<LiveRegion message="Test message" />)

    const liveRegion = container.querySelector('[role="status"]')
    expect(liveRegion).toHaveClass('sr-only')
  })

  it('should not clear message when clearAfter is 0', () => {
    render(<LiveRegion message="Persistent message" clearAfter={0} />)

    vi.advanceTimersByTime(10000)

    expect(screen.getByText('Persistent message')).toBeInTheDocument()
  })

  it('should handle empty message', () => {
    const { container } = render(<LiveRegion message="" />)

    const liveRegion = container.querySelector('[role="status"]')
    expect(liveRegion).toBeEmptyDOMElement()
  })

  it('should clear timer on unmount', () => {
    const { unmount } = render(<LiveRegion message="Test message" clearAfter={5000} />)

    unmount()

    // Should not throw error
    vi.advanceTimersByTime(5000)
  })

  it('should reset timer when message changes', () => {
    const { rerender } = render(<LiveRegion message="First message" clearAfter={1000} />)

    vi.advanceTimersByTime(500)

    rerender(<LiveRegion message="Second message" clearAfter={1000} />)

    vi.advanceTimersByTime(500)

    // Message should still be there (timer was reset)
    expect(screen.getByText('Second message')).toBeInTheDocument()

    vi.advanceTimersByTime(500)

    // Now it should be cleared
    waitFor(() => {
      expect(screen.queryByText('Second message')).not.toBeInTheDocument()
    })
  })
})
