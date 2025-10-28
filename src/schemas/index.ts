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
// src/schemas/index.ts
import { z } from 'zod'

// Environment Variable Schema
export const environmentVariableSchema = z.object({
  key: z.string().min(1, 'Variable key cannot be empty'),
  value: z.string(),
  description: z.string().optional(),
  isSecret: z.boolean().default(false),
})

// Environment Schema
export const environmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Environment name cannot be empty'),
  description: z.string().optional(),
  variables: z.array(environmentVariableSchema),
})

// HTTP Method Schema
export const httpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])

// Auth Type Schema
export const authTypeSchema = z.enum(['none', 'basic', 'bearer', 'apiKey'])

// Auth Configuration Schema
export const authConfigSchema = z.object({
  type: authTypeSchema,
  username: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
  apiKeyHeader: z.string().optional(),
  apiKeyValue: z.string().optional(),
})

// Key-Value Pair Schema
export const keyValuePairSchema = z.object({
  key: z.string(),
  value: z.string(),
  enabled: z.boolean().default(true),
})

// File Parameter Schema
export const fileParameterSchema = z.object({
  key: z.string().min(1, 'Parameter key cannot be empty'),
  file: z.instanceof(File),
})

// Body Type Schema
export const bodyTypeSchema = z.enum(['none', 'json', 'xml', 'formData', 'text'])

// Request Body Schema
export const requestBodySchema = z.object({
  type: bodyTypeSchema,
  content: z.string(),
  formData: z.array(keyValuePairSchema).optional(),
  files: z.array(fileParameterSchema).optional(),
})

// URL Validation Schema
export const urlSchema = z
  .string()
  .min(1, 'URL cannot be empty')
  .refine(
    url => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid URL format' },
  )

// API Response Schema
export const apiResponseSchema = z.object({
  status: z.number().int().min(100).max(599),
  statusText: z.string(),
  headers: z.string(),
  body: z.string(),
  contentType: z.string().optional(),
  size: z.number().optional(),
  time: z.number().optional(),
  timestamp: z.string().optional(),
})

// History Entry Schema
export const historyEntrySchema = z.object({
  id: z.string(),
  method: httpMethodSchema,
  url: urlSchema,
  timestamp: z.number(),
  status: z.number().optional(),
  statusText: z.string().optional(),
  duration: z.number().optional(),
  success: z.boolean(),
})

// Saved Request Schema
export const savedRequestSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Request name cannot be empty'),
  method: httpMethodSchema,
  url: urlSchema,
  auth: authConfigSchema.optional(),
  headers: z.array(keyValuePairSchema).optional(),
  params: z.array(keyValuePairSchema).optional(),
  body: requestBodySchema.optional(),
  collectionId: z.string().optional(),
})

// Collection Schema
export const collectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Collection name cannot be empty'),
  description: z.string().optional(),
  requests: z.array(savedRequestSchema),
  workspaceId: z.string(),
})

// Workspace Schema
export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Workspace name cannot be empty'),
  description: z.string().optional(),
  collections: z.array(collectionSchema),
})

// Proxy Config Schema
export const proxyConfigSchema = z.object({
  type: z.enum(['none', 'cors-anywhere', 'allorigins', 'vite-local']),
  customUrl: z.string().optional(),
})

// Export type inference helpers
export type EnvironmentVariable = z.infer<typeof environmentVariableSchema>
export type Environment = z.infer<typeof environmentSchema>
export type HttpMethod = z.infer<typeof httpMethodSchema>
export type AuthType = z.infer<typeof authTypeSchema>
export type AuthConfig = z.infer<typeof authConfigSchema>
export type KeyValuePair = z.infer<typeof keyValuePairSchema>
export type FileParameter = z.infer<typeof fileParameterSchema>
export type BodyType = z.infer<typeof bodyTypeSchema>
export type RequestBody = z.infer<typeof requestBodySchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
export type HistoryEntry = z.infer<typeof historyEntrySchema>
export type SavedRequest = z.infer<typeof savedRequestSchema>
export type Collection = z.infer<typeof collectionSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export type ProxyConfig = z.infer<typeof proxyConfigSchema>

// Validation helper functions
export const validateUrl = (url: string): { success: boolean; error?: string } => {
  try {
    urlSchema.parse(url)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message }
    }
    return { success: false, error: 'Validation failed' }
  }
}

export const validateEnvironment = (env: unknown): { success: boolean; data?: Environment; error?: string } => {
  try {
    const data = environmentSchema.parse(env)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => e.message).join(', ') }
    }
    return { success: false, error: 'Validation failed' }
  }
}

export const validateSavedRequest = (req: unknown): { success: boolean; data?: SavedRequest; error?: string } => {
  try {
    const data = savedRequestSchema.parse(req)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map(e => e.message).join(', ') }
    }
    return { success: false, error: 'Validation failed' }
  }
}
