/*
    REST Test 2.0 - Environment Manager Component
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

// src/components/EnvironmentManager.tsx
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiSettings,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiUpload,
  FiX,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiLayers,
  FiCheck,
} from 'react-icons/fi'
import type { Environment, EnvironmentVariable } from '../types'

interface EnvironmentManagerProps {
  isOpen: boolean
  onClose: () => void
  environments: Environment[]
  activeEnvironmentId: string | null
  onCreateEnvironment: (name: string, description?: string) => void
  onUpdateEnvironment: (_id: string, _updates: Partial<Environment>) => void
  onDeleteEnvironment: (id: string) => void
  onSetActiveEnvironment: (id: string | null) => void
  onDuplicateEnvironment: (id: string, newName: string) => void
  onAddVariable: (environmentId: string, variable: EnvironmentVariable) => void
  onUpdateVariable: (environmentId: string, oldKey: string, variable: EnvironmentVariable) => void
  onDeleteVariable: (environmentId: string, key: string) => void
  onImportEnvironment: (environment: Environment) => void
  onExportEnvironment: (id: string) => void
  onExportAllEnvironments: () => void
}

interface VariableFormData {
  key: string
  value: string
  description: string
  isSecret: boolean
}

export const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({
  isOpen,
  onClose,
  environments,
  activeEnvironmentId,
  onCreateEnvironment,
  onUpdateEnvironment: _onUpdateEnvironment,
  onDeleteEnvironment,
  onSetActiveEnvironment,
  onDuplicateEnvironment,
  onAddVariable,
  onUpdateVariable,
  onDeleteVariable,
  onImportEnvironment,
  onExportEnvironment,
  onExportAllEnvironments,
}) => {
  const { t } = useTranslation()
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showVariableForm, setShowVariableForm] = useState(false)
  const [editingVariable, setEditingVariable] = useState<EnvironmentVariable | null>(null)
  const [newEnvironmentName, setNewEnvironmentName] = useState('')
  const [newEnvironmentDescription, setNewEnvironmentDescription] = useState('')
  const [variableForm, setVariableForm] = useState<VariableFormData>({
    key: '',
    value: '',
    description: '',
    isSecret: false,
  })
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedEnvironment = environments.find(env => env.id === selectedEnvironmentId)

  // Reset forms
  const resetForms = () => {
    setShowCreateForm(false)
    setShowVariableForm(false)
    setEditingVariable(null)
    setNewEnvironmentName('')
    setNewEnvironmentDescription('')
    setVariableForm({ key: '', value: '', description: '', isSecret: false })
  }

  // Handle create environment
  const handleCreateEnvironment = () => {
    if (!newEnvironmentName.trim()) return

    onCreateEnvironment(newEnvironmentName.trim(), newEnvironmentDescription.trim() || undefined)
    resetForms()
  }

  // Handle create/update variable
  const handleSaveVariable = () => {
    if (!selectedEnvironmentId || !variableForm.key.trim()) return

    const variable: EnvironmentVariable = {
      key: variableForm.key.trim(),
      value: variableForm.value,
      description: variableForm.description.trim() || undefined,
      isSecret: variableForm.isSecret,
    }

    if (editingVariable) {
      onUpdateVariable(selectedEnvironmentId, editingVariable.key, variable)
    } else {
      onAddVariable(selectedEnvironmentId, variable)
    }

    resetForms()
  }

  // Handle edit variable
  const handleEditVariable = (variable: EnvironmentVariable) => {
    setEditingVariable(variable)
    setVariableForm({
      key: variable.key,
      value: variable.value,
      description: variable.description || '',
      isSecret: variable.isSecret || false,
    })
    setShowVariableForm(true)
  }

  // Handle duplicate environment
  const handleDuplicateEnvironment = (env: Environment) => {
    const newName = prompt(t('environments.duplicateName'), `${env.name} Copy`)
    if (newName) {
      onDuplicateEnvironment(env.id, newName)
    }
  }

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        if (Array.isArray(data)) {
          // Multiple environments
          data.forEach(env => onImportEnvironment(env))
        } else {
          // Single environment
          onImportEnvironment(data)
        }
      } catch {
        alert(t('environments.importError'))
      }
    }
    reader.readAsText(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Toggle secret visibility
  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] h-[85vh] flex flex-col max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FiSettings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('environments.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Environment List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Environment Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('environments.environmentList')}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title={t('environments.createNew')}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                    title={t('environments.import')}
                  >
                    <FiUpload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onExportAllEnvironments}
                    className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                    title={t('environments.exportAll')}
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Environment Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('environments.activeEnvironment')}
                </label>
                <select
                  value={activeEnvironmentId || ''}
                  onChange={e => onSetActiveEnvironment(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('environments.noEnvironment')}</option>
                  {environments
                    .filter(env => !env.isGlobal)
                    .map(env => (
                      <option key={env.id} value={env.id}>
                        {env.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Environment List */}
            <div className="flex-1 overflow-auto">
              {environments.map(env => (
                <div
                  key={env.id}
                  className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedEnvironmentId === env.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500'
                      : ''
                  }`}
                  onClick={() => setSelectedEnvironmentId(env.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {env.isGlobal ? (
                        <FiGlobe className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      ) : (
                        <FiLayers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{env.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{env.variables.length} variables</div>
                      </div>
                    </div>

                    {activeEnvironmentId === env.id && !env.isGlobal && (
                      <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>

                  {env.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{env.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col">
            {selectedEnvironment ? (
              <>
                {/* Environment Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedEnvironment.name}</h3>
                      {selectedEnvironment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedEnvironment.description}
                        </p>
                      )}
                    </div>

                    {!selectedEnvironment.isGlobal && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDuplicateEnvironment(selectedEnvironment)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title={t('environments.duplicate')}
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onExportEnvironment(selectedEnvironment.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors"
                          title={t('environments.export')}
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEnvironment(selectedEnvironment.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title={t('environments.delete')}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Variables Section */}
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('environments.variables')}
                      </h4>
                      <button
                        onClick={() => setShowVariableForm(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FiPlus className="w-4 h-4" />
                        {t('environments.addVariable')}
                      </button>
                    </div>
                  </div>

                  {/* Variables List */}
                  <div className="flex-1 overflow-auto">
                    {selectedEnvironment.variables.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <FiLayers className="w-12 h-12 mb-4" />
                        <p className="text-lg mb-2">{t('environments.noVariables')}</p>
                        <p className="text-sm">{t('environments.noVariablesDescription')}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedEnvironment.variables.map(variable => (
                          <div
                            key={variable.key}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                    {variable.key}
                                  </span>
                                  {variable.isSecret && (
                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                                      {t('environments.secret')}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 flex items-center gap-2">
                                  {variable.isSecret ? (
                                    <>
                                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                        {showSecrets[variable.key] ? variable.value : '••••••••'}
                                      </span>
                                      <button
                                        onClick={() => toggleSecretVisibility(variable.key)}
                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      >
                                        {showSecrets[variable.key] ? (
                                          <FiEyeOff className="w-3 h-3" />
                                        ) : (
                                          <FiEye className="w-3 h-3" />
                                        )}
                                      </button>
                                    </>
                                  ) : (
                                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                      {variable.value}
                                    </span>
                                  )}
                                </div>

                                {variable.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {variable.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 ml-4">
                                <button
                                  onClick={() => handleEditVariable(variable)}
                                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                  title={t('environments.editVariable')}
                                >
                                  <FiEdit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteVariable(selectedEnvironment.id, variable.key)}
                                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  title={t('environments.deleteVariable')}
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FiSettings className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg mb-2">{t('environments.selectEnvironment')}</p>
                  <p className="text-sm">{t('environments.selectEnvironmentDescription')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Environment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('environments.createNew')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('environments.name')}
                </label>
                <input
                  type="text"
                  value={newEnvironmentName}
                  onChange={e => setNewEnvironmentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('environments.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('environments.description')}
                </label>
                <textarea
                  value={newEnvironmentDescription}
                  onChange={e => setNewEnvironmentDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={t('environments.descriptionPlaceholder')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForms}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateEnvironment}
                disabled={!newEnvironmentName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variable Form Modal */}
      {showVariableForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {editingVariable ? t('environments.editVariable') : t('environments.addVariable')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('environments.variableKey')}
                </label>
                <input
                  type="text"
                  value={variableForm.key}
                  onChange={e => setVariableForm(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="apiKey"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('environments.variableValue')}
                </label>
                <input
                  type={variableForm.isSecret ? 'password' : 'text'}
                  value={variableForm.value}
                  onChange={e => setVariableForm(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="your-api-key-value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('environments.variableDescription')}
                </label>
                <input
                  type="text"
                  value={variableForm.description}
                  onChange={e => setVariableForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('environments.variableDescriptionPlaceholder')}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSecret"
                  checked={variableForm.isSecret}
                  onChange={e => setVariableForm(prev => ({ ...prev, isSecret: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isSecret" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('environments.isSecret')}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForms}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveVariable}
                disabled={!variableForm.key.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingVariable ? t('common.save') : t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
