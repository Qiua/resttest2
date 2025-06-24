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
import React from 'react'
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
  loading: boolean
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
  loading,
}) => {
  const addHeader = () => setHeaders([...headers, { id: crypto.randomUUID(), key: '', value: '' }])
  const addParam = () => setParams([...params, { id: crypto.randomUUID(), key: '', value: '' }])
  const addFileParam = () => setParams([...params, { id: crypto.randomUUID(), key: '', file: null }])
  const handleAuthTypeChange = (type: AuthType) => setAuth({ type })

  // Função para renderizar o preview do form-data baseado nos parâmetros
  const renderFormDataPreview = () => {
    const validParams = params.filter(
      (param) => param.key && (('value' in param && param.value) || ('file' in param && param.file))
    )

    if (validParams.length === 0) {
      return (
        <div className='p-4 bg-gray-100 rounded-md text-sm text-gray-600'>
          <p>
            Adicione parâmetros na aba <strong>Parâmetros</strong> para visualizar o corpo da requisição aqui.
          </p>
        </div>
      )
    }

    return (
      <div className='p-4 bg-gray-50 rounded-md text-sm border'>
        <h4 className='font-semibold text-gray-700 mb-3'>Preview do corpo da requisição (form-data):</h4>
        <div className='space-y-2 font-mono text-xs'>
          {validParams.map((param) => (
            <div key={param.id} className='flex items-center gap-2 p-2 bg-white rounded border'>
              <span className='font-semibold text-blue-600 min-w-0 flex-shrink-0'>{param.key}:</span>
              <span className='text-gray-800 break-all'>
                {'file' in param && param.file
                  ? `[Arquivo: ${param.file.name} (${(param.file.size / 1024).toFixed(1)}KB)]`
                  : 'value' in param
                  ? param.value
                  : ''}
              </span>
            </div>
          ))}
        </div>
        <div className='mt-3 pt-3 border-t text-xs text-gray-500'>
          <strong>Content-Type:</strong> multipart/form-data
        </div>
      </div>
    )
  }

  // CORREÇÃO: O conteúdo de cada seção foi movido para a propriedade 'content' da sua respectiva aba.
  const requestTabs = [
    {
      label: 'Parâmetros',
      content: (
        <div className='space-y-2'>
          {params.map((param) =>
            'file' in param ? (
              <FileInput
                key={param.id}
                item={param}
                updateItem={(updated) => setParams(params.map((p) => (p.id === updated.id ? updated : p)))}
                removeItem={() => setParams(params.filter((p) => p.id !== param.id))}
              />
            ) : (
              <KeyValuePairInput
                key={param.id}
                item={param}
                updateItem={(updated: KeyValuePair) =>
                  setParams(params.map((p) => (p.id === updated.id ? updated : p)))
                }
                removeItem={() => setParams(params.filter((p) => p.id !== param.id))}
                keyPlaceholder='Parâmetro'
                valuePlaceholder='Valor'
              />
            )
          )}
          <div className='mt-4 space-x-2'>
            <button
              type='button'
              onClick={addParam}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              Adicionar Parâmetro
            </button>
            <button
              type='button'
              onClick={addFileParam}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              Adicionar Arquivo
            </button>
          </div>
        </div>
      ),
    },
    {
      label: 'Body',
      content: (
        <div className='space-y-4 h-full flex flex-col'>
          <div className='flex items-center gap-x-6 gap-y-2 flex-wrap'>
            <div className='flex items-center'>
              <input
                id='body-type-none'
                type='radio'
                value='form-data'
                checked={body.type === 'form-data'}
                onChange={(e) => setBody({ ...body, type: e.target.value as BodyType })}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              <label htmlFor='body-type-none' className='ml-2 block text-sm font-medium text-gray-700'>
                Form-Data / x-www-form-urlencoded
              </label>
            </div>
            <div className='flex items-center'>
              <input
                id='body-type-json'
                type='radio'
                value='json'
                checked={body.type === 'json'}
                onChange={(e) => setBody({ ...body, type: e.target.value as BodyType })}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              <label htmlFor='body-type-json' className='ml-2 block text-sm font-medium text-gray-700'>
                JSON
              </label>
            </div>
            <div className='flex items-center'>
              <input
                id='body-type-text'
                type='radio'
                value='text'
                checked={body.type === 'text'}
                onChange={(e) => setBody({ ...body, type: e.target.value as BodyType })}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              <label htmlFor='body-type-text' className='ml-2 block text-sm font-medium text-gray-700'>
                Text
              </label>
            </div>
            <div className='flex items-center'>
              <input
                id='body-type-xml'
                type='radio'
                value='xml'
                checked={body.type === 'xml'}
                onChange={(e) => setBody({ ...body, type: e.target.value as BodyType })}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              <label htmlFor='body-type-xml' className='ml-2 block text-sm font-medium text-gray-700'>
                XML
              </label>
            </div>
          </div>{' '}
          {body.type !== 'form-data' ? (
            <div className='flex-grow'>
              <textarea
                value={body.content}
                onChange={(e) => setBody({ ...body, content: e.target.value })}
                placeholder={`Digite o conteúdo ${body.type.toUpperCase()} aqui...`}
                className='w-full h-full resize-none outline-none font-mono text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  padding: '1rem',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  border: '1px solid #3e3e42',
                }}
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
      label: 'Autenticação',
      content: (
        <div className='space-y-4'>
          <div className='flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50'>
            <label className='text-sm font-medium text-gray-700 min-w-[80px]'>Tipo:</label>
            <select
              value={auth.type}
              onChange={(e) => handleAuthTypeChange(e.target.value as AuthType)}
              className='px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
            >
              <option value='none'>Nenhuma autenticação</option>
              <option value='basic'>Basic Auth</option>
              <option value='bearer'>Bearer Token</option>
              <option value='api-key'>API Key</option>
            </select>
          </div>

          {auth.type === 'basic' && (
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Username</label>
                <input
                  type='text'
                  placeholder='Digite o username'
                  value={auth.username || ''}
                  onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                <input
                  type='password'
                  placeholder='Digite a senha'
                  value={auth.password || ''}
                  onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>
          )}

          {auth.type === 'bearer' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Bearer Token</label>
              <input
                type='text'
                placeholder='Digite o token Bearer'
                value={auth.token || ''}
                onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          )}

          {auth.type === 'api-key' && (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Nome do Header</label>
                <input
                  type='text'
                  placeholder='ex: X-API-Key, Authorization'
                  value={auth.apiKeyHeader || ''}
                  onChange={(e) => setAuth({ ...auth, apiKeyHeader: e.target.value })}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Valor da API Key</label>
                <input
                  type='text'
                  placeholder='Digite o valor da API Key'
                  value={auth.apiKeyValue || ''}
                  onChange={(e) => setAuth({ ...auth, apiKeyValue: e.target.value })}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Headers',
      content: (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium text-gray-700'>HTTP Headers</h3>
            <button
              type='button'
              onClick={addHeader}
              className='px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              + Adicionar Header
            </button>
          </div>

          {headers.length === 0 ? (
            <div className='text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg'>
              Nenhum header personalizado adicionado
            </div>
          ) : (
            <div className='space-y-2'>
              {headers.map((header) => (
                <KeyValuePairInput
                  key={header.id}
                  item={header}
                  updateItem={(updated: KeyValuePair) =>
                    setHeaders(headers.map((h) => (h.id === updated.id ? updated : h)))
                  }
                  removeItem={() => setHeaders(headers.filter((h) => h.id !== header.id))}
                  keyPlaceholder='Nome do Header'
                  valuePlaceholder='Valor do Header'
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
      className='h-full flex flex-col'
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {/* Barra Principal - Estilo Postman */}
      <div className='flex items-center gap-1 p-3 bg-white border-b border-gray-200 flex-shrink-0'>
        <select
          id='httpmethod'
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className='px-3 py-2 text-sm font-medium border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px]'
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>
        <input
          type='text'
          id='urlvalue'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className='flex-1 px-3 py-2 text-sm border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='Digite a URL da API'
        />
        <button
          type='submit'
          disabled={loading}
          className='px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-r-md border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[80px]'
        >
          {loading ? 'Enviando...' : 'Send'}
        </button>
      </div>

      {/* Área de Abas */}
      <div className='flex-1 min-h-0 bg-gray-50'>
        <Tabs tabs={requestTabs} />
      </div>
    </form>
  )
}
