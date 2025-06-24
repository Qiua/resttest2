// src/features/SavedRequests.tsx
import React, { useState } from 'react'
import type { SavedRequest } from '../types'

interface SavedRequestsProps {
  savedRequests: SavedRequest[]
  onSave: (name: string) => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

export const SavedRequests: React.FC<SavedRequestsProps> = ({ savedRequests, onSave, onLoad, onDelete }) => {
  const [selectedId, setSelectedId] = useState<string>('')

  const handleSave = () => {
    const name = prompt('Digite um nome para esta requisição:')
    if (name) {
      onSave(name)
    }
  }

  const handleLoad = () => {
    if (selectedId) {
      onLoad(selectedId)
    }
  }

  const handleDelete = () => {
    if (selectedId && confirm('Tem certeza que deseja deletar esta requisição?')) {
      onDelete(selectedId)
      setSelectedId('')
    }
  }

  return (
    <div className='p-4 bg-gray-50 rounded-lg shadow-sm border flex items-center gap-4'>
      <button
        onClick={handleSave}
        className='px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700'
      >
        Salvar Requisição Atual
      </button>

      <div className='flex-grow flex items-center gap-2'>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className='w-full p-2 border border-gray-300 rounded-md shadow-sm'
        >
          <option value=''>-- Carregar uma requisição --</option>
          {savedRequests.map((req) => (
            <option key={req.id} value={req.id}>
              {req.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleLoad}
          disabled={!selectedId}
          className='px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 disabled:bg-gray-400'
        >
          Carregar
        </button>
        <button
          onClick={handleDelete}
          disabled={!selectedId}
          className='px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 disabled:bg-gray-400'
        >
          Deletar
        </button>
      </div>
    </div>
  )
}
