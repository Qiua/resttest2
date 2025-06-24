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
