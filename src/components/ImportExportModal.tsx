/*
    REST Test 2.0 - Import/Export Modal Component
    Copyright (C) 2025  Andrey Aires @ Gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
*/

// src/components/ImportExportModal.tsx
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FiX, FiUpload, FiDownload, FiFile, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi'
import type { Workspace, Collection } from '../types'
import {
  detectImportFormat,
  importPostmanCollection,
  importWorkspace,
  exportWorkspace,
  exportCollectionAsPostman,
  downloadJSON,
  readFile,
} from '../utils/importExport'

interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  workspaces: Workspace[]
  onWorkspaceImported: (workspace: Workspace) => void
  onCollectionImported: (collection: Collection, workspaceId: string) => void
}

type TabType = 'import' | 'export'
type ExportType = 'workspace' | 'collection'
type ExportFormat = 'native' | 'postman'

interface NotificationState {
  type: 'success' | 'error' | 'info' | null
  message: string
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  onWorkspaceImported,
  onCollectionImported,
}) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<TabType>('import')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<NotificationState>({ type: null, message: '' })

  // Export states
  const [exportType, setExportType] = useState<ExportType>('workspace')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('native')
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('')
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification({ type: null, message: '' }), 5000)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setDetectedFormat(null)

    try {
      const content = await readFile(file)
      const format = detectImportFormat(content)
      setDetectedFormat(format)

      if (format !== 'unknown') {
        showNotification('info', t('importExport.messages.fileDetected', { format }))
      } else {
        showNotification('error', t('importExport.messages.invalidFile'))
      }
    } catch (error) {
      console.error('Error reading file:', error)
      showNotification('error', t('importExport.messages.invalidFile'))
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !detectedFormat || detectedFormat === 'unknown') {
      showNotification('error', t('importExport.messages.noFileSelected'))
      return
    }

    setIsProcessing(true)

    try {
      const content = await readFile(selectedFile)

      if (detectedFormat === 'postman') {
        // Import as collection
        const collection = importPostmanCollection(content)

        // If no workspace selected, use the first available or create default
        const targetWorkspaceId = workspaces.length > 0 ? workspaces[0].id : 'default'

        onCollectionImported(collection, targetWorkspaceId)
        showNotification('success', t('importExport.messages.importSuccess'))
      } else if (detectedFormat === 'restTest') {
        // Import as workspace(s)
        const workspaces = importWorkspace(content)
        // Import all workspaces
        workspaces.forEach((workspace) => {
          onWorkspaceImported(workspace)
        })
        showNotification('success', t('importExport.messages.importSuccess'))
      }

      // Reset form
      setSelectedFile(null)
      setDetectedFormat(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Import error:', error)
      showNotification('error', t('importExport.messages.importError'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    if (exportType === 'workspace' && !selectedWorkspaceId) {
      showNotification('error', t('importExport.messages.noWorkspaceSelected'))
      return
    }

    if (exportType === 'collection' && !selectedCollectionId) {
      showNotification('error', t('importExport.messages.noCollectionSelected'))
      return
    }

    setIsProcessing(true)

    try {
      if (exportType === 'workspace') {
        const workspace = workspaces.find((w) => w.id === selectedWorkspaceId)
        if (!workspace) throw new Error('Workspace not found')

        const exportData = exportWorkspace(workspace)
        const filename = `${workspace.name}_workspace.json`
        await downloadJSON(exportData, filename)
      } else if (exportType === 'collection') {
        const workspace = workspaces.find((w) => w.collections.some((c) => c.id === selectedCollectionId))
        const collection = workspace?.collections.find((c) => c.id === selectedCollectionId)

        if (!collection) throw new Error('Collection not found')

        if (exportFormat === 'postman') {
          const postmanData = exportCollectionAsPostman(collection)
          const filename = `${collection.name}_postman.json`
          await downloadJSON(postmanData, filename)
        } else {
          // Native format - export as mini workspace with single collection
          const miniWorkspace: Workspace = {
            id: 'exported',
            name: collection.name,
            collections: [collection],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          const exportData = exportWorkspace(miniWorkspace)
          const filename = `${collection.name}_collection.json`
          await downloadJSON(exportData, filename)
        }
      }

      showNotification('success', t('importExport.messages.exportSuccess'))
    } catch (error) {
      console.error('Export error:', error)
      showNotification('error', t('importExport.messages.exportError'))
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId)
  const availableCollections = selectedWorkspace?.collections || []

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer'
      onClick={handleBackdropClick}
    >
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 cursor-default'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b dark:border-gray-700'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>{t('importExport.title')}</h2>
          <button
            onClick={onClose}
            className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer'
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Notification */}
        {notification.type && (
          <div
            className={`px-6 py-3 border-l-4 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900 dark:text-green-300'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-400 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            }`}
          >
            <div className='flex items-center'>
              {notification.type === 'success' && <FiCheckCircle className='mr-2' />}
              {notification.type === 'error' && <FiAlertCircle className='mr-2' />}
              {notification.type === 'info' && <FiFile className='mr-2' />}
              {notification.message}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className='flex border-b dark:border-gray-700'>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FiUpload className='inline mr-2' />
            {t('importExport.import')}
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FiDownload className='inline mr-2' />
            {t('importExport.export')}
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-200px)]'>
          {activeTab === 'import' ? (
            <div className='space-y-6'>
              <p className='text-gray-600 dark:text-gray-400'>{t('importExport.descriptions.import')}</p>

              {/* File Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  {t('importExport.selectFile')}
                </label>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.json'
                  onChange={handleFileSelect}
                  className='block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-blue-900 dark:file:text-blue-300'
                />
              </div>

              {/* Format Detection */}
              {detectedFormat && detectedFormat !== 'unknown' && (
                <div className='p-4 bg-blue-50 dark:bg-blue-900 rounded-lg'>
                  <h4 className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
                    {t('importExport.formats.' + detectedFormat)}
                  </h4>
                  <p className='text-sm text-blue-600 dark:text-blue-300'>
                    {t('importExport.descriptions.' + detectedFormat)}
                  </p>
                </div>
              )}

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={!selectedFile || !detectedFormat || detectedFormat === 'unknown' || isProcessing}
                className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                  text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center'
              >
                {isProcessing ? (
                  <>
                    <FiLoader className='animate-spin mr-2' />
                    {t('importExport.messages.importing')}
                  </>
                ) : (
                  <>
                    <FiUpload className='mr-2' />
                    {t('importExport.actions.importFile')}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className='space-y-6'>
              <p className='text-gray-600 dark:text-gray-400'>{t('importExport.descriptions.export')}</p>

              {/* Export Type Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  {t('importExport.exportType')}
                </label>
                <div className='grid grid-cols-2 gap-4'>
                  <button
                    onClick={() => setExportType('workspace')}
                    className={`p-4 border-2 rounded-lg text-left ${
                      exportType === 'workspace'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <h4 className='font-medium'>{t('importExport.exportWorkspace')}</h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {t('importExport.descriptions.workspace')}
                    </p>
                  </button>
                  <button
                    onClick={() => setExportType('collection')}
                    className={`p-4 border-2 rounded-lg text-left ${
                      exportType === 'collection'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <h4 className='font-medium'>{t('importExport.exportCollection')}</h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {t('importExport.descriptions.collection')}
                    </p>
                  </button>
                </div>
              </div>

              {/* Workspace/Collection Selection */}
              {exportType === 'workspace' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    {t('importExport.selectWorkspace')}
                  </label>
                  <select
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  >
                    <option value=''>{t('importExport.selectWorkspace')}</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {exportType === 'collection' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      {t('importExport.selectWorkspace')}
                    </label>
                    <select
                      value={selectedWorkspaceId}
                      onChange={(e) => {
                        setSelectedWorkspaceId(e.target.value)
                        setSelectedCollectionId('')
                      }}
                      className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    >
                      <option value=''>{t('importExport.selectWorkspace')}</option>
                      {workspaces.map((workspace) => (
                        <option key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedWorkspaceId && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        {t('importExport.selectCollection')}
                      </label>
                      <select
                        value={selectedCollectionId}
                        onChange={(e) => setSelectedCollectionId(e.target.value)}
                        className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      >
                        <option value=''>{t('importExport.selectCollection')}</option>
                        {availableCollections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Format Selection for Collections */}
                  {selectedCollectionId && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        {t('importExport.actions.exportAs')}
                      </label>
                      <div className='grid grid-cols-2 gap-4'>
                        <button
                          onClick={() => setExportFormat('native')}
                          className={`p-4 border-2 rounded-lg text-left ${
                            exportFormat === 'native'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <h4 className='font-medium'>{t('importExport.formats.native')}</h4>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {t('importExport.descriptions.restTest')}
                          </p>
                        </button>
                        <button
                          onClick={() => setExportFormat('postman')}
                          className={`p-4 border-2 rounded-lg text-left ${
                            exportFormat === 'postman'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <h4 className='font-medium'>{t('importExport.formats.postman')}</h4>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {t('importExport.descriptions.postman')}
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={
                  isProcessing ||
                  (exportType === 'workspace' && !selectedWorkspaceId) ||
                  (exportType === 'collection' && !selectedCollectionId)
                }
                className='w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                  text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center'
              >
                {isProcessing ? (
                  <>
                    <FiLoader className='animate-spin mr-2' />
                    {t('importExport.messages.exporting')}
                  </>
                ) : (
                  <>
                    <FiDownload className='mr-2' />
                    {t('importExport.actions.downloadFile')}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
