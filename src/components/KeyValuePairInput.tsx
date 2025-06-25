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
// src/components/KeyValuePairInput.tsx
import React from 'react'
import { FiX } from 'react-icons/fi'
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
        className='flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      />
      <input
        type={isPassword ? 'password' : 'text'}
        placeholder={valuePlaceholder}
        value={item.value}
        onChange={(e) => updateItem({ ...item, value: e.target.value })}
        className='flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      />
      <button
        type='button'
        onClick={removeItem}
        className='px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500'
      >
        <FiX className='w-4 h-4' />
      </button>
    </div>
  )
}
