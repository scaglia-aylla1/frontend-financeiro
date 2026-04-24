# Frontend Financeiro Pessoal

Aplicação web em Angular para controle financeiro pessoal, integrada com uma API Spring Boot com autenticação JWT.

Este frontend consome o backend do projeto de portfólio:
- Backend: [scaglia-aylla1/financeiro](https://github.com/scaglia-aylla1/financeiro)

## Objetivo do projeto

Consolidar prática Full Stack Jr. com foco em:
- autenticação e autorização com JWT;
- consumo de API REST com boas práticas;
- CRUD completo com validação;
- filtros, paginação e UX;
- testes automatizados no frontend.

## Stack e arquitetura

- Angular 21 (standalone components)
- TypeScript
- RxJS
- Tailwind CSS
- Vitest + Angular Testing utilities

Estrutura principal:
- `src/app/core`: serviços, guardas, interceptor e modelos;
- `src/app/features`: telas por domínio (`login`, `register`, `dashboard`, `categorias`);
- `src/app/shared`: componentes reutilizáveis (ex.: toast global).

## Funcionalidades implementadas

- Login e cadastro com persistência de sessão.
- Refresh token automático no interceptor.
- Dashboard com:
  - criação, edição e exclusão de receitas/despesas;
  - filtros por categoria e período;
  - paginação;
  - resumo financeiro (saldo, receitas, despesas).
- CRUD de categorias em tela dedicada.
- Feedback visual global com toast (sucesso/erro).
- Rotas protegidas com `authGuard`.
- Testes unitários dos serviços críticos e specs de componentes.

## Fluxo de autenticação

1. Usuário faz login/cadastro (`/api/v1/auth/login` ou `/api/v1/auth/register`).
2. Frontend salva `accessToken`, `refreshToken` e `userName`.
3. Requisições protegidas recebem `Authorization: Bearer <token>`.
4. Em `401`, o interceptor tenta renovar via `/api/v1/auth/refresh`.
5. Se renovar, repete a requisição original; se falhar, limpa sessão e redireciona para login.

## Como executar localmente

Pré-requisitos:
- Node.js 20+
- npm 10+
- backend disponível (local ou deploy)

Instalar dependências:
```bash
npm install
```

Subir frontend em desenvolvimento:
```bash
npm start
```

Aplicação:
- [http://localhost:4200](http://localhost:4200)

## Scripts úteis

- `npm start`: inicia servidor de desenvolvimento
- `npm run build`: build de produção
- `npm test -- --watch=false`: executa testes uma vez

## Qualidade e testes

Para rodar os testes:
```bash
npm test -- --watch=false
```

Cobertura atual inclui:
- `AuthService` (login, refresh e sessão);
- `TransacaoService` (consultas com filtro/paginação, CRUD essencial);
- specs de componentes principais.

## Próximos passos (roadmap)

- evolução de testes de integração de componentes (fluxos completos);
- melhorias de acessibilidade e estados de carregamento;
- e2e para os fluxos críticos de negócio;
- refinamento visual e documentação com GIF/screenshot.

## Demonstração para recrutadores

Ao avaliar este repositório, os pontos técnicos de destaque são:
- separação clara por camadas no frontend;
- consumo consistente do contrato de API (`ApiResponse<T>`);
- tratamento de sessão e expiração de token;
- evolução incremental com commits por tarefa.
