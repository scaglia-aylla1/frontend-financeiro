# Apresentação Técnica - Frontend Financeiro

Este documento resume as principais funcionalidades, decisões técnicas e pontos de evolução do projeto para apresentação em entrevistas com recrutadores, gestores ou pessoas técnicas.

## Visão geral

O projeto é uma aplicação web de controle financeiro pessoal desenvolvida em Angular. A aplicação permite que o usuário se cadastre, faça login, gerencie receitas, despesas e categorias, acompanhe o saldo total e filtre lançamentos por categoria e período.

A proposta técnica foi construir uma SPA integrada a uma API REST, com autenticação JWT, rotas protegidas, formulários reativos, serviços HTTP tipados e uma interface responsiva com Tailwind CSS.

## Stack utilizada

- Angular 21 com standalone components.
- TypeScript.
- RxJS.
- Reactive Forms.
- Tailwind CSS.
- Angular HTTP Client.
- Vitest e Angular Testing utilities.
- API REST com autenticação JWT.

## Funcionalidades implementadas

### Autenticação

- Tela de login.
- Tela de cadastro.
- Persistência de `accessToken`, `refreshToken` e nome do usuário.
- Proteção de rotas autenticadas com `authGuard`.
- Interceptor HTTP para adicionar `Authorization: Bearer <token>`.
- Tentativa automática de refresh token em respostas `401`.
- Logout com limpeza de sessão e redirecionamento para login.

### Dashboard financeiro

- Resumo de saldo total.
- Total de receitas.
- Total de despesas.
- Listagem dos últimos lançamentos.
- Criação de receitas e despesas.
- Edição de lançamentos existentes.
- Exclusão de lançamentos.
- Filtros por categoria, data inicial e data final.
- Estados de carregamento e erro ao buscar dados.

### Categorias

- Tela dedicada para gerenciar categorias.
- Criação de categorias.
- Edição de categorias.
- Exclusão de categorias.
- Separação por tipo: `RECEITA` ou `DESPESA`.

### Experiência do usuário

- Layout responsivo com Tailwind CSS.
- Feedback visual com toast global.
- Mensagens de sucesso e erro em operações importantes.
- Validação de formulários antes do envio para a API.

## Decisões técnicas

### Angular standalone

Foi utilizado o modelo standalone do Angular para reduzir boilerplate e deixar a estrutura mais moderna. Com isso, componentes, rotas e providers ficam mais diretos, sem depender de módulos tradicionais.

Essa escolha facilita a leitura do projeto e está alinhada com a evolução recente do Angular.

### Organização por camadas

O projeto foi separado em:

- `core`: serviços, modelos, guards e interceptors.
- `features`: telas principais da aplicação, como login, cadastro, dashboard e categorias.
- `shared`: componentes reutilizáveis, como o toast global.

Essa organização ajuda a separar responsabilidades e facilita manutenção, testes e evolução do projeto.

### Serviços HTTP tipados

As chamadas para a API foram centralizadas em serviços, como `AuthService`, `TransacaoService` e `RelatorioService`.

Essa decisão evita espalhar lógica HTTP pelos componentes e deixa a aplicação mais fácil de testar. Os models TypeScript representam contratos como transações, categorias, paginação e respostas da API.

### Autenticação com JWT e refresh token

A autenticação utiliza `accessToken` para autorizar requisições e `refreshToken` para renovar a sessão quando necessário.

O interceptor HTTP adiciona automaticamente o header de autorização nas chamadas protegidas. Quando a API retorna `401`, o interceptor tenta renovar o token e repetir a requisição original. Caso o refresh falhe, a sessão é limpa e o usuário volta para a tela de login.

Também foi usado `shareReplay` para evitar múltiplas chamadas simultâneas de refresh token quando várias requisições falham ao mesmo tempo.

### RxJS para fluxos assíncronos

O projeto usa RxJS para lidar com comunicação assíncrona e estado da aplicação.

Alguns exemplos:

- `BehaviorSubject` para manter o usuário autenticado.
- `forkJoin` para carregar receitas, despesas e categorias em paralelo no dashboard.
- `takeUntil` para encerrar subscriptions no ciclo de vida do componente.
- `finalize` para controlar estados de carregamento.

### Reactive Forms

Reactive Forms foram usados nos formulários de login, cadastro, transações e categorias.

Essa escolha permite validações declarativas, controle claro do estado do formulário e maior facilidade para evoluir regras de negócio.

### Tailwind CSS

Tailwind CSS foi escolhido para acelerar a construção da interface, mantendo consistência visual e responsividade sem criar muitos arquivos de estilo customizado.

## Qualidade e testes

Foram executadas as seguintes validações:

- `npm run build`: build de produção concluído com sucesso.
- `npm test -- --watch=false`: 8 arquivos de teste e 18 testes passando.
- Verificação de linter da IDE sem erros em `src/app`.

A cobertura atual inclui principalmente:

- `AuthService`.
- `TransacaoService`.
- Specs dos componentes principais.
- Specs básicas de guard e interceptor.

## Pontos fortes para destacar em entrevista

- Uso de Angular moderno com standalone components.
- Separação clara entre telas, serviços, models e componentes compartilhados.
- Integração real com API REST.
- Autenticação com JWT, refresh token e interceptor.
- Uso de TypeScript para contratos de dados.
- Uso de RxJS para coordenar carregamento assíncrono.
- Formulários reativos com validação.
- UX com feedback visual e estados de carregamento.
- Testes unitários passando.

## Pontos de evolução

Alguns pontos que podem ser citados com maturidade técnica:

- O `authGuard` pode evoluir para usar `AuthService.isLogado()` e validar expiração do token antes de liberar a rota.
- A paginação do dashboard pode ser conectada de forma mais fiel à paginação retornada pela API.
- A URL da API pode ser movida para arquivos de environment, evitando repetição em serviços.
- O `RelatorioService` pode ser integrado ao dashboard ou removido caso não seja necessário.
- Os testes do interceptor e do guard podem ser aprofundados com cenários reais de token válido, token expirado, refresh e falha de autenticação.
- Para segurança em produção, é possível discutir o trade-off entre tokens em `localStorage` e cookies `httpOnly`.

## Pitch de 60 a 90 segundos

> Desenvolvi um frontend financeiro em Angular 21 usando TypeScript, Reactive Forms, RxJS e Tailwind CSS. A aplicação permite cadastro, login, gerenciamento de receitas, despesas e categorias, além de um dashboard com resumo financeiro e filtros. Na parte técnica, organizei o projeto em camadas, centralizei chamadas HTTP em serviços tipados, implementei autenticação JWT com interceptor e refresh token, protegi rotas autenticadas e usei RxJS para coordenar carregamento de dados e estado de sessão. Também validei o projeto com build de produção e testes unitários passando.

## Como explicar para um recrutador

Eu destacaria que o projeto não é apenas uma tela visual. Ele tem fluxo completo de autenticação, integração com backend, CRUD, validação, feedback para o usuário e testes. Isso mostra capacidade de construir uma aplicação frontend real, conectada a uma API e organizada para manutenção.

## Como explicar para uma pessoa técnica

Eu destacaria a separação de responsabilidades, o uso de standalone components, services tipados, interceptor funcional, guard de rota, RxJS para fluxos assíncronos e Reactive Forms para validações. Também explicaria os trade-offs atuais e quais melhorias eu priorizaria em uma próxima iteração.
