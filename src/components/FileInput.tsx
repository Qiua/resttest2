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
// src/components/FileInput.tsx
import React from 'react'
import { FiX, FiUpload } from 'react-icons/fi'
import type { FileParameter } from '../types'

interface FileInputProps {
  item: FileParameter
  updateItem: (item: FileParameter) => void
  removeItem: () => void
  keyPlaceholder?: string
}

export const FileInput: React.FC<FileInputProps> = ({
  item,
  updateItem,
  removeItem,
  keyPlaceholder = 'Chave do Arquivo',
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updateItem({ ...item, file: e.target.files[0] })
    } else {
      updateItem({ ...item, file: null })
    }
  }

  const inputId = `file-input-${item.id}`

  return (
    <div className='flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800'>
      <input
        type='text'
        placeholder={keyPlaceholder}
        value={item.key}
        onChange={(e) => updateItem({ ...item, key: e.target.value })}
        className='w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500'
        aria-label='Chave do arquivo'
      />
      <label
        htmlFor={inputId}
        className='cursor-pointer px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2'
      >
        <FiUpload className='w-4 h-4' />
        Escolher Arquivo
      </label>
      <input id={inputId} type='file' onChange={handleFileChange} className='sr-only' />
      <p className='flex-grow text-sm text-gray-700 dark:text-gray-300 truncate' title={item.file?.name}>
        {item.file ? item.file.name : 'Nenhum arquivo selecionado'}
      </p>

      <button
        type='button'
        onClick={removeItem}
        className='px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500'
        aria-label='Remover arquivo'
      >
        <FiX className='w-4 h-4' />
      </button>
    </div>
  )
}
