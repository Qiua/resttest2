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

// src/hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback, useState } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  callback: () => void
  description: string
  preventDefault?: boolean
}

/**
 * Hook para gerenciar atalhos de teclado na aplicação
 * @param shortcuts Array de atalhos de teclado
 * @param enabled Se os atalhos estão habilitados (padrão: true)
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Não processar atalhos se estiver digitando em input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey
        const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.callback()
          break
        }
      }
    },
    [shortcuts, enabled],
  )

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

/**
 * Hook para gerenciar navegação por teclado em listas
 * @param items Array de itens da lista
 * @param onSelect Callback quando um item é selecionado
 * @param initialIndex Índice inicial (padrão: -1)
 */
export const useKeyboardListNavigation = <T>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  initialIndex = -1,
) => {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex)

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev))
          break
        case 'Home':
          event.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          event.preventDefault()
          setFocusedIndex(items.length - 1)
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            onSelect(items[focusedIndex], focusedIndex)
          }
          break
      }
    },
    [items, focusedIndex, onSelect],
  )

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  }
}
