# REST Test 2.0 - Um Cliente de API Moderno

Project Demo - [https://resttest2.netlify.app/](https://resttest2.netlify.app/)

Este é um fork do maravilhoso projeto https://github.com/jeroen/resttesttest

Um cliente de API web simples, rápido e moderno para fazer requisições HTTP e inspecionar respostas. Este projeto é uma refatoração completa de uma aplicação legada, agora construída com uma stack de tecnologias de ponta, incluindo React, Vite e Tailwind CSS.

## 🚀 Sobre o Projeto

Este projeto nasceu da necessidade de modernizar uma ferramenta interna de teste de APIs. O objetivo era criar uma base de código robusta, performática e com uma excelente experiência de desenvolvimento, pronta para futuras expansões e contribuições da comunidade open source.

### ✨ Funcionalidades Principais

- **Múltiplos Métodos HTTP:** Suporte completo para GET, POST, PUT, DELETE, PATCH, e mais.
- **Painéis Redimensionáveis:** Layout inspirado em ferramentas profissionais como Postman e Insomnia, com painéis de requisição e resposta ajustáveis.
- **Interface com Abas:** Organize os detalhes da sua requisição (Parâmetros, Autenticação, Headers) e da resposta (Corpo, Headers) em abas intuitivas.
- **Autenticação Flexível:** Suporte integrado para:
  - Basic Auth
  - Bearer Token
  - API Key em Headers
- **Envio de Arquivos:** Suporte para requisições `multipart/form-data`.
- **Syntax Highlighting:** Visualização agradável e colorida para respostas em formato JSON.
- **Salvar e Carregar Requisições:** Guarde suas requisições mais usadas no `localStorage` do navegador para reutilizá-las facilmente.
- **Sistema de Ambientes:** Defina variáveis como `{{baseUrl}}` que podem ser reutilizadas em diferentes contextos (desenvolvimento, produção, etc.).
- **Gerenciamento de Coleções:** Organize suas requisições em workspaces e coleções para melhor estruturação.
- **Histórico de Requisições:** Mantenha um registro automático das requisições realizadas com estatísticas detalhadas.
- **Configurações de Proxy:** Contorne limitações de CORS com suporte a diferentes tipos de proxy.

### 🛠️ Construído Com

- **[React](https://reactjs.org/)** - A biblioteca para construir a interface de usuário.
- **[TypeScript](https://www.typescriptlang.org/)** - Para um código mais seguro e manutenível.
- **[Vite](https://vitejs.dev/)** - Ferramenta de build extremamente rápida.
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário para uma estilização moderna e customizável.
- **[Axios](https://axios-http.com/)** - Cliente HTTP para fazer as requisições.
- **[React Resizable Panels](https://react-resizable-panels.com/)** - Para os painéis de layout redimensionáveis.
- **[React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - Para o realce de sintaxe do JSON.

## 🏁 Começando

Para ter uma cópia do projeto rodando localmente, siga estes passos simples.

### Pré-requisitos

Você precisa ter o Node.js e o npm (ou yarn/pnpm) instalados na sua máquina.

- [Node.js](https://nodejs.org/)

### Instalação

1.  Clone o repositório:
    ```sh
    git clone [https://github.com/Qiua/resttesttest.git](https://github.com/Qiua/resttesttest.git)
    ```
2.  Navegue até a pasta do projeto:
    ```sh
    cd resttesttest
    ```
3.  Instale as dependências:
    ```sh
    npm install
    ```
4.  Inicie o servidor de desenvolvimento:
    `sh
npm run dev
`
    A aplicação estará disponível em `http://localhost:5173` (ou a porta indicada no seu terminal).

## 🗺️ Roadmap

Temos várias ideias para o futuro! Sinta-se à vontade para pegar uma delas e contribuir.

- [x] ~~Implementar um sistema de "Coleções" para agrupar requisições.~~
- [x] ~~Adicionar gerenciamento de "Ambientes" (ex: desenvolvimento, produção).~~
- [x] ~~Criar um histórico de requisições recentes.~~
- [x] ~~Implementar sistema de workspaces para organização.~~
- [x] ~~Adicionar suporte a configurações de proxy/CORS.~~
- [x] ~~Criar sistema de importação/exportação de dados.~~
- [x] ~~Implementar internacionalização (i18n) - Português/Inglês.~~
- [x] ~~Adicionar sistema de abas para múltiplas requisições.~~
- [x] ~~Implementar temas claro/escuro.~~
- [x] ~~Adicionar modais de confirmação e notificação.~~
- [ ] Suporte para mais tipos de autenticação (ex: OAuth 2.0).
- [ ] Melhorar a visualização de outros tipos de resposta (HTML, XML).
- [ ] Implementar testes automatizados de requisições.
- [ ] Adicionar documentação automática de APIs.
- [ ] Criar templates de requisições comuns.
- [ ] Novo vídeo de demonstração.

### 📖 Documentação & Guias de Implementação

Este repositório contém vários documentos de implementação e design que explicam os principais subsistemas e o trabalho de engenharia recente. Veja os arquivos abaixo para detalhes:

- [Guia de Ambientes](docs/ENVIRONMENTS.pt-BR.md) — Como usar o sistema de variáveis e ambientes
- [Guia de Proxy](docs/CORS-PROXY-GUIDE.pt-BR.md) — Configuração de proxy para contornar CORS
- [Implementação de Acessibilidade](docs/ACCESSIBILITY-IMPLEMENTATION.md) — Detalhes sobre A11y, ARIA, suporte a teclado e live regions
- [Infraestrutura de Testes](docs/TESTING-INFRASTRUCTURE.md) — Configuração de testes (Vitest), mocks e diretrizes
- [Implementação de Scroll Virtual](docs/VIRTUAL-SCROLLING-IMPLEMENTATION.md) — Abordagem de virtual scrolling para listas grandes (RequestHistory)
- [Correções Críticas Implementadas](docs/CRITICAL-FIXES-IMPLEMENTED.md) — Correções importantes (ex.: realce de sintaxe / build)
- [Guia de Modernização](docs/MODERNIZATION-GUIDE.md) — Notas de alto nível sobre a refatoração e decisões arquiteturais
- [Relatório de i18n](docs/i18n-validation.md) — Resultado da auditoria i18n e chaves adicionadas
- [.github/TEST-RESULTS.md](.github/TEST-RESULTS.md) — Sumário das execuções de teste e notas de CI
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — Dicas para contribuições e uso do Copilot

Também verifique o diretório `docs/` para materiais suplementares e `src/test/` para helpers de setup de testes. Estes documentos estão no diretório `docs/` e na pasta `.github/`, acessíveis diretamente no GitHub.

## 🤝 Contribuindo

Contribuições são o que fazem a comunidade open source um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito bem-vinda**.

Se você tem uma sugestão para melhorar o projeto, por favor, faça um fork do repositório e crie um pull request. Você também pode simplesmente abrir uma issue com a tag "enhancement".

1.  Faça um **Fork** do projeto.
2.  Crie sua **Feature Branch** (`git checkout -b feature/FuncionalidadeIncrivel`).
3.  Faça o **Commit** de suas mudanças (`git commit -m 'Adiciona FuncionalidadeIncrivel'`).
4.  Faça o **Push** para a Branch (`git push origin feature/FuncionalidadeIncrivel`).
5.  Abra um **Pull Request**.

## 📄 Licença

Distribuído sob a Licença GPL-3.0-or-later. Veja `LICENSE.txt` para mais informações.

---
