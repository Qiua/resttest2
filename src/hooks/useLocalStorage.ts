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
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

function getStorageValue<T>(key: string, defaultValue: T): T {
  // Tenta obter o valor do localStorage
  const saved = localStorage.getItem(key)
  if (saved) {
    return JSON.parse(saved)
  }
  return defaultValue
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue)
  })

  useEffect(() => {
    // Atualiza o localStorage sempre que o 'value' mudar
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
