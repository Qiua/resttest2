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

// src/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react'

/**
 * Hook para implementar focus trap em modais e overlays
 * Mantém o foco dentro do elemento quando ativo
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive) return

    // Salvar elemento ativo anterior
    previousActiveElement.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Focar no primeiro elemento focável do container
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (firstElement) {
      firstElement.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      // Se não há elementos focáveis, prevenir tab
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      // Se há apenas um elemento focável, prevenir tab
      if (focusableElements.length === 1) {
        event.preventDefault()
        firstElement?.focus()
        return
      }

      // Tab reverso no primeiro elemento -> ir para o último
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
        return
      }

      // Tab normal no último elemento -> ir para o primeiro
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
        return
      }
    }

    // Prevenir foco fora do container
    const handleFocusOut = (event: FocusEvent) => {
      if (!container.contains(event.relatedTarget as Node)) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('focusout', handleFocusOut)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('focusout', handleFocusOut)

      // Restaurar foco ao elemento anterior quando o modal fechar
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive])

  return containerRef
}
