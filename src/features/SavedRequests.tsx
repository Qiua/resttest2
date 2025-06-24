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
