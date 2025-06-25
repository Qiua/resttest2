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
// src/features/RequestForm.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FiSave, FiPlus, FiFile, FiChevronDown, FiAlertTriangle, FiSettings } from 'react-icons/fi'
import { Tabs } from '../components/Tabs'
import {
  type KeyValuePair,
  type Parameter,
  type AuthState,
  type AuthType,
  type BodyType,
  type BodyState,
} from '../types'
import { FileInput } from '../components/FileInput'
import { KeyValuePairInput } from '../components/KeyValuePairInput'
import { mayHaveCorsIssues, type ProxyConfig } from '../utils/corsProxy'

interface RequestFormProps {
  method: string
  setMethod: (method: string) => void
  url: string
  setUrl: (url: string) => void
  auth: AuthState
  setAuth: (auth: AuthState) => void
  headers: KeyValuePair[]
  setHeaders: (headers: KeyValuePair[]) => void
  params: Parameter[]
  setParams: (params: Parameter[]) => void
  body: BodyState
  setBody: (body: BodyState) => void
  onSubmit: () => void
  onSave?: () => void
  loading: boolean
  proxyConfig?: ProxyConfig
  onProxySettings?: () => void
}

export const RequestForm: React.FC<RequestFormProps> = ({
  method,
  setMethod,
  url,
  setUrl,
  auth,
  setAuth,
  headers,
  setHeaders,
  params,
  setParams,
  body,
  setBody,
  onSubmit,
  onSave,
  loading,
  proxyConfig,
  onProxySettings,
}) => {
  const { t } = useTranslation()
  // Estado para controlar dropdown de métodos
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Métodos HTTP disponíveis
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

  // Valores padrão para evitar erros de undefined
  const safeBody = body || { type: 'form-data', content: '' }
  const safeHeaders = headers || []
  const safeParams = params || []

  // Fechar dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMethodDropdownOpen(false)
      }
    }

    if (methodDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [methodDropdownOpen])

  // Função para definir cores dos métodos HTTP
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600'
      case 'POST':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
      case 'PUT':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600'
      case 'DELETE':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-600'
      case 'PATCH':
        return 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600'
      default:
        return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
    }
  }

  const addHeader = () => setHeaders([...safeHeaders, { id: crypto.randomUUID(), key: '', value: '' }])
  const addParam = () => setParams([...safeParams, { id: crypto.randomUUID(), key: '', value: '' }])
  const addFileParam = () => setParams([...safeParams, { id: crypto.randomUUID(), key: '', file: null }])
  const handleAuthTypeChange = (type: AuthType) => setAuth({ type })

  // Função para renderizar o preview do form-data baseado nos parâmetros
  const renderFormDataPreview = () => {
    const validParams = safeParams.filter(
      param => param.key && (('value' in param && param.value) || ('file' in param && param.file)),
    )

    if (validParams.length === 0) {
      return (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-300">
          <p>{t('request.params.noParams')}</p>
        </div>
      )
    }

    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md text-sm border border-gray-200 dark:border-gray-600">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('request.body.preview')}:</h4>
        <div className="space-y-2 font-mono text-xs">
          {validParams.map(param => (
            <div
              key={param.id}
              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
            >
              <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-0 flex-shrink-0">{param.key}:</span>
              <span className="text-gray-800 dark:text-gray-200 break-all">
                {'file' in param && param.file
                  ? `[Arquivo: ${param.file.name} (${(param.file.size / 1024).toFixed(1)}KB)]`
                  : 'value' in param
                    ? param.value
                    : ''}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
          <strong>Content-Type:</strong> multipart/form-data
        </div>
      </div>
    )
  }

  // CORREÇÃO: O conteúdo de cada seção foi movido para a propriedade 'content' da sua respectiva aba.
  const requestTabs = [
    {
      label: t('request.tabs.params'),
      content: (
        <div className="space-y-2">
          {safeParams.map(param =>
            'file' in param ? (
              <FileInput
                key={param.id}
                item={param}
                updateItem={updated => setParams(safeParams.map(p => (p.id === updated.id ? updated : p)))}
                removeItem={() => setParams(safeParams.filter(p => p.id !== param.id))}
              />
            ) : (
              <KeyValuePairInput
                key={param.id}
                item={param}
                updateItem={(updated: KeyValuePair) =>
                  setParams(safeParams.map(p => (p.id === updated.id ? updated : p)))
                }
                removeItem={() => setParams(safeParams.filter(p => p.id !== param.id))}
                keyPlaceholder={t('request.params.keyPlaceholder')}
                valuePlaceholder={t('request.params.valuePlaceholder')}
              />
            ),
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={addParam}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              {t('request.params.addParam')}
            </button>
            <button
              type="button"
              onClick={addFileParam}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FiFile className="w-4 h-4" />
              {t('request.params.addFile')}
            </button>
          </div>
        </div>
      ),
    },
    {
      label: t('request.tabs.body'),
      content: (
        <div className="space-y-4 h-full flex flex-col">
          <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
            <div className="flex items-center">
              <input
                id="body-type-none"
                type="radio"
                value="form-data"
                checked={safeBody.type === 'form-data'}
                onChange={e => setBody({ ...safeBody, type: e.target.value as BodyType })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <label
                htmlFor="body-type-none"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('request.body.formData')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="body-type-json"
                type="radio"
                value="json"
                checked={safeBody.type === 'json'}
                onChange={e => setBody({ ...safeBody, type: e.target.value as BodyType })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <label
                htmlFor="body-type-json"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('request.body.json')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="body-type-text"
                type="radio"
                value="text"
                checked={safeBody.type === 'text'}
                onChange={e => setBody({ ...safeBody, type: e.target.value as BodyType })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <label
                htmlFor="body-type-text"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('request.body.text')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="body-type-xml"
                type="radio"
                value="xml"
                checked={safeBody.type === 'xml'}
                onChange={e => setBody({ ...safeBody, type: e.target.value as BodyType })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <label
                htmlFor="body-type-xml"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('request.body.xml')}
              </label>
            </div>
          </div>{' '}
          {safeBody.type !== 'form-data' ? (
            <div className="flex-grow">
              <textarea
                value={safeBody.content}
                onChange={e => setBody({ ...safeBody, content: e.target.value })}
                placeholder={t(`request.body.${safeBody.type}Placeholder`)}
                className="w-full h-full resize-none outline-none font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                spellCheck={false}
              />
            </div>
          ) : (
            renderFormDataPreview()
          )}
        </div>
      ),
    },
    {
      label: t('request.tabs.auth'),
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
              {t('request.auth.type')}:
            </label>
            <select
              value={auth.type}
              onChange={e => handleAuthTypeChange(e.target.value as AuthType)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
            >
              <option value="none">{t('request.auth.none')}</option>
              <option value="basic">{t('request.auth.basic')}</option>
              <option value="bearer">{t('request.auth.bearer')}</option>
              <option value="api-key">{t('request.auth.apiKey')}</option>
            </select>
          </div>

          {auth.type === 'basic' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('request.auth.username')}
                </label>
                <input
                  type="text"
                  placeholder={t('request.auth.usernameHelp')}
                  value={auth.username || ''}
                  onChange={e => setAuth({ ...auth, username: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('request.auth.password')}
                </label>
                <input
                  type="password"
                  placeholder={t('request.auth.passwordHelp')}
                  value={auth.password || ''}
                  onChange={e => setAuth({ ...auth, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {auth.type === 'bearer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('request.auth.token')}
              </label>
              <input
                type="text"
                placeholder={t('request.auth.tokenHelp')}
                value={auth.token || ''}
                onChange={e => setAuth({ ...auth, token: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {auth.type === 'api-key' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('request.auth.apiKeyHeader')}
                </label>
                <input
                  type="text"
                  placeholder={t('request.auth.apiKeyHeaderHelp')}
                  value={auth.apiKeyHeader || ''}
                  onChange={e => setAuth({ ...auth, apiKeyHeader: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('request.auth.apiKeyValue')}
                </label>
                <input
                  type="text"
                  placeholder={t('request.auth.apiKeyValueHelp')}
                  value={auth.apiKeyValue || ''}
                  onChange={e => setAuth({ ...auth, apiKeyValue: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: t('request.tabs.headers'),
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('request.headers.title')}</h3>
            <button
              type="button"
              onClick={addHeader}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
            >
              <FiPlus className="w-4 h-4" />
              {t('request.headers.addHeader')}
            </button>
          </div>

          {headers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
              {t('request.headers.noHeaders')}
            </div>
          ) : (
            <div className="space-y-2">
              {headers.map(header => (
                <KeyValuePairInput
                  key={header.id}
                  item={header}
                  updateItem={(updated: KeyValuePair) =>
                    setHeaders(headers.map(h => (h.id === updated.id ? updated : h)))
                  }
                  removeItem={() => setHeaders(headers.filter(h => h.id !== header.id))}
                  keyPlaceholder={t('request.headers.keyPlaceholder')}
                  valuePlaceholder={t('request.headers.valuePlaceholder')}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <form
      className="h-full flex flex-col"
      onSubmit={e => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {/* Barra Principal - Estilo Postman */}
      <div className="flex items-center gap-1 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Dropdown customizado para métodos HTTP */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
            className={`px-3 py-2 text-sm font-medium border rounded-l-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[80px] transition-colors flex items-center justify-between gap-2 ${getMethodColor(
              method,
            )}`}
          >
            {method}
            <FiChevronDown className={`w-4 h-4 transition-transform ${methodDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {methodDropdownOpen && (
            <div className="absolute top-full left-0 z-50 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg overflow-hidden">
              {httpMethods.map(methodOption => (
                <button
                  key={methodOption}
                  type="button"
                  onClick={() => {
                    setMethod(methodOption)
                    setMethodDropdownOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-sm font-medium text-left hover:opacity-80 transition-colors ${getMethodColor(
                    methodOption,
                  )}`}
                >
                  {methodOption}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          id="urlvalue"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border-t border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder={t('request.form.url')}
        />
        <div className="flex">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[80px]"
          >
            {loading ? t('request.form.sending') : t('common.send')}
          </button>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 border border-l-0 border-blue-600 dark:border-blue-400 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={t('request.form.saveRequest')}
            >
              <FiSave className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Aviso de CORS */}
      {mayHaveCorsIssues(url) && proxyConfig && !proxyConfig.enabled && (
        <div className="mx-4 mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">{t('proxy.corsWarning')}</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Esta URL pode falhar devido a restrições CORS. Configure um proxy para resolver.
              </p>
            </div>
            {onProxySettings && (
              <button
                onClick={onProxySettings}
                className="flex items-center gap-1 px-2 py-1 text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 border border-yellow-300 dark:border-yellow-600 rounded hover:bg-yellow-100 dark:hover:bg-yellow-800/50 transition-colors"
              >
                <FiSettings size={12} />
                Configurar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Área de Abas */}
      <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900">
        <Tabs tabs={requestTabs} />
      </div>
    </form>
  )
}
