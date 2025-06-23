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

export type AuthType = 'none' | 'basic' | 'bearer'

export interface AuthState {
  type: AuthType
  username?: string
  password?: string
  token?: string
}

export interface ApiResponse {
  status: number
  statusText: string
  headers: string
  body: string
}
