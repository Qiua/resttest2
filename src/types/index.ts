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

export interface AuthState {
  type: AuthType
  // Para Basic Auth
  username?: string
  password?: string
  // Para Bearer Token
  token?: string
  // ADICIONADO: Para API Key
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
}
// Representa o estado de uma requisição, incluindo método, URL, autenticação, cabeçalhos e parâmetros
export interface RequestState {
  method: string
  url: string
  auth: AuthState
  headers: KeyValuePair[]
  params: Parameter[]
}

// Representa uma requisição salva, com ID e nome
export interface SavedRequest extends RequestState {
  id: string
  name: string
}
