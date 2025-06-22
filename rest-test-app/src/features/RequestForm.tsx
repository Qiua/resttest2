// src/features/RequestForm.tsx
import React from 'react'
import { KeyValuePairInput } from '../components/KeyValuePairInput'
import { type KeyValuePair, type Parameter } from '../types'

interface RequestFormProps {
  method: string
  setMethod: (method: string) => void
  url: string
  setUrl: (url: string) => void
  auth: KeyValuePair | null
  setAuth: (auth: KeyValuePair | null) => void
  headers: KeyValuePair[]
  setHeaders: (headers: KeyValuePair[]) => void
  params: Parameter[]
  setParams: (params: Parameter[]) => void
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
  onSubmit,
  loading,
}) => {
  const addHeader = () => {
    setHeaders([...headers, { id: crypto.randomUUID(), key: '', value: '' }])
  }

  const addParam = () => {
    setParams([...params, { id: crypto.randomUUID(), key: '', value: '' }])
  }

  const addFileParam = () => {
    setParams([...params, { id: crypto.randomUUID(), key: '', file: null }])
  }

  return (
    <form
      className='bg-white p-6 rounded-lg shadow-md space-y-6'
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <fieldset>
        <legend className='text-2xl font-semibold text-gray-800 border-b pb-2 mb-4'>Requisição HTTP</legend>

        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Method Selector */}
          <div className='flex-shrink-0'>
            <label htmlFor='httpmethod' className='block text-sm font-medium text-gray-700 mb-1'>
              Método
            </label>
            <select
              id='httpmethod'
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
              <option>PATCH</option>
              <option>HEAD</option>
              <option>OPTIONS</option>
            </select>
          </div>

          {/* URL Input */}
          <div className='flex-grow'>
            <label htmlFor='urlvalue' className='block text-sm font-medium text-gray-700 mb-1'>
              Endpoint
            </label>
            <input
              type='text'
              id='urlvalue'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>

        {/* --- Authentication --- */}
        <div className='mt-4'>
          <h3 className='text-lg font-medium text-gray-700 mb-2'>Autenticação</h3>
          {auth ? (
            <KeyValuePairInput
              item={auth}
              updateItem={(updated) => setAuth(updated)}
              removeItem={() => setAuth(null)}
              keyPlaceholder='Username'
              valuePlaceholder='Password'
              isPassword
            />
          ) : (
            <button
              type='button'
              onClick={() => setAuth({ id: 'auth', key: '', value: '' })}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            >
              Adicionar Autenticação
            </button>
          )}
        </div>

        {/* --- Headers --- */}
        <div className='mt-4'>
          <h3 className='text-lg font-medium text-gray-700 mb-2'>Headers</h3>
          <div className='space-y-2'>
            {headers.map((header) => (
              <KeyValuePairInput
                key={header.id}
                item={header}
                updateItem={(updated) => setHeaders(headers.map((h) => (h.id === updated.id ? updated : h)))}
                removeItem={() => setHeaders(headers.filter((h) => h.id !== header.id))}
                keyPlaceholder='Header'
                valuePlaceholder='Valor'
              />
            ))}
          </div>
          <button
            type='button'
            onClick={addHeader}
            className='mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
          >
            Adicionar Header
          </button>
        </div>

        {/* --- Parameters --- */}
        <div className='mt-4'>
          <h3 className='text-lg font-medium text-gray-700 mb-2'>Parâmetros</h3>
          <div className='space-y-2'>
            {params.map((param) =>
              'file' in param ? (
                // Lógica para input de arquivo
                <div key={param.id}> {/* Implementar componente FileInput similar a KeyValuePairInput */} </div>
              ) : (
                <KeyValuePairInput
                  key={param.id}
                  item={param}
                  updateItem={(updated) => setParams(params.map((p) => (p.id === updated.id ? updated : p)))}
                  removeItem={() => setParams(params.filter((p) => p.id !== param.id))}
                  keyPlaceholder='Parâmetro'
                  valuePlaceholder='Valor'
                />
              )
            )}
          </div>
          <div className='mt-2 space-x-2'>
            <button
              type='button'
              onClick={addParam}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            >
              Adicionar Parâmetro
            </button>
            <button
              type='button'
              onClick={addFileParam}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            >
              Adicionar Arquivo
            </button>
          </div>
        </div>
      </fieldset>

      <div className='flex justify-end items-center mt-6'>
        {loading && <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-4'></div>}
        <button
          type='submit'
          disabled={loading}
          className='px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          {loading ? 'Enviando...' : 'Enviar Requisição'}
        </button>
      </div>
    </form>
  )
}
