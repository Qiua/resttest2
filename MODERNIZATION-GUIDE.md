# 🔧 Guia de Modernização e Prevenção de Bugs - REST Test 2.0

## 📋 Índice

1. [Problemas Críticos Encontrados](#problemas-críticos-encontrados)
2. [Melhorias de Segurança](#melhorias-de-segurança)
3. [Otimizações de Performance](#otimizações-de-performance)
4. [Modernização do Código](#modernização-do-código)
5. [Tratamento de Erros](#tratamento-de-erros)
6. [Validações e Type Safety](#validações-e-type-safety)
7. [Acessibilidade](#acessibilidade)
8. [Boas Práticas para Produção](#boas-práticas-para-produção)

---

## 🚨 Problemas Críticos Encontrados

### 1. Uso de `prompt()` e `alert()` Nativo

**Problema:** Componentes usam dialogs nativos do navegador que bloqueiam execução.

**Localização:**

- `src/components/EnvironmentManager.tsx` - linhas 151, 176
- `src/features/SavedRequests.tsx` - linhas 35, 48

```typescript
// ❌ RUIM - Bloqueia thread, má UX
const newName = prompt(t('environments.duplicateName'), `${env.name} Copy`)
if (confirm('Deletar?')) { ... }
```

**Solução:**

```typescript
// ✅ BOM - Usa sistema de modais
const newName = await modal.showPrompt({
  title: t('environments.duplicateName'),
  message: t('environments.enterNewName'),
  initialValue: `${env.name} Copy`,
})
if (!newName) return
```

**Ação:** Substituir todos os `prompt()`, `alert()`, `confirm()` pelo hook `useModal()`.

---

### 2. Falta de Tratamento de Erros em Async Operations

**Problema:** Várias operações assíncronas sem try-catch adequado.

**Localização:**

- `src/components/EnvironmentManager.tsx:160-178` - FileReader sem error handling
- `src/components/ImportExportModal.tsx:76-91` - Catch vazio

```typescript
// ❌ RUIM
try {
  const content = await readFile(file)
  // ...
} catch {
  showNotification('error', t('importExport.messages.invalidFile'))
}
```

**Solução:**

```typescript
// ✅ BOM
try {
  const content = await readFile(file)
  const format = detectImportFormat(content)
  // ...
} catch (error) {
  console.error('Error reading file:', error)
  showNotification('error', t('importExport.messages.invalidFile'))
  // Opcional: enviar para sistema de logging
  if (process.env.NODE_ENV === 'production') {
    // trackError(error) // Sentry, LogRocket, etc.
  }
}
```

---

### 3. Validação Insuficiente de Entrada de Usuário

**Problema:** Falta validação antes de processar dados do usuário.

**Localização:**

- `src/App.tsx:368-605` - `handleSubmit()` não valida URL
- `src/features/RequestForm.tsx` - Permite envio de requisições inválidas

```typescript
// ❌ RUIM - Sem validação
const handleSubmit = async () => {
  const activeTab = getActiveTab()
  if (!activeTab) return

  const resolvedUrl = resolveVariables(activeTab.url)
  // Envia requisição direto sem validar URL
}
```

**Solução:**

```typescript
// ✅ BOM - Com validação
const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const handleSubmit = async () => {
  const activeTab = getActiveTab()
  if (!activeTab) return

  const resolvedUrl = resolveVariables(activeTab.url)

  if (!resolvedUrl.trim()) {
    modal.showNotification({
      title: t('common.error'),
      message: t('request.errors.urlRequired'),
      type: 'error',
    })
    return
  }

  if (!validateUrl(resolvedUrl)) {
    modal.showNotification({
      title: t('common.error'),
      message: t('request.errors.invalidUrl'),
      type: 'error',
    })
    return
  }

  // Prosseguir com requisição...
}
```

---

### 4. Segurança - XSS em Respostas HTML

**Problema:** Resposta HTML é renderizada sem sanitização.

**Localização:**

- `src/features/ResponseDisplay.tsx` - Renderiza HTML diretamente

**Solução:**

```typescript
// Adicionar ao package.json
"dependencies": {
  "dompurify": "^3.0.8"
}

// Usar DOMPurify para sanitizar
import DOMPurify from 'dompurify'

const sanitizedHtml = DOMPurify.sanitize(response.body)
```

---

### 5. Race Conditions em Requisições

**Problema:** Múltiplas requisições simultâneas podem causar estado inconsistente.

**Localização:**

- `src/App.tsx:368-605` - Não cancela requisições anteriores

**Solução:**

```typescript
// ✅ BOM - Usar AbortController
const handleSubmit = async () => {
  // Cancelar requisição anterior se existir
  if (activeTabAbortController.current) {
    activeTabAbortController.current.abort()
  }

  const controller = new AbortController()
  activeTabAbortController.current = controller

  try {
    const result = await axios.request({
      method: activeTab.method,
      url: finalUrl,
      headers: finalHeaders,
      data,
      signal: controller.signal, // ← Importante
      timeout: 30000, // 30s timeout
    })
    // ...
  } catch (err) {
    if (axios.isCancel(err)) {
      // Requisição cancelada, não é erro
      return
    }
    // Tratar outros erros...
  }
}
```

---

## 🔒 Melhorias de Segurança

### 1. Variáveis Secretas em LocalStorage

**Problema:** Tokens e senhas são salvos em plain text no localStorage.

**Solução:**

```typescript
// Adicionar ao package.json
"dependencies": {
  "crypto-js": "^4.2.0"
}

// Criar utilitário de encriptação
// src/utils/encryption.ts
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = 'seu-key-unico-por-usuario' // Melhor: derivar do sessionId

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
}

export const decryptData = (encrypted: string): string => {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// Uso em useEnvironments.ts
const saveVariable = (variable: EnvironmentVariable) => {
  if (variable.isSecret) {
    return {
      ...variable,
      value: encryptData(variable.value)
    }
  }
  return variable
}
```

---

### 2. Content Security Policy

**Adicionar ao `index.html`:**

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.* http://localhost:*"
/>
```

---

### 3. Sanitização de URLs

**Localização:** `src/utils/corsProxy.ts`

```typescript
// Adicionar validação
export function applyProxy(url: string, config?: ProxyConfig): string {
  // Prevenir ataques de URL injection
  if (url.includes('javascript:') || url.includes('data:')) {
    throw new Error('Invalid URL scheme')
  }

  // Validar URL
  try {
    new URL(url)
  } catch {
    throw new Error('Invalid URL format')
  }

  // Restante da lógica...
}
```

---

## ⚡ Otimizações de Performance

### 1. Memoização de Componentes Pesados

**Localização:** `src/features/ResponseDisplay.tsx`

```typescript
import { memo, useMemo } from 'react'

// Memoizar componente de syntax highlighting (pesado)
const JsonViewer = memo(({ body, language }: { body: string; language: string }) => {
  return (
    <SyntaxHighlighter language={language} style={codeStyle}>
      {body}
    </SyntaxHighlighter>
  )
})

// No componente pai
const formattedJson = useMemo(() => {
  return formatJson(response.body)
}, [response.body])
```

---

### 2. Lazy Loading de Componentes

**Criar:** `src/App.tsx`

```typescript
import { lazy, Suspense } from 'react'

// Lazy load de modais e componentes pesados
const EnvironmentManager = lazy(() => import('./components/EnvironmentManager'))
const ImportExportModal = lazy(() => import('./components/ImportExportModal'))
const RequestHistory = lazy(() => import('./components/RequestHistory'))

// No JSX
<Suspense fallback={<LoadingSpinner />}>
  {environmentManagerOpen && (
    <EnvironmentManager {...props} />
  )}
</Suspense>
```

---

### 3. Debounce em Buscas e Inputs

**Localização:** `src/features/ResponseDisplay.tsx:147-167`

```typescript
import { useMemo } from 'react'
import { debounce } from 'lodash-es' // ou implementar próprio

const debouncedSearch = useMemo(
  () => debounce((term: string) => {
    // Lógica de busca
    const matches = response.body.matchAll(new RegExp(term, 'gi'))
    setSearchMatches(Array.from(matches))
  }, 300),
  [response.body]
)

// Usar
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

---

### 4. Virtual Scrolling para Listas Grandes

**Localização:** `src/components/RequestHistory.tsx`

```typescript
// Adicionar ao package.json
"dependencies": {
  "react-window": "^1.8.10"
}

import { FixedSizeList as List } from 'react-window'

// Renderizar apenas itens visíveis
<List
  height={600}
  itemCount={history.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <HistoryItem item={history[index]} />
    </div>
  )}
</List>
```

---

## 🎯 Modernização do Código

### 1. Migrar para React 19 Features

**Server Components (quando apropriado):**

```typescript
// Não aplicável ainda - app é CSR (Client-Side Rendering)
// Considerar para futuro SSR/SSG com Next.js
```

**Usar novas APIs do React 19:**

```typescript
// use() hook para promises
import { use } from 'react'

function EnvironmentLoader({ environmentId }) {
  const environment = use(fetchEnvironment(environmentId))
  return <EnvironmentDetails env={environment} />
}
```

---

### 2. TypeScript Strict Mode

**Atualizar `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Corrigir erros resultantes:**

```typescript
// Antes
const env = environments.find(e => e.id === id)
env.name // ❌ Pode ser undefined

// Depois
const env = environments.find(e => e.id === id)
if (!env) throw new Error('Environment not found')
env.name // ✅ Tipo garantido
```

---

### 3. Migrar para Async/Await Consistente

**Localização:** Todos os arquivos com Promises

```typescript
// ❌ RUIM - Mistura de .then() e async/await
reader.onload = e => {
  try {
    const content = e.target?.result as string
    // ...
  } catch {}
}

// ✅ BOM - Async/await consistente
const readFileAsync = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = e => reject(e)
    reader.readAsText(file)
  })
}

// Uso
try {
  const content = await readFileAsync(file)
  // ...
} catch (error) {
  handleError(error)
}
```

---

### 4. Substituir `crypto.randomUUID()` por Biblioteca

**Problema:** `crypto.randomUUID()` não disponível em todos os navegadores.

```typescript
// Adicionar ao package.json
"dependencies": {
  "uuid": "^9.0.1"
}

// Criar wrapper
// src/utils/id.ts
import { v4 as uuidv4 } from 'uuid'

export const generateId = (): string => {
  return uuidv4()
}

// Usar em todo o código
const newRequest: SavedRequest = {
  id: generateId(), // ✅ Compatível com todos os navegadores
  // ...
}
```

---

## 🛡️ Tratamento de Erros

### 1. Error Boundary Global

**Criar:** `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Enviar para serviço de logging
    if (process.env.NODE_ENV === 'production') {
      // trackError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Algo deu errado</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{this.state.error?.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Recarregar Aplicação
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

**Usar em `main.tsx`:**

```typescript
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
```

---

### 2. Logging Estruturado

**Criar:** `src/utils/logger.ts`

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    if (this.isDev) {
      console[level](entry)
    } else {
      // Enviar para serviço de logging em produção
      // this.sendToLoggingService(entry)
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('error', message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    })
  }
}

export const logger = new Logger()
```

**Usar:**

```typescript
import { logger } from './utils/logger'

try {
  await sendRequest()
} catch (error) {
  logger.error('Failed to send request', error as Error, {
    url: request.url,
    method: request.method,
  })
}
```

---

## ✅ Validações e Type Safety

### 1. Validação de Schema com Zod

**Adicionar ao package.json:**

```json
"dependencies": {
  "zod": "^3.22.4"
}
```

**Criar schemas:** `src/schemas/request.ts`

```typescript
import { z } from 'zod'

export const RequestStateSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
  url: z.string().url().min(1),
  auth: z.object({
    type: z.enum(['none', 'basic', 'bearer', 'api-key']),
    token: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    apiKeyHeader: z.string().optional(),
    apiKeyValue: z.string().optional(),
  }),
  headers: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      value: z.string(),
    }),
  ),
  params: z.array(
    z.union([
      z.object({
        id: z.string(),
        key: z.string(),
        value: z.string(),
      }),
      z.object({
        id: z.string(),
        key: z.string(),
        file: z.instanceof(File).nullable(),
      }),
    ]),
  ),
  body: z.object({
    type: z.enum(['form-data', 'json', 'xml', 'text']),
    content: z.string(),
  }),
})

export type ValidatedRequestState = z.infer<typeof RequestStateSchema>

// Validar antes de enviar
const validateRequest = (request: RequestState) => {
  try {
    return RequestStateSchema.parse(request)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      throw new Error(`Validation failed:\n${errors.join('\n')}`)
    }
    throw error
  }
}
```

---

### 2. Runtime Type Checking para LocalStorage

**Problema:** Dados do localStorage podem estar corrompidos.

```typescript
// src/hooks/useLocalStorage.ts
import { z } from 'zod'

export function useLocalStorageWithSchema<T>(key: string, defaultValue: T, schema: z.ZodSchema<T>) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return defaultValue

      const parsed = JSON.parse(item)
      // Validar com schema
      return schema.parse(parsed)
    } catch (error) {
      console.warn(`Invalid data in localStorage for key "${key}":`, error)
      // Retornar valor padrão e limpar localStorage corrompido
      window.localStorage.removeItem(key)
      return defaultValue
    }
  })

  // ... resto do hook
}
```

---

## ♿ Acessibilidade

### 1. ARIA Labels e Roles

**Localização:** Todos os componentes interativos

```typescript
// ❌ RUIM
<button onClick={onClose}>
  <FiX size={20} />
</button>

// ✅ BOM
<button
  onClick={onClose}
  aria-label={t('common.close')}
  title={t('common.close')}
>
  <FiX size={20} />
</button>
```

---

### 2. Keyboard Navigation

**Adicionar suporte a teclado:**

```typescript
// Tabs com navegação por teclado
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  if (e.key === 'ArrowRight') {
    const nextIndex = (index + 1) % tabs.length
    setActiveTab(nextIndex)
  } else if (e.key === 'ArrowLeft') {
    const prevIndex = (index - 1 + tabs.length) % tabs.length
    setActiveTab(prevIndex)
  }
}

;<button
  role="tab"
  aria-selected={activeTab === index}
  onKeyDown={e => handleKeyDown(e, index)}
  tabIndex={activeTab === index ? 0 : -1}
>
  {tab.label}
</button>
```

---

### 3. Focus Management

```typescript
import { useRef, useEffect } from 'react'

const ModalComponent = ({ isOpen }: { isOpen: boolean }) => {
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      // Focar primeiro elemento quando modal abre
      firstFocusableRef.current.focus()
    }
  }, [isOpen])

  return (
    <div role="dialog" aria-modal="true">
      <button ref={firstFocusableRef}>{/* Primeiro elemento focável */}</button>
    </div>
  )
}
```

---

## 🚀 Boas Práticas para Produção

### 1. Environment Variables

**Criar:** `.env.production`

```bash
VITE_API_TIMEOUT=30000
VITE_MAX_FILE_SIZE=10485760
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

**Usar:**

```typescript
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000
const MAX_FILE_SIZE = import.meta.env.VITE_MAX_FILE_SIZE || 10485760
```

---

### 2. Build Optimization

**Atualizar `vite.config.ts`:**

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['react-resizable-panels', 'react-syntax-highlighter'],
          'vendor-utils': ['axios', 'i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development',
  },
})
```

---

### 3. Monitoring e Analytics

**Adicionar Sentry:**

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}
```

---

### 4. Service Worker para Offline

**Criar:** `public/sw.js`

```javascript
const CACHE_NAME = 'rest-test-v1'
const urlsToCache = ['/', '/index.html', '/assets/index.css', '/assets/index.js']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)))
})

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)))
})
```

---

### 5. Testes Automatizados

**Adicionar dependências:**

```json
"devDependencies": {
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@vitejs/plugin-react": "^4.2.1",
  "vitest": "^1.0.4"
}
```

**Criar teste exemplo:** `src/hooks/__tests__/useEnvironments.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react'
import { useEnvironments } from '../useEnvironments'

describe('useEnvironments', () => {
  it('should create new environment', () => {
    const { result } = renderHook(() => useEnvironments())

    act(() => {
      result.current.createEnvironment('Test Env', 'Test description')
    })

    expect(result.current.environments).toHaveLength(2) // Global + Test
    expect(result.current.environments[1].name).toBe('Test Env')
  })

  it('should resolve variables correctly', () => {
    const { result } = renderHook(() => useEnvironments())

    act(() => {
      const env = result.current.createEnvironment('Test')
      result.current.addVariable(env.id, {
        key: 'baseUrl',
        value: 'https://api.example.com',
        description: '',
        isSecret: false,
      })
      result.current.setActiveEnvironment(env.id)
    })

    const resolved = result.current.resolveVariables('{{baseUrl}}/users')
    expect(resolved).toBe('https://api.example.com/users')
  })
})
```

---

## 📝 Checklist de Implementação

### Prioridade Alta (Crítico para Produção)

- [ ] Substituir `prompt()`, `alert()`, `confirm()` por modais
- [ ] Adicionar Error Boundary global
- [ ] Implementar validação de URL antes de enviar requisições
- [ ] Adicionar tratamento de erro em todas operações async
- [ ] Implementar AbortController para cancelar requisições
- [ ] Encriptar variáveis secretas no localStorage
- [ ] Adicionar Content Security Policy
- [ ] Sanitizar respostas HTML com DOMPurify

### Prioridade Média (Melhorias)

- [ ] Implementar lazy loading de componentes
- [ ] Adicionar debounce em inputs de busca
- [ ] Memoizar componentes pesados
- [ ] Migrar para TypeScript strict mode
- [ ] Adicionar schema validation com Zod
- [ ] Implementar logging estruturado
- [ ] Adicionar virtual scrolling em listas grandes

### Prioridade Baixa (Nice to Have)

- [ ] Implementar testes automatizados
- [ ] Adicionar Service Worker
- [ ] Integrar Sentry para error tracking
- [ ] Otimizar build com code splitting
- [ ] Melhorar acessibilidade (ARIA, keyboard nav)
- [ ] Adicionar analytics

---

## 🎓 Recursos Adicionais

- [React Best Practices 2025](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Web Accessibility (A11y)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)

---

**Última atualização:** 28 de outubro de 2025
