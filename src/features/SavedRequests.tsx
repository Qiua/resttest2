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
import { useTranslation } from 'react-i18next'
import type { SavedRequest } from '../types'

interface SavedRequestsProps {
  savedRequests: SavedRequest[]
  onSave: (name: string) => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

export const SavedRequests: React.FC<SavedRequestsProps> = ({ savedRequests, onSave, onLoad, onDelete }) => {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string>('')

  const handleSave = () => {
    const name = prompt(`${t('request.form.saveRequest')}:`)
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
    if (selectedId && confirm(`${t('sidebar.deleteRequest')}?`)) {
      onDelete(selectedId)
      setSelectedId('')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Dropdown compacto */}
      <select
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
        className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
      >
        <option value="">{t('sidebar.selectWorkspace')}</option>
        {savedRequests.map(req => (
          <option key={req.id} value={req.id}>
            {req.name} ({req.method})
          </option>
        ))}
      </select>

      {/* Botões compactos */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleLoad}
          disabled={!selectedId}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {t('common.load')}
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {t('common.save')}
        </button>
        <button
          onClick={handleDelete}
          disabled={!selectedId}
          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  )
}
