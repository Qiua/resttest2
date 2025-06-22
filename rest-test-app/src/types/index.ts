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

export interface ApiResponse {
  status: number
  statusText: string
  headers: string
  body: string
}
