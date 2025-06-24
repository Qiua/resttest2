// src/types/index.ts

export interface KeyValuePair {
  id: string
  key: string
  value: string
}

export interface FileParameter {
  id: string
  key: string
  file: File | null
}

export type Parameter = KeyValuePair | FileParameter

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

export interface ApiResponse {
  status: number
  statusText: string
  headers: string
  body: string
  contentType?: string
}
