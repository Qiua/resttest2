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
// src/features/ResponseDisplay.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiCopy, FiEye, FiCode, FiInfo, FiFileText, FiSearch, FiDownload } from 'react-icons/fi'
import type { ApiResponse } from '../types'
import { Tabs } from '../components/Tabs'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ResponseDisplayProps {
  response: ApiResponse | null
  loading: boolean
  error: string | null
}

const getStatusClass = (status: number) => {
  if (status >= 200 && status < 300) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  if (status >= 400) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  if (status >= 300) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, loading, error }) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  // Função para copiar conteúdo para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Poderia adicionar uma notificação aqui
    })
  }

  // Função para formatar JSON de forma mais legível
  const formatJson = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2)
    } catch {
      return jsonString
    }
  }

  // Função para detectar o tipo de conteúdo e linguagem do syntax highlighter
  const getLanguageFromContentType = (contentType: string = '') => {
    if (contentType.includes('json')) return 'json'
    if (contentType.includes('xml')) return 'xml'
    if (contentType.includes('html')) return 'html'
    if (contentType.includes('css')) return 'css'
    if (contentType.includes('javascript')) return 'javascript'
    return 'text'
  }

  // Função para calcular o tamanho em bytes de forma legível
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Função para parsear headers de string para objeto
  const parseHeaders = (headersString: string) => {
    const headers: Record<string, string> = {}
    if (!headersString) return headers

    headersString.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split(': ')
      if (key && valueParts.length > 0) {
        headers[key.trim()] = valueParts.join(': ').trim()
      }
    })
    return headers
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <p className='text-gray-500 dark:text-gray-500'>{t('response.sending')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-100 dark:bg-red-950 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-md'>
          <div className='flex items-center'>
            <FiInfo className='w-5 h-5 mr-3' />
            <div>
              <p className='font-bold'>{t('response.error')}</p>
              <p className='mt-1'>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <FiCode className='w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4' />
          <p className='text-gray-500 dark:text-gray-500 text-lg mb-2'>{t('response.noResponse')}</p>
          <p className='text-gray-400 dark:text-gray-600 text-sm'>{t('response.noResponseDescription')}</p>
        </div>
      </div>
    )
  }

  const isJson = response?.contentType?.includes('application/json')
  const language = getLanguageFromContentType(response.contentType || '')
  const parsedHeaders = parseHeaders(response.headers)
  const responseSize = response.size || new Blob([response.body]).size
  const responseTime = response.time

  const responseTabs = [
    {
      label: (
        <span className='flex items-center space-x-2'>
          <FiEye className='w-4 h-4' />
          <span>{t('response.tabs.response')}</span>
          <span className='text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full'>
            {formatBytes(responseSize)}
          </span>
        </span>
      ),
      content: (
        <div className='h-full flex flex-col'>
          {/* Barra de ferramentas */}
          <div className='flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md'>
            <div className='flex items-center space-x-2'>
              <FiEye className='w-4 h-4 text-gray-500 dark:text-gray-500' />
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                {language.toUpperCase()} • {formatBytes(responseSize)}
              </span>
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => copyToClipboard(response.body)}
                className='flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                title={t('response.toolbar.copyResponse')}
              >
                <FiCopy className='w-4 h-4' />
                <span>{t('common.copy')}</span>
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([response.body], { type: response.contentType || 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `response.${language === 'json' ? 'json' : 'txt'}`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className='flex items-center space-x-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
                title={t('response.toolbar.downloadResponse')}
              >
                <FiDownload className='w-4 h-4' />
                <span>{t('common.download')}</span>
              </button>
            </div>
          </div>

          {/* Busca */}
          <div className='relative mb-4'>
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              placeholder={t('response.toolbar.searchInResponse')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
            />
          </div>

          {/* Conteúdo da resposta */}
          <div className='flex-1 min-h-0'>
            {isJson ? (
              <SyntaxHighlighter
                language='json'
                style={codeStyle}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  height: '100%',
                  borderRadius: '0.375rem',
                  fontSize: '14px',
                }}
                showLineNumbers={true}
                wrapLongLines={true}
              >
                {formatJson(response.body)}
              </SyntaxHighlighter>
            ) : (
              <SyntaxHighlighter
                language={language}
                style={codeStyle}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  height: '100%',
                  borderRadius: '0.375rem',
                  fontSize: '14px',
                }}
                showLineNumbers={true}
                wrapLongLines={true}
              >
                {response.body}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      ),
    },
    {
      label: (
        <span className='flex items-center space-x-2'>
          <FiFileText className='w-4 h-4' />
          <span>{t('response.tabs.headers')}</span>
          <span className='text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full'>
            {Object.keys(parsedHeaders).length}
          </span>
        </span>
      ),
      content: (
        <div className='space-y-4'>
          {/* Ferramentas */}
          <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md'>
            <div className='flex items-center space-x-2'>
              <FiFileText className='w-4 h-4 text-gray-500 dark:text-gray-500' />
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                {Object.keys(parsedHeaders).length} {t('response.info.headersFound')}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(response.headers)}
              className='flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              title={t('response.toolbar.copyHeaders')}
            >
              <FiCopy className='w-4 h-4' />
              <span>{t('common.copy')}</span>
            </button>
          </div>

          {/* Lista de headers */}
          <div className='space-y-2'>
            {Object.entries(parsedHeaders).map(([key, value]) => (
              <div
                key={key}
                className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='font-medium text-gray-900 dark:text-white text-sm'>{key}</span>
                  <button
                    onClick={() => copyToClipboard(value)}
                    className='text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                    title={t('response.toolbar.copyHeaders')}
                  >
                    <FiCopy className='w-4 h-4' />
                  </button>
                </div>
                <p className='text-gray-600 dark:text-gray-400 text-sm mt-1 break-all'>{value}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: (
        <span className='flex items-center space-x-2'>
          <FiCode className='w-4 h-4' />
          <span>{t('response.tabs.raw')}</span>
        </span>
      ),
      content: (
        <div className='h-full flex flex-col'>
          <div className='flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md'>
            <div className='flex items-center space-x-2'>
              <FiCode className='w-4 h-4 text-gray-500 dark:text-gray-500' />
              <span className='text-sm text-gray-600 dark:text-gray-400'>{t('response.toolbar.rawData')}</span>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  `HTTP ${response.status} ${response.statusText}\n${response.headers}\n\n${response.body}`
                )
              }
              className='flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              title={t('response.toolbar.copyCompleteResponse')}
            >
              <FiCopy className='w-4 h-4' />
              <span>{t('response.toolbar.copyAll')}</span>
            </button>
          </div>
          <pre className='flex-1 p-4 bg-gray-900 dark:bg-black text-white dark:text-gray-200 text-sm rounded-md overflow-auto font-mono'>
            {`HTTP ${response.status} ${response.statusText}\n${response.headers}\n\n${response.body}`}
          </pre>
        </div>
      ),
    },
    {
      label: (
        <span className='flex items-center space-x-2'>
          <FiInfo className='w-4 h-4' />
          <span>{t('response.tabs.info')}</span>
        </span>
      ),
      content: (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Informações Gerais */}
            <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4'>
              <h4 className='font-semibold text-gray-900 dark:text-white mb-3 flex items-center'>
                <FiInfo className='w-4 h-4 mr-2' />
                {t('response.info.generalInfo')}
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-500'>{t('response.info.status')}:</span>
                  <span
                    className={`font-medium ${
                      response.status >= 200 && response.status < 300
                        ? 'text-green-600 dark:text-green-400'
                        : response.status >= 400
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}
                  >
                    {response.status} {response.statusText}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-500'>{t('response.info.size')}:</span>
                  <span className='text-gray-900 dark:text-white font-medium'>{formatBytes(responseSize)}</span>
                </div>
                {responseTime && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-500'>{t('response.info.responseTime')}:</span>
                    <span className='text-gray-900 dark:text-white font-medium'>{responseTime}ms</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-500'>{t('response.info.contentType')}:</span>
                  <span className='text-gray-900 dark:text-white font-medium'>{response.contentType || 'N/A'}</span>
                </div>
                {response.timestamp && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-500'>{t('response.info.timestamp')}:</span>
                    <span className='text-gray-900 dark:text-white font-medium'>
                      {new Date(response.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas dos Headers */}
            <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4'>
              <h4 className='font-semibold text-gray-900 dark:text-white mb-3 flex items-center'>
                <FiFileText className='w-4 h-4 mr-2' />
                {t('response.info.headers')}
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-500'>{t('response.info.totalHeaders')}:</span>
                  <span className='text-gray-900 dark:text-white font-medium'>{Object.keys(parsedHeaders).length}</span>
                </div>
                {parsedHeaders['server'] && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-500'>{t('response.info.server')}:</span>
                    <span className='text-gray-900 dark:text-white font-medium'>{parsedHeaders['server']}</span>
                  </div>
                )}
                {parsedHeaders['content-encoding'] && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-500'>{t('response.info.encoding')}:</span>
                    <span className='text-gray-900 dark:text-white font-medium'>
                      {parsedHeaders['content-encoding']}
                    </span>
                  </div>
                )}
                {parsedHeaders['cache-control'] && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-500'>{t('response.info.cacheControl')}:</span>
                    <span className='text-gray-900 dark:text-white font-medium'>{parsedHeaders['cache-control']}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Headers de Segurança */}
          <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4'>
            <h4 className='font-semibold text-gray-900 dark:text-white mb-3'>{t('response.info.securityHeaders')}</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {[
                'strict-transport-security',
                'content-security-policy',
                'x-frame-options',
                'x-content-type-options',
                'x-xss-protection',
                'referrer-policy',
              ].map((header) => (
                <div
                  key={header}
                  className={`p-2 rounded text-sm ${
                    parsedHeaders[header]
                      ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-500'
                  }`}
                >
                  <div className='font-medium'>{header}</div>
                  <div className='text-xs mt-1'>
                    {parsedHeaders[header] ? `✓ ${t('common.present')}` : `✗ ${t('common.absent')}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className='h-full flex flex-col bg-white dark:bg-gray-900'>
      {/* Status da Resposta - Melhorado */}
      <div className='flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{t('response.title')}</h3>
          <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500'>
            <span>
              {t('response.info.size')}: {formatBytes(responseSize)}
            </span>
            {responseTime && (
              <span>
                {t('response.info.responseTime')}: {responseTime}ms
              </span>
            )}
            <span>
              {t('response.info.contentType')}: {response.contentType?.split(';')[0] || t('common.unknown')}
            </span>
          </div>
        </div>
        <div
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold ${getStatusClass(
            response.status
          )}`}
        >
          <span className='mr-2'>●</span>
          HTTP {response.status} {response.statusText}
        </div>
      </div>

      {/* Abas da Resposta */}
      <div className='flex-1 min-h-0'>
        <Tabs tabs={responseTabs} />
      </div>
    </div>
  )
}
