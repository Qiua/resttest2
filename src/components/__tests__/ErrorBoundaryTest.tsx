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
// src/components/__tests__/ErrorBoundaryTest.tsx
import { useState } from 'react'

/**
 * Component for testing ErrorBoundary functionality
 * This is NOT imported in the main app - it's for manual testing only
 *
 * To test ErrorBoundary:
 * 1. Temporarily import this component in App.tsx
 * 2. Click "Trigger Error" button
 * 3. Observe ErrorBoundary catching and displaying the error
 * 4. Click "Reset" to recover
 */

interface ErrorBoundaryTestProps {
  shouldError?: boolean
}

export const ErrorBoundaryTest: React.FC<ErrorBoundaryTestProps> = ({ shouldError = false }) => {
  const [throwError, setThrowError] = useState(shouldError)

  if (throwError) {
    // This will be caught by ErrorBoundary
    throw new Error('Test Error: ErrorBoundary is working! This error was intentionally triggered.')
  }

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">ErrorBoundary Test Component</h3>
      <p className="text-yellow-700 dark:text-yellow-300 mb-4">Click the button below to test the ErrorBoundary:</p>
      <button
        onClick={() => setThrowError(true)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Trigger Error
      </button>
      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
        Note: This component is for testing purposes only and should not be included in production builds.
      </p>
    </div>
  )
}
