/*
    REST Test 2.0 - Import/Export Utilities
    Copyright (C) 2025  Andrey Aires @ Gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
*/

// src/utils/importExport.ts
import type { Collection, SavedRequest, Workspace, KeyValuePair, AuthState, BodyState } from '../types'

// Tipos para formato Postman Collection v2.1
export interface PostmanInfo {
  _postman_id?: string
  name: string
  description?: string
  schema: string
}

export interface PostmanHeader {
  key: string
  value: string
  disabled?: boolean
}

export interface PostmanQueryParam {
  key: string
  value: string
  disabled?: boolean
}

export interface PostmanAuth {
  type: string
  basic?: Array<{ key: string; value: string }>
  bearer?: Array<{ key: string; value: string }>
  apikey?: Array<{ key: string; value: string }>
}

export interface PostmanBody {
  mode: 'raw' | 'formdata' | 'urlencoded' | 'file' | 'graphql'
  raw?: string
  formdata?: Array<{
    key: string
    value: string
    type?: 'text' | 'file'
  }>
  urlencoded?: Array<{
    key: string
    value: string
    type?: 'text'
  }>
  options?: {
    raw?: {
      language: 'json' | 'javascript' | 'html' | 'xml' | 'text'
    }
  }
}

export interface PostmanRequest {
  method: string
  header: PostmanHeader[]
  body?: PostmanBody
  url:
    | {
        raw: string
        protocol?: string
        host?: string[]
        port?: string
        path?: string[]
        query?: PostmanQueryParam[]
      }
    | string
  auth?: PostmanAuth
}

export interface PostmanItem {
  name: string
  request: PostmanRequest
  response?: unknown[]
}

export interface PostmanCollection {
  info: PostmanInfo
  item: PostmanItem[]
  auth?: PostmanAuth
  variable?: Array<{
    key: string
    value: string
  }>
}

// Formato Insomnia
export interface InsomniaResource {
  _id: string
  _type: string
  name: string
  url?: string
  method?: string
  headers?: Array<{ name: string; value: string }>
  body?: {
    mimeType: string
    text: string
  }
  authentication?: unknown
  parentId?: string
}

export interface InsomniaExport {
  _type: 'export'
  __export_format: number
  __export_date: string
  __export_source: string
  resources: InsomniaResource[]
}

// Formato REST Test nativo
export interface RestTestExport {
  version: string
  exportDate: string
  workspaces: Workspace[]
}

/**
 * Converte uma Collection do REST Test para formato Postman
 */
export function collectionToPostman(collection: Collection): PostmanCollection {
  const postmanItems: PostmanItem[] = collection.requests.map((request) => ({
    name: request.name,
    request: requestToPostman(request),
    response: [],
  }))

  return {
    info: {
      _postman_id: collection.id,
      name: collection.name,
      description: collection.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: postmanItems,
  }
}

/**
 * Converte uma Request do REST Test para formato Postman
 */
function requestToPostman(request: SavedRequest): PostmanRequest {
  const headers: PostmanHeader[] = request.headers.map((h) => ({
    key: h.key,
    value: h.value,
  }))

  // Processar URL e query parameters
  const url = new URL(request.url)
  const queryParams: PostmanQueryParam[] = []

  // Adicionar parâmetros da URL
  url.searchParams.forEach((value, key) => {
    queryParams.push({ key, value })
  })

  // Adicionar parâmetros do formulário
  request.params.forEach((param) => {
    if ('value' in param) {
      queryParams.push({ key: param.key, value: param.value })
    }
  })

  let body: PostmanBody | undefined

  // Processar body baseado no tipo
  if (request.body.type !== 'form-data' && request.body.content) {
    const language = request.body.type === 'json' ? 'json' : request.body.type === 'xml' ? 'xml' : 'text'

    body = {
      mode: 'raw',
      raw: request.body.content,
      options: {
        raw: { language },
      },
    }
  } else if (request.body.type === 'form-data') {
    body = {
      mode: 'formdata',
      formdata: request.params
        .filter((p) => 'value' in p)
        .map((p) => ({ key: p.key, value: (p as KeyValuePair).value, type: 'text' as const })),
    }
  }

  // Processar autenticação
  let auth: PostmanAuth | undefined
  if (request.auth.type === 'basic') {
    auth = {
      type: 'basic',
      basic: [
        { key: 'username', value: request.auth.username || '' },
        { key: 'password', value: request.auth.password || '' },
      ],
    }
  } else if (request.auth.type === 'bearer') {
    auth = {
      type: 'bearer',
      bearer: [{ key: 'token', value: request.auth.token || '' }],
    }
  } else if (request.auth.type === 'api-key') {
    auth = {
      type: 'apikey',
      apikey: [
        { key: 'key', value: request.auth.apiKeyHeader || '' },
        { key: 'value', value: request.auth.apiKeyValue || '' },
        { key: 'in', value: 'header' },
      ],
    }
  }

  return {
    method: request.method,
    header: headers,
    body,
    url: {
      raw: request.url,
      protocol: url.protocol.replace(':', ''),
      host: url.hostname.split('.'),
      port: url.port || undefined,
      path: url.pathname.split('/').filter(Boolean),
      query: queryParams.length > 0 ? queryParams : undefined,
    },
    auth,
  }
}

/**
 * Converte uma Collection do Postman para formato REST Test
 */
export function postmanToCollection(postmanCollection: PostmanCollection): Collection {
  const requests: SavedRequest[] = postmanCollection.item.map((item, index) =>
    postmanRequestToRequest(item, `${postmanCollection.info._postman_id || 'imported'}-${index}`)
  )

  return {
    id: postmanCollection.info._postman_id || crypto.randomUUID(),
    name: postmanCollection.info.name,
    description: postmanCollection.info.description || '',
    requests,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Converte uma Request do Postman para formato REST Test
 */
function postmanRequestToRequest(item: PostmanItem, collectionId: string): SavedRequest {
  const request = item.request

  // Processar headers
  const headers: KeyValuePair[] = request.header.map((h) => ({
    id: crypto.randomUUID(),
    key: h.key,
    value: h.value,
  }))

  // Processar URL
  let url: string
  let params: KeyValuePair[] = []

  if (typeof request.url === 'string') {
    url = request.url
  } else {
    url = request.url.raw
    if (request.url.query) {
      params = request.url.query.map((q) => ({
        id: crypto.randomUUID(),
        key: q.key,
        value: q.value,
      }))
    }
  }

  // Processar body
  let body: BodyState = { type: 'form-data', content: '' }
  if (request.body) {
    if (request.body.mode === 'raw') {
      const language = request.body.options?.raw?.language || 'text'
      body = {
        type: language === 'json' ? 'json' : language === 'xml' ? 'xml' : 'text',
        content: request.body.raw || '',
      }
    } else if (request.body.mode === 'formdata') {
      body = { type: 'form-data', content: '' }
      if (request.body.formdata) {
        params = request.body.formdata.map((fd) => ({
          id: crypto.randomUUID(),
          key: fd.key,
          value: fd.value,
        }))
      }
    } else if (request.body.mode === 'urlencoded') {
      body = { type: 'form-data', content: '' }
      // Para urlencoded, adiciona aos parâmetros que serão convertidos para form-data
      if (request.body.urlencoded) {
        params = [
          ...params,
          ...request.body.urlencoded.map((fd) => ({
            id: crypto.randomUUID(),
            key: fd.key,
            value: fd.value,
          })),
        ]
      }
    }
  }

  // Processar autenticação
  let auth: AuthState = { type: 'none' }
  if (request.auth) {
    if (request.auth.type === 'basic') {
      const basic = request.auth.basic || []
      auth = {
        type: 'basic',
        username: basic.find((b: { key: string; value: string }) => b.key === 'username')?.value || '',
        password: basic.find((b: { key: string; value: string }) => b.key === 'password')?.value || '',
      }
    } else if (request.auth.type === 'bearer') {
      const bearer = request.auth.bearer || []
      auth = {
        type: 'bearer',
        token: bearer.find((b: { key: string; value: string }) => b.key === 'token')?.value || '',
      }
    } else if (request.auth.type === 'apikey') {
      const apikey = request.auth.apikey || []
      auth = {
        type: 'api-key',
        apiKeyHeader: apikey.find((a: { key: string; value: string }) => a.key === 'key')?.value || '',
        apiKeyValue: apikey.find((a: { key: string; value: string }) => a.key === 'value')?.value || '',
      }
    }
  }

  return {
    id: crypto.randomUUID(),
    name: item.name,
    method: request.method,
    url,
    headers,
    params,
    body,
    auth,
    collectionId,
  }
}

/**
 * Exporta um workspace para formato JSON nativo
 */
export function exportWorkspace(workspace: Workspace): string {
  const exportData: RestTestExport = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    workspaces: [workspace],
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Exporta uma collection para formato Postman
 */
export function exportCollectionAsPostman(collection: Collection): string {
  const postmanCollection = collectionToPostman(collection)
  return JSON.stringify(postmanCollection, null, 2)
}

/**
 * Importa uma collection do formato Postman
 */
export function importPostmanCollection(jsonData: string): Collection {
  const postmanCollection: PostmanCollection = JSON.parse(jsonData)
  return postmanToCollection(postmanCollection)
}

/**
 * Importa um workspace do formato nativo
 */
export function importWorkspace(jsonData: string): Workspace[] {
  const importData: RestTestExport = JSON.parse(jsonData)
  return importData.workspaces
}

/**
 * Detecta o formato do arquivo de importação
 */
export function detectImportFormat(jsonData: string): 'postman' | 'insomnia' | 'rest-test' | 'unknown' {
  try {
    const data = JSON.parse(jsonData)

    // Detectar Postman
    if (data.info && data.info.schema && data.info.schema.includes('postman')) {
      return 'postman'
    }

    // Detectar Insomnia
    if (data._type === 'export' && data.__export_format && data.resources) {
      return 'insomnia'
    }

    // Detectar REST Test
    if (data.version && data.workspaces) {
      return 'rest-test'
    }

    return 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Baixa um arquivo JSON
 */
export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Lê um arquivo selecionado pelo usuário
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}
