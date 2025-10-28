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

// src/hooks/useLiveRegion.ts
import { useState } from 'react'

/**
 * Hook para gerenciar mensagens de live region para leitores de tela
 */
export const useLiveRegion = () => {
  const [message, setMessage] = useState('')
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite')

  const announce = (text: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level)
    setMessage(text)
  }

  const clear = () => {
    setMessage('')
  }

  return {
    message,
    politeness,
    announce,
    clear,
  }
}
