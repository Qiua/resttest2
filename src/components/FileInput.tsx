// src/components/FileInput.tsx
import React from 'react'
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
    <div className='flex items-center gap-2 p-2 border rounded-lg bg-gray-50'>
      <input
        type='text'
        placeholder={keyPlaceholder}
        value={item.key}
        onChange={(e) => updateItem({ ...item, key: e.target.value })}
        className='w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
        aria-label='Chave do arquivo'
      />
      <label
        htmlFor={inputId}
        className='cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50'
      >
        Escolher Arquivo
      </label>
      <input id={inputId} type='file' onChange={handleFileChange} className='sr-only' />
      <p className='flex-grow text-sm text-gray-700 truncate' title={item.file?.name}>
        {item.file ? item.file.name : 'Nenhum arquivo selecionado'}
      </p>

      <button
        type='button'
        onClick={removeItem}
        className='px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex-shrink-0'
        aria-label='Remover arquivo'
      >
        &times;
      </button>
    </div>
  )
}
