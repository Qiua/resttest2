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

// src/components/SkipToContent.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkipToContent } from './SkipToContent'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'a11y.skipToContent': 'Skip to main content',
      }
      return translations[key] || key
    },
  }),
}))

describe('SkipToContent', () => {
  it('should render skip link with correct text', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('button', { name: /skip to main content/i })
    expect(skipLink).toBeInTheDocument()
  })

  it('should have sr-only class by default', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('button')
    expect(skipLink).toHaveClass('sr-only')
  })

  it('should focus main content when clicked', async () => {
    const user = userEvent.setup()

    // Create main content element
    const mainContent = document.createElement('main')
    mainContent.id = 'main-content'
    mainContent.tabIndex = -1
    document.body.appendChild(mainContent)

    const focusSpy = vi.spyOn(mainContent, 'focus')

    render(<SkipToContent />)

    const skipLink = screen.getByRole('button')
    await user.click(skipLink)

    expect(focusSpy).toHaveBeenCalled()

    document.body.removeChild(mainContent)
  })

  it('should scroll to main content when clicked', async () => {
    const user = userEvent.setup()

    const mainContent = document.createElement('main')
    mainContent.id = 'main-content'
    mainContent.tabIndex = -1
    document.body.appendChild(mainContent)

    const scrollSpy = vi.spyOn(mainContent, 'scrollIntoView')

    render(<SkipToContent />)

    const skipLink = screen.getByRole('button')
    await user.click(skipLink)

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' })

    document.body.removeChild(mainContent)
  })

  it('should handle missing main content gracefully', async () => {
    const user = userEvent.setup()

    render(<SkipToContent />)

    const skipLink = screen.getByRole('button')

    // Should not throw error
    await expect(user.click(skipLink)).resolves.not.toThrow()
  })

  it('should have proper aria-label', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('button')
    expect(skipLink).toHaveAttribute('aria-label', 'Skip to main content')
  })
})
