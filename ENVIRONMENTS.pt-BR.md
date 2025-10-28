# 🌍 Sistema de Ambientes (Environments)

O REST Test 2.0 agora inclui um sistema robusto de ambientes que permite definir variáveis que podem ser reutilizadas em suas requisições. Isso é especialmente útil para gerenciar diferentes contextos como desenvolvimento, homologação e produção.

## 🚀 Como Usar

### 1. Acessando o Gerenciador de Ambientes

Na barra superior da aplicação, você encontrará:

- **Seletor de Ambiente**: Um dropdown que mostra o ambiente ativo atual
- **Botão de Gerenciar**: Clique para abrir o modal de gerenciamento completo

### 2. Criando um Ambiente

1. Clique no botão "Gerenciar Ambientes" no seletor
2. No modal que abrir, clique em "Novo Ambiente"
3. Defina um nome descritivo (ex: "Desenvolvimento", "Produção")
4. Adicione uma descrição opcional
5. Clique em "Salvar"

### 3. Adicionando Variáveis

Para cada ambiente, você pode definir variáveis:

1. Selecione o ambiente desejado
2. Na seção "Variáveis", clique em "Nova Variável"
3. Defina:
   - **Nome**: O nome da variável (ex: `baseUrl`, `apiKey`)
   - **Valor**: O valor correspondente
   - **Descrição**: Uma descrição opcional
   - **Secreta**: Marque se for uma informação sensível (será mascarada na interface)

### 4. Usando Variáveis nas Requisições

As variáveis são utilizadas com a sintaxe `{{nomeVariavel}}`. Elas podem ser usadas em:

- **URL**: `{{baseUrl}}/api/users`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Parâmetros**: Chave ou valor de parâmetros de formulário
- **Body**: Em qualquer parte do corpo da requisição
- **Autenticação**: Tokens, usuários, senhas, etc.

## 📝 Exemplos Práticos

### Ambiente de Desenvolvimento

```
Nome: Desenvolvimento
Descrição: Servidor local de desenvolvimento

Variáveis:
- baseUrl: http://localhost:3000
- apiKey: dev-api-key-123
- authToken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Ambiente de Produção

```
Nome: Produção
Descrição: Servidor de produção

Variáveis:
- baseUrl: https://api.minhaempresa.com
- apiKey: prod-api-key-xyz
- authToken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Exemplos de Uso nas Requisições

**URL da Requisição:**

```
{{baseUrl}}/api/v1/users
```

**Header de Autorização:**

```
Authorization: Bearer {{authToken}}
```

**Body JSON:**

```json
{
  "apiKey": "{{apiKey}}",
  "environment": "{{env}}",
  "data": {
    "userId": "{{userId}}"
  }
}
```

## 🔄 Funcionalidades Avançadas

### Duplicação de Ambientes

- Útil para criar variações de um ambiente existente
- Mantém todas as variáveis, permitindo edições pontuais

### Importação e Exportação

- **Exportar Ambiente**: Baixa um arquivo JSON com as configurações
- **Exportar Todos**: Baixa todos os ambientes em um único arquivo
- **Importar**: Carrega ambientes de arquivos JSON exportados anteriormente

### Variáveis Secretas

- Variáveis marcadas como "secretas" têm seus valores mascarados na interface
- Útil para tokens, senhas e outras informações sensíveis
- Os valores são utilizados normalmente nas requisições

### Ambiente Global

- Um ambiente especial que está sempre ativo
- Suas variáveis são resolvidas mesmo quando outro ambiente está selecionado
- Útil para configurações que se aplicam a todos os contextos

## 🔧 Resolução de Variáveis

A resolução de variáveis segue esta ordem de prioridade:

1. **Ambiente Ativo**: Variáveis do ambiente selecionado têm prioridade máxima
2. **Ambiente Global**: Usado como fallback se a variável não existir no ambiente ativo
3. **Texto Original**: Se a variável não for encontrada, o texto `{{variavel}}` permanece inalterado

## 💡 Dicas e Boas Práticas

### Nomenclatura de Variáveis

- Use nomes descritivos: `baseUrl` em vez de `url`
- Mantenha consistência entre ambientes
- Use camelCase para melhor legibilidade

### Organização

- Crie ambientes para cada contexto (dev, test, staging, prod)
- Use descrições claras para documentar o propósito
- Mantenha o número de variáveis gerenciável

### Segurança

- Marque informações sensíveis como "secretas"
- Não compartilhe arquivos de ambiente com tokens reais
- Use variáveis específicas para dados sensíveis

### Workflow Eficiente

1. Configure todos os ambientes antes de criar requisições
2. Use o seletor rápido para alternar entre contextos
3. Teste suas requisições em diferentes ambientes
4. Exporte configurações para backup e compartilhamento

## 🔍 Resolução de Problemas

### Variável não está sendo substituída

- Verifique se o nome está correto (case-sensitive)
- Confirme que o ambiente correto está ativo
- Verifique se a variável existe no ambiente selecionado

### Caracteres especiais

- Variáveis com espaços ou caracteres especiais devem usar nomes simples
- Prefira `apiKey` em vez de `api key` ou `api-key`

### Performance

- O sistema resolve variáveis em tempo real
- Não há limite prático para o número de variáveis
- Ambientes são persistidos no localStorage do navegador

---

O sistema de ambientes torna o REST Test 2.0 uma ferramenta ainda mais poderosa para desenvolvimento e teste de APIs, permitindo uma experiência fluida ao trabalhar com múltiplos contextos e configurações.
