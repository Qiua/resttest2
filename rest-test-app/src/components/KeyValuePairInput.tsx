// src/components/KeyValuePairInput.tsx
import React from 'react'
import type { KeyValuePair } from '../types'

interface KeyValuePairInputProps {
  item: KeyValuePair
  updateItem: (item: KeyValuePair) => void
  removeItem: () => void
  keyPlaceholder?: string
  valuePlaceholder?: string
  isPassword?: boolean
}

export const KeyValuePairInput: React.FC<KeyValuePairInputProps> = ({
  item,
  updateItem,
  removeItem,
  keyPlaceholder = 'Chave',
  valuePlaceholder = 'Valor',
  isPassword = false,
}) => {
  return (
    <div className='flex items-center gap-2'>
      <input
        type='text'
        placeholder={keyPlaceholder}
        value={item.key}
        onChange={(e) => updateItem({ ...item, key: e.target.value })}
        className='flex-grow p-2 border border-gray-300 rounded-md shadow-sm'
      />
      <input
        type={isPassword ? 'password' : 'text'}
        placeholder={valuePlaceholder}
        value={item.value}
        onChange={(e) => updateItem({ ...item, value: e.target.value })}
        className='flex-grow p-2 border border-gray-300 rounded-md shadow-sm'
      />
      <button
        type='button'
        onClick={removeItem}
        className='px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
      >
        &times;
      </button>
    </div>
  )
}
