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

// src/components/LiveRegion.tsx
import React, { useEffect, useState } from 'react'

interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  clearAfter?: number // Tempo em ms para limpar a mensagem
}

/**
 * Componente Live Region para anunciar mensagens a leitores de tela
 * sem alterar o layout visual da página
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({ message, politeness = 'polite', clearAfter = 5000 }) => {
  const [currentMessage, setCurrentMessage] = useState('')

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)

      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          setCurrentMessage('')
        }, clearAfter)

        return () => clearTimeout(timer)
      }
    }
  }, [message, clearAfter])

  return (
    <div role="status" aria-live={politeness} aria-atomic="true" className="sr-only">
      {currentMessage}
    </div>
  )
}
