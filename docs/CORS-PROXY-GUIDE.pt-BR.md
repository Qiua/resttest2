# Sistema de Proxy CORS - REST Test 2.0

## 🚀 Solução Completa para Problemas de CORS

O REST Test 2.0 inclui um sistema completo para resolver problemas de CORS durante o desenvolvimento e testes de APIs.

## 🎯 Como Usar

### 1. Identificação Automática de CORS

- A aplicação detecta automaticamente URLs que podem ter problemas de CORS
- Exibe avisos visuais quando necessário
- Sugere configuração de proxy

### 2. Configuração de Proxy

#### Acesso às Configurações

- Clique no ícone de configurações (⚙️) no header da aplicação
- Ou clique em "Configurar" no aviso de CORS que aparece automaticamente

#### Opções Disponíveis

**1. Proxy Local (Vite) - RECOMENDADO**

- ✅ Proxy local configurado no Vite
- ✅ Melhor performance
- ✅ Sem limitações de rate limiting
- ✅ Ideal para desenvolvimento

**2. CORS Anywhere**

- ⚠️ Proxy público com limitações
- ⚠️ Requer ativação de demo
- ⚠️ Rate limiting aplicado

**3. AllOrigins**

- ✅ Proxy público gratuito
- ⚠️ Dados podem ser logados
- ✅ Sem necessidade de ativação

**4. Proxy Personalizado**

- ✅ Configure seu próprio servidor proxy
- ✅ Controle total sobre privacidade
- ✅ Sem limitações

### 3. Importação da Collection do Postman

Para testar com a collection anexada:

1. **Importe a Collection**:
   - Clique no ícone de link externo na barra lateral
   - Vá para a aba "Importar"
   - Selecione o arquivo `New Collection.postman_collection.json`
   - A aplicação detectará automaticamente o formato Postman

2. **Configure o Proxy**:
   - Como as URLs da ANATEL terão problemas de CORS, configure um proxy
   - Recomendado: Use "Proxy Local (Vite)" para melhor performance

3. **Teste as Requisições**:
   - Selecione uma requisição importada
   - Execute e veja os resultados sem erros de CORS

## 🔧 Configuração Avançada

### Proxy Local do Vite

O arquivo `vite.config.ts` já está configurado com proxies para:

- `/api/anatel/*` → `https://sistemas.anatel.gov.br/*`
- `/api/cors-proxy/*` → Para outras URLs via CORS Anywhere

### URLs Suportadas Automaticamente

- `sistemas.anatel.gov.br` → Automaticamente roteado via `/api/anatel`
- Outras URLs → Via proxy genérico configurado

## 📋 Exemplos de Uso

### Exemplo 1: URL da ANATEL

```
URL Original: https://sistemas.anatel.gov.br/areaarea/N_ConsultaLocalidade/Tela.asp
Com Proxy Local: /api/anatel/areaarea/N_ConsultaLocalidade/Tela.asp
```

### Exemplo 2: API Externa

```
URL Original: https://api.exemplo.com/dados
Com AllOrigins: https://api.allorigins.win/get?url=https%3A//api.exemplo.com/dados
```

## 🛡️ Segurança e Privacidade

### Proxy Local (Recomendado)

- ✅ Dados não saem do seu ambiente de desenvolvimento
- ✅ Nenhum logging externo
- ✅ Máxima privacidade

### Proxies Públicos

- ⚠️ Dados podem ser registrados pelos serviços
- ⚠️ Use apenas para desenvolvimento
- ⚠️ Não envie dados sensíveis

## 🚀 Em Produção

### Para Resolver CORS Definitivamente:

1. **Configure CORS no Servidor**: Adicione headers CORS apropriados na API
2. **Proxy Backend**: Implemente proxy no seu servidor backend
3. **Same-Origin**: Hospede frontend e backend no mesmo domínio

### Headers CORS Necessários:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🐛 Solução de Problemas

### Erro: "blocked by CORS policy"

1. Verifique se o proxy está habilitado
2. Teste diferentes opções de proxy
3. Use o botão "Testar" para verificar funcionamento

### Proxy não funciona

1. Teste a conectividade com o botão "Testar"
2. Verifique se a URL está formatada corretamente
3. Para CORS Anywhere, ative a demo em: https://cors-anywhere.herokuapp.com/corsdemo

### Problemas de Performance

1. Use o Proxy Local (Vite) sempre que possível
2. Evite proxies públicos para grande volume de requisições
3. Configure proxy personalizado se necessário

## 📚 Links Úteis

- [CORS Anywhere Demo](https://cors-anywhere.herokuapp.com/corsdemo)
- [AllOrigins Docs](https://allorigins.win/)
- [Vite Proxy Docs](https://vitejs.dev/config/server-options.html#server-proxy)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
