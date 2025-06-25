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
// src/types/index.ts

// Representa um par chave-valor, que pode ser usado para cabeçalhos ou parâmetros
export interface KeyValuePair {
  id: string
  key: string
  value: string
}
// Representa um parâmetro de arquivo, que pode ser usado para upload de arquivos
export interface FileParameter {
  id: string
  key: string
  file: File | null
}
export type Parameter = KeyValuePair | FileParameter

// Representa o estado de autenticação, que pode ser Basic Auth, Bearer Token ou API Key
export type AuthType = 'none' | 'basic' | 'bearer' | 'api-key'
// Representa o tipo de corpo da requisição, que pode ser form-data, JSON, XML, ou texto
export type BodyType = 'form-data' | 'json' | 'xml' | 'text'

export interface BodyState {
  type: BodyType
  content: string
}

export interface AuthState {
  type: AuthType
  // Para Basic Auth
  username?: string
  password?: string
  // Para Bearer Token
  token?: string
  // Para API Key
  apiKeyHeader?: string
  apiKeyValue?: string
}
// Representa a resposta da API, incluindo status, cabeçalhos e corpo
export interface ApiResponse {
  status: number
  statusText: string
  headers: string
  body: string
  contentType?: string
  // Informações de timing e tamanho
  size?: number
  time?: number
  timestamp?: number
}
// Representa o estado de uma requisição, incluindo método, URL, autenticação, cabeçalhos e parâmetros
export interface RequestState {
  method: string
  url: string
  auth: AuthState
  headers: KeyValuePair[]
  params: Parameter[]
  body: BodyState
}
// Representa uma requisição salva, com ID e nome
export interface SavedRequest extends RequestState {
  id: string
  name: string
  collectionId?: string // ID da collection que contém esta requisição
}

// Representa uma collection de requisições
export interface Collection {
  id: string
  name: string
  description?: string
  color?: string
  requests: SavedRequest[]
  createdAt: string
  updatedAt: string
}

// Representa um workspace que contém collections
export interface Workspace {
  id: string
  name: string
  description?: string
  collections: Collection[]
  createdAt: string
  updatedAt: string
}

// Estado do sidebar
export interface SidebarState {
  isOpen: boolean
  activeWorkspace?: string
  expandedCollections: string[]
}

// Request Tab - representa uma aba de requisição aberta
export interface RequestTab {
  id: string
  name: string
  method: string
  url: string
  auth: AuthState
  headers: KeyValuePair[]
  params: Parameter[]
  body: BodyState
  response?: ApiResponse | null
  loading?: boolean
  error?: string | null
  isModified?: boolean
  savedRequestId?: string // ID da requisição salva, se for baseada em uma
}

// Estado do sistema de tabs
export interface TabsState {
  tabs: RequestTab[]
  activeTabId: string | null
}
