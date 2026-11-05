# Relatório de Projeto

## Plum Guide — Plataforma de Curadoria, Inspeção e Reservas

| | |
| --- | --- |
| **Aplicação** | Plum Guide — Curation, Inspections & Bookings (`plum-guide-curation`) |
| **Empresa de referência** | The Plum Guide (Londres, Reino Unido) — recriação académica do modelo operacional |
| **Autor** | [@kitokaesu](https://github.com/kitokaesu) |
| **Repositório** | <https://github.com/kitokaesu/plum-guide-curation> |
| **Aplicação publicada** | <https://site-ef110a907aa543e89a6159ea2358c1de.freebuff.page> |
| **Versão** | 1.0 — novembro de 2026 |
| **Natureza** | Projeto académico de desenvolvimento web *full-stack*; dados, casas e reservas fictícios |

---

## Resumo

Este relatório documenta o desenho e a implementação de uma aplicação web *full-stack* que reproduz o modelo operacional da Plum Guide, uma plataforma britânica de aluguer de curta duração que se posiciona como "as melhores 3% das casas". O trabalho parte de uma promessa de mercado — a curadoria por inspeção — e tradu-la em regras executáveis: uma inspeção (**Plum Test**) com pontuação de 0 a 100 aprova automaticamente a casa a partir de 85; um calendário de disponibilidade de 365 dias por casa controla o que pode ser reservado; e cada reserva ocupa um registo de noites que impede, ao nível da base de dados, que duas pessoas comprem a mesma noite.

A aplicação foi construída com **Next.js 16 (App Router)** e **React 19**, em **TypeScript**, com **Tailwind CSS** na camada visual, **Prisma 6** sobre **Cloudflare D1** na persistência e sessões assinadas em **JWT HS256** com *hash* **bcrypt**. O *runtime* de produção é **Cloudflare Workers** através do adaptador **OpenNext**; o desenvolvimento local corre em Node.js 22 com uma instância D1 emulada pelo Wrangler.

O resultado é um sistema com quatro portais (hóspede, anfitrião, especialista e administrador), site público bilingue (inglês e português europeu) e preços em euros, validado por uma matriz de testes de integração executada sobre HTTP contra uma base de dados criada de raiz, incluindo o cenário de concorrência que é o principal risco de um marketplace de reservas.

**Palavras-chave:** curadoria, marketplace de alojamento, Next.js, Cloudflare D1, Prisma, transações atómicas, inspeção, UX, acessibilidade.

---

## Índice

1. [Introdução e Contextualização](#1-introdução-e-contextualização)
2. [Definição do Problema e Utilizadores](#2-definição-do-problema-e-utilizadores)
3. [Arquitetura e Tecnologias](#3-arquitetura-e-tecnologias)
4. [Modelação da Base de Dados](#4-modelação-da-base-de-dados)
5. [Interface e UX/UI](#5-interface-e-uxui)
6. [Uso de IA de Código Aberto](#6-uso-de-ia-de-código-aberto)
7. [Testes e Qualidade](#7-testes-e-qualidade)
8. [Conclusão e Trabalho Futuro](#8-conclusão-e-trabalho-futuro)
9. [Referências](#9-referências)
10. [Anexos](#10-anexos)

---

## 1. Introdução e Contextualização

### 1.1 Âmbito e objetivos

O projeto consiste numa aplicação web responsiva que implementa o ciclo operacional completo de uma plataforma de alojamento curado: submissão de uma casa pelo anfitrião, inspeção por um especialista, decisão de aprovação, publicação no catálogo, reserva pelo hóspede, faturação e cancelamento com reembolso. O objetivo não foi reproduzir a interface comercial de um operador real, mas demonstrar que a sua promessa de valor — "só entra o que é excecional" — pode ser convertida em estados, permissões e invariantes verificáveis.

Foram definidos quatro objetivos técnicos:

1. **Integridade transacional** num ambiente *serverless* sem transações interativas.
2. **Autorização por perfil e por propriedade** em todas as mutações, sem confiar no cliente.
3. **Cálculo financeiro autoritativo no servidor**, com totais recalculados e reembolsos derivados de política.
4. **Experiência coerente e acessível**, incluindo internacionalização e formatação monetária.

### 1.2 A empresa e o setor

A **The Plum Guide** é uma empresa britânica que se apresenta como um serviço de curadoria de casas de férias: em vez de listar todo o inventário disponível, submete cada casa a um processo de inspeção e admite apenas uma fração mínima das candidaturas. A comunicação pública assenta em três elementos: a taxa de aceitação (descrita na imprensa como "1 em cada 100"), o processo de inspeção com mais de 150 critérios e a analogia com o guia Michelin — uma classificação que funciona como sinal de confiança num mercado onde o hóspede não consegue avaliar a qualidade antes da estadia.

O setor é interessante por três razões. Primeiro, é um mercado de **confiança assimétrica**: o produto só é conhecível depois de consumido. Segundo, é um mercado de **inventário finito e partilhado**: cada noite existe uma única vez, pelo que a correção transacional tem impacto direto na receita e na reputação. Terceiro, é um mercado com **três lados** (hóspede, anfitrião e inspetor), o que obriga a modelar permissões e fluxos de trabalho distintos na mesma aplicação.

### 1.3 Investigação de mercado e fontes consultadas

A investigação foi documental (*desk research*), limitada a fontes públicas, uma vez que não existia — nem seria apropriado — acesso a sistemas internos da empresa. Organizou-se em quatro frentes:

| Frente | Objetivo | Fontes |
| --- | --- | --- |
| Empresa e proposta de valor | Missão, narrativa de fundação, linguagem "top 3%", promessas de inspeção e cuidado | Página oficial *Our story* [1]; perfil enciclopédico com datas, mercados e financiamento [2] |
| Contexto independente | Validar dimensão, taxa de aceitação e critérios de inspeção | TechCrunch (ronda de 18,5 M USD, 2019) [3]; PhocusWire (mais de 150 critérios) [4]; Business Insider (taxa de aceitação e analogia Michelin) [5] |
| Experiência pública atual | Arquitetura de informação: apresentação das casas, proposta ao anfitrião, sinais de confiança no momento da reserva | Site público da Plum Guide [6] |
| Investigação técnica | Verificar limites reais das tecnologias candidatas antes de as adotar | Documentação de Next.js App Router [7], Prisma com D1 [8], D1 Worker API [9], Cloudflare Workers [10], WCAG 2.2 [11], OWASP ASVS [12] |

A leitura das fontes produziu uma conclusão de desenho: **a promessa da marca tem de ser convertida em estados auditáveis**. "Casa bonita" é um juízo subjetivo; "aprovada após uma inspeção com pontuação igual ou superior a 85" é uma regra implementável, testável e explicável a um anfitrião. A aplicação adota, por isso, uma máquina de estados para a propriedade e uma política financeira explícita para preços e reembolsos.

**Limitações da investigação.** As fontes públicas divergem entre "top 1%" e "top 3%", e os números variam ao longo do tempo; são tratados como contexto de marca e não como dados operacionais verificados. Não foi possível entrevistar colaboradores, anfitriões ou hóspedes da empresa, pelo que as necessidades descritas na secção 2 derivam da proposta pública e de fluxos padrão de marketplaces de alojamento, e não de observação direta.

---

## 2. Definição do Problema e Utilizadores

### 2.1 O problema

Num marketplace de alojamento aberto, o hóspede enfrenta três incertezas: **qualidade desconhecida**, **disponibilidade pouco fiável** e **custos que aparecem tarde**. O anfitrião enfrenta o problema simétrico: **como provar qualidade** sem um processo de certificação e **como não perder reservas** por um calendário desatualizado. A plataforma, por sua vez, precisa de **manter a credibilidade da curadoria** sem bloquear a operação.

O projeto ataca estas três frentes com decisões concretas:

- **Qualidade:** a publicação exige uma inspeção registada, com pontuação, notas e autor, e a aprovação é automática a partir de um limiar público (85/100).
- **Disponibilidade:** a reserva falha de forma explícita quando uma noite já foi vendida ou fechada, e o calendário reflete o estado real (fechado pelo anfitrião, ocupado por reserva ou disponível com preço personalizado).
- **Custo:** o total (noites + limpeza + taxa de serviço) é apresentado antes da confirmação e recalculado no servidor, ignorando qualquer valor enviado pelo cliente.

### 2.2 Personas

As personas abaixo são **sintéticas**, construídas a partir dos perfis de utilizador do sistema e da proposta pública da empresa; não correspondem a pessoas reais nem a entrevistas realizadas.

#### Persona 1 — Marta, hóspede (37 anos, consultora, Lisboa)

- **Objetivo:** reservar uma casa em que possa confiar sem passar horas a comparar avaliações.
- **Contexto:** viaja 4 a 6 vezes por ano em lazer, com o agregado familiar; valoriza previsibilidade e não quer surpresas na fatura.
- **Necessidades:** prova de inspeção visível na página da casa, calendário que não minta, total discriminado antes de pagar, confirmação imediata, fatura e cancelamento autónomo com pré-visualização do reembolso.
- **Frustrações:** descobrir que as datas afinal não estavam livres; taxas que só aparecem no fim; não saber quanto recebe se cancelar.
- **Falha crítica para esta persona:** pagar por uma noite já vendida.

#### Persona 2 — Tomás, anfitrião (52 anos, proprietário de duas casas, Algarve)

- **Objetivo:** ter a casa aprovada e manter-se reservável ao preço certo.
- **Contexto:** gere poucas unidades, com sazonalidade forte; não tem equipa técnica.
- **Necessidades:** submeter o anúncio, marcar uma inspeção numa vaga disponível, gerir 365 dias de calendário com preços por noite, ver reservas e receita.
- **Frustrações:** perder uma reserva por um calendário desatualizado; não conseguir reabrir datas depois de um cancelamento; não perceber porque foi recusado.
- **Falha crítica:** indisponibilidade desalinhada da realidade.

#### Persona 3 — Inês, especialista Plum (29 anos, inspetora, Porto)

- **Objetivo:** inspecionar com critério uniforme e registar um resultado honesto.
- **Contexto:** faz visitas em deslocação; trabalha a partir do telemóvel no local.
- **Necessidades:** publicar e retirar vagas, ver a casa e o contacto do anfitrião, registar pontuação e notas, confirmar que o resultado alterou o estado da casa.
- **Frustrações:** vagas reclamadas por dois anfitriões; relatórios que não produzem consequência.
- **Falha crítica:** inspeção registada que não altera o estado da propriedade.

#### Persona 4 — Rui, administrador de curadoria (41 anos, Lisboa)

- **Objetivo:** manter a coleção credível e resolver exceções.
- **Contexto:** responde a reclamações e supervisiona a qualidade; precisa de rasto de auditoria.
- **Necessidades:** métricas da plataforma, fila de inspeções, aprovação/rejeição com *override*, monitorização de reservas, ajuste de reembolso com limite superior, contagem de membros.
- **Frustrações:** decisões destrutivas acidentais; reembolso superior ao valor pago.
- **Falha crítica:** *override* sem auditoria ou acima do total da reserva.

### 2.3 Funcionalidades planeadas

| Âmbito | Funcionalidade | Estado |
| --- | --- | --- |
| Público | Página inicial editorial com narrativa do Plum Test e casas em destaque | Concluída |
| Público | Coleção pesquisável (`?q=`) e ordenável (`?sort=`) de casas aprovadas | Concluída |
| Público | Página de detalhe com relatório de inspeção, calendário e reserva imediata | Concluída |
| Público | Registo e autenticação com redirecionamento seguro (`next`) | Concluída |
| Hóspede | Portal com viagens, referências, faturas e histórico | Concluída |
| Hóspede | Cancelamento com pré-visualização de reembolso e motivo obrigatório | Concluída |
| Hóspede | Confirmação e fatura imprimível | Concluída |
| Anfitrião | Submissão de anúncio e edição de título/preço | Concluída |
| Anfitrião | Calendarização de inspeção em vaga de especialista | Concluída |
| Anfitrião | Calendário de 365 dias com preços personalizados | Concluída |
| Especialista | Publicação e retirada de vagas | Concluída |
| Especialista | Registo de pontuação e notas, com efeito automático no estado | Concluída |
| Administrador | Métricas, fila de inspeções, *override* de aprovação/rejeição | Concluída |
| Administrador | Ajuste de reembolso com limite igual ao total | Concluída |
| Transversal | Interface bilingue (EN/PT) com preferência persistida em cookie | Concluída |
| Transversal | Preços em euros, com formatação por idioma | Concluída |
| Fora de âmbito | Pagamentos reais, email transacional, *upload* de imagens, sincronização iCal | Não implementado (ver secção 8) |

### 2.4 Requisitos não funcionais

| Categoria | Requisito | Como foi tratado |
| --- | --- | --- |
| Segurança | Palavras-passe nunca em claro | bcrypt, custo 10 |
| Segurança | Sessão resistente a leitura por JavaScript | JWT HS256 em cookie `HttpOnly`, `SameSite=Lax`, `Secure` em produção, 7 dias |
| Segurança | Autorização no servidor em todas as mutações | `requireApiSession(roles)` + verificação de propriedade |
| Integridade | Nenhuma reserva parcialmente gravada | `db.batch()` atómico + índice único + *trigger* |
| Desempenho | Primeiro *paint* correto, sem *flash* de conteúdo | Renderização no servidor com o idioma lido do cookie; páginas dinâmicas |
| Usabilidade | Fluxos concluíveis sem conhecimento prévio | *Empty states* com ação primária, cotações ao vivo, mensagens de erro específicas |
| Acessibilidade | Navegação por teclado e semântica | *Skip link*, marcos, rótulos, `aria-live`, `aria-pressed`, foco visível, modal com armadilha de foco |
| Manutenção | Verificação de tipos em CI local | `npm run typecheck` sem erros |

---

## 3. Arquitetura e Tecnologias

### 3.1 Visão geral

```
┌──────────────────────────────────────────────────────────────┐
│  Navegador (React 19, componentes cliente para interação)    │
│  calendário · modais · formulários · seletor de idioma       │
└───────────────┬──────────────────────────────┬───────────────┘
                │ HTML/RSC (SSR)               │ fetch JSON
┌───────────────▼──────────────────────────────▼───────────────┐
│  Next.js 16 · App Router (Cloudflare Worker via OpenNext)    │
│  Server Components  →  leitura direta da base de dados       │
│  Route Handlers     →  validação, autorização, domínio       │
│  src/lib: auth · pricing · availability · booking-service    │
└───────────────────────────────┬──────────────────────────────┘
                                │ Prisma 6 + @prisma/adapter-d1
┌───────────────────────────────▼──────────────────────────────┐
│  Cloudflare D1 (SQLite gerido) — binding `DB`                │
│  7 tabelas · índice único de noites · trigger de noites      │
└──────────────────────────────────────────────────────────────┘
```

A arquitetura separa três responsabilidades: **apresentação** (componentes de servidor para leitura, componentes de cliente para interação), **domínio** (`src/lib`, com preços, disponibilidade, autenticação e o serviço de reservas) e **persistência** (Prisma sobre o *binding* D1). Os componentes de servidor leem a base de dados diretamente; os componentes de cliente nunca calculam preços nem decidem permissões — chamam rotas que revalidam tudo.

### 3.2 Frontend

| Tecnologia | Versão | Justificação |
| --- | --- | --- |
| **Next.js (App Router)** | 16.4.3 | Renderização no servidor por omissão, o que permite ler o cookie de idioma e a sessão antes do primeiro *paint*; *layouts* aninhados para os portais; *route handlers* no mesmo projeto, evitando um servidor API separado. |
| **React** | 19.2 | *Server Components* reduzem o JavaScript enviado ao cliente; `useTransition` permite atualizar o conteúdo do servidor sem bloquear a interface. |
| **TypeScript** | 5.7 | O modelo de dados e os estados são verificados em tempo de compilação; os estados de propriedade, reserva e inspeção são uniões de literais, o que deteta erros antes da execução. |
| **Tailwind CSS** | 3.4 | *Design system* consistente com *tokens* (cores, espaçamento, tipografia) definidos em `tailwind.config.ts`; evita folhas de estilo dispersas e mantém o CSS final pequeno. |

A escolha de renderização no servidor não é estética: como o idioma e a sessão vivem em cookies, uma aplicação apenas cliente produziria um *flash* de inglês ou de conteúdo não autenticado antes da hidratação.

### 3.3 Backend

O *backend* é composto por *route handlers* do Next.js (`src/app/api/**/route.ts`) e por módulos de domínio reutilizáveis:

| Módulo | Responsabilidade |
| --- | --- |
| `lib/auth.ts` | *Hash* e verificação de palavras-passe, emissão e validação de JWT, `getSession`, `requireUser`, `requireRole`, `requireApiSession` |
| `lib/pricing.ts` | Cotação por noite (preço base ou personalizado), taxas, total, escalões de reembolso, formatação monetária |
| `lib/availability.ts` | Projeção do calendário: interseção de noites fechadas pelo anfitrião com noites reservadas |
| `lib/booking-service.ts` | Reserva e cancelamento atómicos, geração de referência, mapeamento de conflitos para `409` |
| `lib/dates.ts` | Utilitários de datas-calendário em UTC, evitando deriva de fuso horário |
| `lib/constants.ts` | Papéis, estados e o limiar de aprovação (85) |

Justificação: concentrar as regras em módulos puros permite testá-las e reutilizá-las em páginas e rotas, e impede que a lógica financeira se duplique entre a interface e o servidor. Todas as mutações devolvem erros JSON com códigos `400/401/403/404/409`, o que torna o comportamento previsível para o cliente.

### 3.4 Base de dados

**Cloudflare D1** (SQLite gerido) foi escolhida por três motivos: é o armazenamento nativo do *runtime* de destino e não exige servidor dedicado; oferece um *binding* injetado pelo ambiente, sem credenciais no código; e expõe `batch()`, que executa várias instruções de forma atómica — precisamente o que substitui as transações interativas em falta. O acesso é feito com **Prisma 6** e o ***driver adapter* `@prisma/adapter-d1`**, com o cliente gerado no modo *Rust-free* (compilador WASM), obrigatório em Workers.

O custo desta escolha é relevante e assumido: sem transações interativas, a correção tem de ser garantida por **uma única operação atómica** e por **restrições declarativas** (índices únicos e *trigger*), e não por lógica imperativa de *read-modify-write*.

### 3.5 Autenticação e autorização

- **Palavras-passe:** bcrypt com custo 10; o *hash* nunca sai da base de dados.
- **Sessão:** JWT HS256 assinado com `AUTH_SECRET`, guardado num cookie `HttpOnly`, `SameSite=Lax`, `Secure` em produção, com validade de 7 dias.
- **Autorização:** três níveis — página (`requireUser`/`requireRole`), API (`requireApiSession(roles)`) e **propriedade do recurso** (o hóspede só cancela as suas reservas; o anfitrião só edita as suas casas; o especialista só conclui as suas inspeções; o administrador tem rotas de *override* explícitas).
- **Confidencialidade de documentos:** as páginas de confirmação e fatura autorizam o hóspede, o anfitrião da casa ou um administrador.

### 3.6 Ambiente de execução

| Ambiente | Composição | Notas |
| --- | --- | --- |
| **Desenvolvimento local** | Node.js 22.14 LTS, npm 10.9, `next dev` em `0.0.0.0:3000`; D1 emulado pelo Wrangler/Miniflare com o *binding* `DB` definido em `freebuff.wrangler.jsonc`; dados em `.wrangler/state` | Não requer Docker nem servidor de base de dados; o esquema e o *seed* são criados no primeiro pedido |
| **Produção (implementado)** | Cloudflare Workers com OpenNext; D1 gerido; `AUTH_SECRET` como segredo da plataforma; URL público indicado no cabeçalho | O adaptador empacota o *worker*, os *assets* e o cache de pré-renderização |
| **VM alternativa (laboratório)** | `lab.csmiguel.pt` — Node.js 22 com o mesmo código e `wrangler dev`/`wrangler deploy` para o D1, ou Postgres + Prisma com transações (exigiria alterações, ver 3.7) | Endereço a confirmar na entrega; a aplicação não contém credenciais nem pressupõe um domínio fixo |

**Vercel não é um destino viável** para esta arquitetura sem alterações: o código depende do *binding* `DB` do D1 e do adaptador correspondente; em Vercel seria necessário substituir a persistência e o caminho de reserva atómica.

### 3.7 Alternativas consideradas

| Alternativa | Vantagens | Porque não foi adotada |
| --- | --- | --- |
| **PostgreSQL + Prisma com transações interativas** | `SERIALIZABLE`/`SELECT … FOR UPDATE` simplificam a concorrência; ferramentas maduras | Exige um servidor de base de dados gerido (custo e operação) e afasta-se do *runtime* de destino; a atomicidade passaria a depender de transações, não de restrições |
| **Firebase / Firestore** | Sincronização em tempo real e autenticação integrada | Modelo de documentos e transações com limites; consultas relacionais (calendário por intervalo, agregações de receita) tornam-se difíceis; *vendor lock-in* elevado |
| **Supabase (Postgres + Auth + Storage)** | Solução integrada, boa DX, SQL real | Serviço adicional a operar e a proteger; o projeto pretendia demonstrar o desenho das invariantes, não a integração de um BaaS |
| **Aplicação apenas cliente (SPA) + API separada** | Separação clara de equipas | Duplicaria o servidor e perderia o benefício de SSR com sessão e idioma lidos de cookie |

---

## 4. Modelação da Base de Dados

### 4.1 Princípios

1. **Chaves primárias `cuid()`** em todas as tabelas — identificadores opacos, não sequenciais, seguros em URL.
2. **Nomes em `snake_case`** na base de dados e `camelCase` no código, com `@map`/`@@map` explícitos.
3. **Estados como `String` validada** na camada de domínio: o SQLite não tem tipo `ENUM` nativo no Prisma, pelo que a integridade é garantida por `src/lib/constants.ts` e pelos testes.
4. **Datas-calendário em UTC à meia-noite**, evitando que uma reserva "salte" de dia com o fuso horário.
5. **Dinheiro em `Decimal`**, com o total sempre recalculado no servidor.

### 4.2 Diagrama relacional

```
                    ┌─────────┐
                    │  users  │
                    │ role:   │
                    │ GUEST / │
                    │ HOST /  │
                    │ SPEC. / │
                    │ ADMIN   │
                    └────┬────┘
        host_id ┌────────┼─────────┬──────────────┐ specialist_id
                │        │         │ guest_id     │ cancelled_by
        ┌───────▼──────┐ │  ┌──────▼───────┐  ┌───▼────────────┐
        │  properties  │ │  │   bookings   │  │inspection_slots│
        └──┬────┬──────┘ │  └───┬──────┬───┘  └────────────────┘
           │    │        │      │      │
           │    │        └──────┘      │ 1
           │    │                      ▼
           │    │              ┌───────────────┐
           │    │              │ cancellations │ (booking_id UNIQUE)
           │    │              └───────────────┘
           │    │
           │    └──────────────► booking_nights (property_id, date UNIQUE)
           └───────────────────► availability_calendars (property_id, date UNIQUE)
```

### 4.3 Catálogo de tabelas

#### `users`

| Coluna | Tipo | Restrições | Descrição |
| --- | --- | --- | --- |
| `id` | TEXT | **PK**, `cuid()` | Identificador |
| `full_name` | TEXT | NOT NULL | Nome apresentado |
| `email` | TEXT | **UNIQUE**, NOT NULL | Credencial de acesso |
| `password_hash` | TEXT | NOT NULL | *Hash* bcrypt (custo 10) |
| `role` | TEXT | NOT NULL, default `GUEST` | `GUEST`, `HOST`, `SPECIALIST`, `ADMIN` |
| `created_at` | DATETIME | default `now()` | Registo |

Índices: `role`.

#### `properties`

| Coluna | Tipo | Restrições | Descrição |
| --- | --- | --- | --- |
| `id` | TEXT | **PK** | Identificador |
| `host_id` | TEXT | **FK → users.id**, `ON DELETE CASCADE` | Anfitrião proprietário |
| `title`, `location` | TEXT | NOT NULL | Identificação pública |
| `nightly_rate` | DECIMAL | NOT NULL | Preço base por noite |
| `status` | TEXT | NOT NULL, default `DRAFT` | `DRAFT`, `PENDING_INSPECTION`, `APPROVED`, `REJECTED` |
| `plum_score` | FLOAT | NULL | Pontuação da inspeção (0–100) |
| `image_url` | TEXT | NOT NULL | Fotografia curada |
| `tagline`, `description` | TEXT | default `""` | Conteúdo editorial |
| `bedrooms`, `bathrooms`, `max_guests` | INT | default 1/1/2 | Capacidade |
| `created_at` | DATETIME | default `now()` | Registo |

Índices: `status`, `host_id`.

#### `inspection_slots`

| Coluna | Tipo | Restrições | Descrição |
| --- | --- | --- | --- |
| `id` | TEXT | **PK** | Identificador |
| `specialist_id` | TEXT | **FK → users.id**, CASCADE | Especialista responsável |
| `property_id` | TEXT | **FK → properties.id**, `ON DELETE SET NULL` | Casa associada quando reclamada |
| `slot_datetime` | DATETIME | NOT NULL | Data e hora da visita |
| `status` | TEXT | default `AVAILABLE` | `AVAILABLE`, `BOOKED`, `COMPLETED`, `WITHDRAWN` |
| `report_notes` | TEXT | NULL | Notas da inspeção |
| `score` | FLOAT | NULL | Pontuação 0–100 |
| `completed_at` | DATETIME | NULL | Conclusão |
| `created_at` | DATETIME | default `now()` | Registo |

Índices: `slot_datetime`, `status`.

#### `availability_calendars`

| Coluna | Tipo | Restrições | Descrição |
| --- | --- | --- | --- |
| `id` | TEXT | **PK** | Identificador |
| `property_id` | TEXT | **FK → properties.id**, CASCADE | Casa |
| `date` | DATETIME | NOT NULL | Dia (UTC, meia-noite) |
| `is_available` | BOOLEAN | default `true` | Fechado/aberto pelo anfitrião |
| `custom_price` | DECIMAL | NULL | Preço específico desse dia |

**UNIQUE `(property_id, date)`** — impede duplicação de dias; índice composto para leitura por intervalo.

#### `bookings`

| Coluna | Tipo | Restrições | Descrição |
| --- | --- | --- | --- |
| `id` | TEXT | **PK** | Identificador |
| `reference` | TEXT | **UNIQUE** | Referência legível (`PLM-XXXXXXXX`) |
| `property_id` | TEXT | **FK → properties.id**, CASCADE | Casa reservada |
| `guest_id` | TEXT | **FK → users.id**, CASCADE | Hóspede |
| `check_in`, `check_out` | DATETIME | NOT NULL | Datas |
| `nights` | INT | NOT NULL | Número de noites |
| `nightly_subtotal` | DECIMAL | NOT NULL | Soma das noites |
| `cleaning_fee` | DECIMAL | NOT NULL | Taxa de limpeza (€180) |
| `service_fee` | DECIMAL | NOT NULL | 8% do subtotal |
| `total_price` | DECIMAL | NOT NULL | Total autoritativo |
| `status` | TEXT | default `CONFIRMED` | `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `created_at` | DATETIME | default `now()` | Registo |

Índices: `(property_id, check_in, check_out)`, `guest_id`, `status`.

#### `booking_nights`

| Coluna | Tipo | Restrições | Descrição |
| --- | --- | --- | --- |
| `id` | TEXT | **PK** | Identificador |
| `booking_id` | TEXT | **FK → bookings.id**, CASCADE | Reserva |
| `property_id` | TEXT | **FK → properties.id**, CASCADE | Casa (desnormalizada para o índice) |
| `date` | DATETIME | NOT NULL | Noite ocupada |

**UNIQUE `(property_id, date)`** — a garantia de que uma noite pertence a, no máximo, uma reserva. Índice em `booking_id`.

#### `cancellations`

| Coluna | Tipo | Restrições | Descrição |
| --- | --- | --- | --- |
| `id` | TEXT | **PK** | Identificador |
| `booking_id` | TEXT | **UNIQUE**, **FK → bookings.id**, CASCADE | Reserva cancelada (1:1) |
| `cancelled_by` | TEXT | **FK → users.id**, CASCADE | Autor |
| `reason` | TEXT | NOT NULL | Motivo (mínimo 10 caracteres na interface) |
| `refund_amount` | DECIMAL | NOT NULL | Valor a devolver |
| `refund_percent` | INT | NOT NULL | 100, 50 ou 0 |
| `admin_override` | BOOLEAN | default `false` | Ajuste manual |
| `created_at` | DATETIME | default `now()` | Registo |

### 4.4 Relações e cardinalidade

| Relação | Cardinalidade | Regra de integridade |
| --- | --- | --- |
| `users` (HOST) → `properties` | 1 : N | `host_id` obrigatório; apagar o utilizador apaga as casas |
| `users` (GUEST) → `bookings` | 1 : N | `guest_id` obrigatório |
| `users` (SPECIALIST) → `inspection_slots` | 1 : N | `specialist_id` obrigatório |
| `properties` → `inspection_slots` | 1 : N | `property_id` opcional (vaga livre); `SET NULL` se a casa for removida |
| `properties` → `availability_calendars` | 1 : N | Único por `(property_id, date)` |
| `properties` → `bookings` | 1 : N | CASCADE |
| `properties` → `booking_nights` | 1 : N | Parte do índice único de ocupação |
| `bookings` → `cancellations` | 1 : 1 | `booking_id` único: um segundo cancelamento falha |
| `users` → `cancellations` | 1 : N | `cancelled_by` para auditoria |

### 4.5 Regras codificadas no esquema

- **Ocupação única:** `booking_nights (property_id, date)` único é a decisão final sobre quem ganha a corrida; a inserção é a reivindicação, não uma leitura prévia.
- **Noites fechadas:** o *trigger* `booking_nights_closed_guard` rejeita a inserção de uma noite marcada como indisponível pelo anfitrião.
- **Cancelamento único:** `cancellations.booking_id` único devolve `409` a uma segunda tentativa.
- **Coerência de remoção:** `CASCADE` nas dependências de propriedade e reserva; `SET NULL` na vaga de inspeção, para preservar o histórico do especialista.

### 4.6 Ciclo de vida dos dados

O D1 gerido começa vazio e a plataforma não expõe SQL arbitrário ao autor do *deploy*. Por isso, o *worker* inicializa-se a si próprio no primeiro pedido (`src/lib/d1-bootstrap.ts`):

1. Lê o marcador `plum_meta` — uma leitura indexada nos *isolates* seguintes.
2. Cria tabelas, índices e o *trigger* com `CREATE … IF NOT EXISTS`.
3. Carrega `SEED_STATEMENTS` se `users` estiver vazia; todas as instruções são `INSERT OR IGNORE`, pelo que arranques frios concorrentes são inofensivos.
4. Grava a versão do *seed* no marcador.

O conjunto de demonstração é escrito em `prisma/seed.mjs` sobre um ficheiro SQLite local e exportado para SQL do D1 (`scripts/export-d1-seed.mjs` → `src/lib/d1-seed-sql.ts`). Contém 9 utilizadores, 13 casas (9 aprovadas, 2 por inspecionar, 1 rejeitada, 1 rascunho), 7 reservas (duas canceladas), 150 dias de calendário por casa e 21 vagas de inspeção. Alterações ao esquema exigem atualizar `schema.prisma`, replicar o DDL em `d1-bootstrap.ts` e incrementar `SEED_VERSION`.

---

## 5. Interface e UX/UI

### 5.1 Direção de design

A interface procura traduzir "curadoria" em contenção visual: muito espaço branco, tipografia serifada nos títulos e uma paleta reduzida.

| Elemento | Decisão |
| --- | --- |
| Paleta | Tinta carvão `#16130E`, creme `#FAF7F0`, papel `#FFFDF8`, ouro antigo `#A98554`, linha `#E4DCCB` |
| Semântica de cor | Verde-musgo para aprovações, âmbar para processos em curso, vinho para rejeições e ações destrutivas |
| Tipografia | Fraunces (títulos) + Inter (interface), com alternativas do sistema |
| Estados | Distintivos com texto, nunca apenas cor — "Plum Approved", "Inspection scheduled", "Not approved" |
| Densidade | Cartões de casa com fotografia, localização, preço por noite e pontuação; tabelas nos portais |

### 5.2 Navegação e arquitetura de informação

A estrutura segue a hierarquia de decisão do utilizador: **descobrir → avaliar → reservar → gerir**. O cabeçalho mantém apenas três ações (coleção, entrar/portal, idioma), evitando menus profundos. Os portais usam um *layout* único com guarda de autenticação e navegação específica do perfil, pelo que a troca de perfil não altera o modelo mental.

Decisões relevantes de navegação:

- **Calendário como controlo principal** na página da casa: a seleção de datas é o gesto central, não um formulário separado.
- **Cotação ao vivo** junto ao botão de reserva, com subtotal, limpeza, taxa e total, atualizada a cada seleção.
- **Estados vazios instrutivos** nos portais ("Explorar a coleção", "Submeter a primeira casa", "Publicar uma vaga"), em vez de tabelas vazias.
- **Mensagens de conflito específicas** (`409`) que dizem o que fazer: "datas acabaram de ser reservadas", "noite fechada pelo anfitrião", "já cancelada".

### 5.3 Acessibilidade

Foram implementados: *skip link* para o conteúdo; marcos semânticos (`header`, `nav`, `main`, `footer`); rótulos explícitos em todos os campos; regiões de erro com `role="alert"`; atualizações de cotação com `aria-live`; datas do calendário com `aria-pressed`; foco visível; modal de cancelamento com armadilha de foco e fecho por `Escape`. O desenho foi orientado pelos critérios WCAG 2.2 AA [11], mas **não foi concluída uma auditoria de conformidade nem testes com leitores de ecrã** — limitação assumida na secção 8.

### 5.4 Melhorias introduzidas após testes

As alterações abaixo resultaram de percursos de verificação e de revisão heurística (não de um estudo formal com participantes externos):

| Observação | Alteração | Efeito |
| --- | --- | --- |
| O total só era visível após confirmar | Cotação ao vivo antes do botão; botão inativo até o intervalo estar completo | Elimina surpresas e abandonos por custo desconhecido |
| Datas indisponíveis sem explicação | Legenda (selecionado / a sua estadia / indisponível), riscado nas bloqueadas e ponto dourado nos preços personalizados | Distingue fecho do anfitrião, reserva e preço especial |
| Cancelamento sentido como risco | Modal com pré-visualização do reembolso, percentagem, escalões e motivo obrigatório | Consentimento informado e registo auditável |
| Rejeição administrativa num único clique | Confirmação em dois passos ("Sim, rejeitar" / "Cancelar") | Evita decisões destrutivas acidentais |
| Falha genérica quando outra pessoa ganhava a corrida | Mapeamento de conflitos em mensagens `409` específicas | O utilizador sabe se deve tentar outra data ou contactar apoio |
| Portais vazios pareciam avariados | *Empty states* com ação primária | Próximo passo óbvio para novos utilizadores |
| Símbolo de libra sobrevivia em texto e documentação | Formatação centralizada em `eur()`, aviso "Agora em euros" e varrimento de `£`/`GBP` | Consistência monetária em toda a aplicação |
| Tabelas longas transbordavam em ecrãs estreitos | Contentores com deslocamento horizontal e colunas prioritárias | Leitura possível a 390 px de largura |
| Seletor de idioma podia ficar inerte após uma falha de escrita do cookie | Estado otimista substituído por confirmação do servidor, reversão e anúncio `aria-live` | O controlo nunca aparenta um estado que o servidor não aceitou |

### 5.5 Multilinguismo e moeda

O idioma vive no cookie `plum_locale` (`en` ou `pt`), lido no servidor, pelo que a página já é entregue no idioma correto. O dicionário português cobre a totalidade das chaves usadas (mais de 300) e recorre ao inglês apenas como rede de segurança. Os preços são formatados por locale (`€1,240` em inglês, `1240 €` em português). Os portais de anfitrião, especialista e administrador mantêm os rótulos técnicos em inglês, decisão consciente para não duplicar vocabulário operacional.

---

## 6. Uso de IA de Código Aberto

### 6.1 Ferramentas e modelos utilizados

| Ferramenta | Modelo / acesso | Utilização | Limites observados |
| --- | --- | --- | --- |
| Agente de programação Codebuff ("Buffy") | Interface de agente da Freebuff com um modelo de linguagem *frontier* selecionado pela plataforma. O identificador exato não é exposto na sessão, pelo que este relatório não reivindica uma versão específica. Não foi usado modelo afinado nem alojado localmente. | Implementação, refatoração, revisão de esquema e SQL, depuração, geração de dados de demonstração, revisão de acessibilidade, rascunhos de documentação | Confiante mas por vezes errado sobre limites do *runtime*; exigiu verificação na documentação de D1/Prisma e na aplicação em execução |
| Agente de pesquisa web | Pesquisa e leitura de páginas públicas | Contexto da empresa, fundação, financiamento, critérios do Plum Test, fontes | Páginas podem estar desatualizadas ou protegidas; números cruzados e tratados como contexto |
| Navegador de pré-visualização (Chromium) | Ferramenta integrada | Inspeção da aplicação renderizada e verificação da versão publicada | Não substitui teste em dispositivo real nem com tecnologia de apoio |
| Guião de capturas Playwright | Automação de navegador *open source* (não é modelo de IA) | Captura determinística das imagens do manual e da apresentação | Necessitou de repetições por hidratação do cliente |
| IA na aplicação | Nenhuma | Não existe chamada a modelos em execução; não há chaves de API de IA no código | Pontuações e recomendações são baseadas em regras, para auditabilidade |

### 6.2 Modelos de pesos abertos: o que foi considerado

O enunciado previa modelos como **Llama, DeepSeek ou Mistral**. Neste projeto, o trabalho foi conduzido com um agente sobre modelo *frontier* alojado, e **não** com um modelo de pesos abertos executado localmente. A decisão foi pragmática: o ambiente de desenvolvimento não dispunha de GPU dedicada, e as tarefas dominantes (compatibilidade D1/Prisma, SQL, revisão de tipos) beneficiam de modelos maiores.

A alternativa foi avaliada e é viável, com custos claros:

| Opção *open weights* | Como se integraria | Compromisso |
| --- | --- | --- |
| **Llama 3.x (8B/70B)** | `Ollama` local + extensão de chat no editor, ou `Continue.dev` | 8B é suficiente para completar código e explicar trechos; insuficiente para decidir limites de D1 sem verificação |
| **DeepSeek-Coder / V3** | `Aider` ou servidor local compatível com a API OpenAI | Forte em código e SQL; requisitos de memória elevados para versões maiores |
| **Mistral / Codestral** | `Aider`, `Continue.dev`, ou endpoint próprio | Bom equilíbrio latência/qualidade; contexto menor exige dividir tarefas |

Em qualquer destas opções, o *workflow* teria de manter o mesmo princípio: **o modelo propõe, a documentação e os testes decidem**. Um modelo local reduz a exposição de código a terceiros, mas não elimina a necessidade de rever SQL, permissões e cálculos financeiros.

### 6.3 Três exemplos práticos de prompts

#### Exemplo 1 — Esquema relacional e arranque do D1

> **Prompt:** "Desenha o esquema Prisma para uma plataforma de curadoria de casas com utilizadores em quatro papéis (hóspede, anfitrião, especialista, administrador), casas com estado de aprovação e pontuação de inspeção, vagas de inspeção, calendário de disponibilidade por dia, reservas e cancelamentos. Usa SQLite/D1, chaves `cuid()`, nomes de tabela em `snake_case` e índices para as consultas de calendário e de ocupação. Gera também o DDL idempotente que cria estas tabelas numa base de dados D1 vazia."

**Contribuição:** produziu a primeira versão das sete tabelas, dos índices e do carregador de *seed* idempotente, bem como a estrutura de `d1-bootstrap.ts`. **Correção necessária:** o rascunho usava enums nativos e transações interativas, incompatíveis com SQLite/D1; foram substituídos por estados em `String` validados em `lib/constants.ts` e por um `batch` atómico.

#### Exemplo 2 — Correção da reserva em concorrência

> **Prompt:** "Nesta aplicação, dois hóspedes podem tentar reservar as mesmas noites ao mesmo tempo e o D1 não suporta transações interativas. Propõe um desenho que garanta que exatamente um pedido é aceite e que nenhuma reserva parcial fica gravada. Explica porque funciona e que erros devem ser devolvidos ao cliente."

**Contribuição:** originou o *ledger* de noites (`booking_nights`) com índice único `(property_id, date)`, o *trigger* de noites fechadas e a sequência de `db.batch()` que grava reserva + noites numa só operação. **Correção necessária:** a primeira proposta lia a disponibilidade e só depois inseria — uma corrida clássica; foi substituída pela ideia de que **a inserção é a reivindicação** e o índice único decide o vencedor.

#### Exemplo 3 — Cancelamento, reembolso e reposição do calendário

> **Prompt:** "Implementa o cancelamento de uma reserva: calcula o reembolso segundo três escalões (100% a mais de 14 dias do check-in, 50% entre 7 e 14, 0% abaixo de 7), grava o cancelamento com motivo e percentagem, liberta todas as noites no calendário e garante que um segundo cancelamento devolve 409. Mostra o código do serviço e o diálogo de confirmação com pré-visualização do valor."

**Contribuição:** gerou os escalões em `lib/pricing.ts`, o *batch* de cancelamento (atualizar reserva, inserir cancelamento, apagar noites, reabrir calendário) e o modal com pré-visualização e motivo obrigatório. **Correção necessária:** os valores foram verificados manualmente e o limite do *override* administrativo passou a ser o total pago, para impedir reembolsos superiores ao valor da reserva.

### 6.4 Erros da IA e forma de deteção

| Sugestão da IA | Porque estava errada | Correção |
| --- | --- | --- |
| Enums Prisma + transações interativas | SQLite não tem enums no Prisma; D1 não suporta transações interativas e o adaptador executa instruções individualmente | Estados em `String` validados; `batch` bruto com índice único e *trigger* |
| Ler disponibilidade e depois inserir | Duas leituras podiam passar e ambas inserir, vendendo a mesma noite | A inserção é a reivindicação; o índice único decide e o *batch* reverte o perdedor |
| Rejeição administrativa num clique | Demasiado fácil remover uma casa por engano | Confirmação explícita em dois passos |
| Linguagem de "pontuação de 150 pontos" | A inspeção tem 150 verificações, mas a pontuação registada é de 0 a 100 | Redação consistente: 150 verificações agregadas numa pontuação 0–100, aprovação a partir de 85 |
| Alteração de moeda limitada ao formatador | Sobreviviam `£` em texto e documentação | Varrimento global de `£`/`GBP`, aviso de moeda e capturas refeitas |
| Estado otimista no seletor de idioma | Marcava o idioma como aplicado antes de saber se o cookie foi gravado e ignorava erros, deixando o botão inerte | Confirmação da resposta, reversão em falha e anúncio `aria-live` |

### 6.5 Política de utilização responsável

1. **Verificação obrigatória:** nenhuma sugestão foi aceite sem confronto com a documentação oficial [7][8][9][10] e com a aplicação em execução.
2. **Revisão humana do domínio:** preços, reembolsos e permissões foram recalculados à mão e testados por HTTP.
3. **Segredos:** nenhuma chave, *token* ou credencial foi colocada em prompts, código, histórico ou documentação.
4. **Autoria:** o código gerado foi lido, adaptado e integrado; o relatório distingue explicitamente o que foi proposto pela IA e o que foi corrigido.

---

## 7. Testes e Qualidade

### 7.1 Estratégia

Os testes foram **caixa-negra e orientados à integração**: a aplicação foi executada localmente contra uma base de dados D1 criada de raiz e exercitada por HTTP, com o navegador usado para verificação visual e de interação. As prioridades foram os pontos onde uma demonstração pode parecer correta e comportar-se mal: concorrência, fronteiras de autorização, dinheiro e datas, máquina de estados da inspeção e o *batch* de cancelamento.

**Não existe, atualmente, uma suite automatizada no repositório.** Esta é uma limitação declarada, não uma alegação de cobertura. A verificação estática limita-se a `npm run typecheck` e ao `npm run build` (que inclui `prisma generate`).

### 7.2 Testes de integração

| # | Cenário | Resultado esperado | Observado | Estado |
| --- | --- | --- | --- | --- |
| 1 | Hóspede autentica-se | Cookie de sessão; portal do hóspede com as suas viagens | Redirecionamento para `/dashboard/guest`, apenas reservas próprias | Passa |
| 2 | Credenciais inválidas | `401` sem revelar qual o campo errado | Mensagem genérica, sem sessão | Passa |
| 3 | Hóspede abre o portal de administração | Recusa, sem dados | Guarda de perfil bloqueia; sem fuga de dados | Passa |
| 4 | Duas reservas simultâneas para as mesmas datas | Um `201`, um `409`, uma reserva e um *ledger* | Uma confirmação, um conflito amigável, uma linha | Passa |
| 5 | Reserva de noite fechada pelo anfitrião | `409`, nada gravado | Mensagem "fechada pelo anfitrião"; *batch* revertido | Passa |
| 6 | Check-in no passado ou intervalo inválido | `400` específico | Rejeitado antes de qualquer escrita | Passa |
| 7 | Manipulação do total no cliente | Servidor ignora o valor recebido | Total gravado igual à cotação do servidor | Passa |
| 8 | Outro hóspede abre confirmação/fatura alheia | Recusa | `403`/`404`; proprietário vê o documento | Passa |
| 9 | Cancelamento a mais de 14 dias | 100% e noites libertadas | Reembolso igual ao total; calendário reaberto | Passa |
| 10 | Cancelamento entre 7 e 14 dias | 50% e noites libertadas | Metade registada; calendário reaberto | Passa |
| 11 | Cancelamento a menos de 7 dias | 0% e noites libertadas | Zero registado; calendário reaberto | Passa |
| 12 | Cancelar duas vezes | `409`, um registo | Rejeitado pelo índice único de `booking_id` | Passa |
| 13 | Anfitrião fecha/abre noite e define preço | Calendário persistido; cotação usa o preço | Guardado; noite reservada não reabre | Passa |
| 14 | Anfitrião edita casa de outro | `403`, sem alteração | Verificação de propriedade rejeita | Passa |
| 15 | Especialista conclui inspeção com 92 / 70 | Aprovação automática / rejeição | Estado da casa alterado em ambos os casos | Passa |
| 16 | Administrador ajusta reembolso acima do total | Recusa | Limitado ao total da reserva | Passa |
| 17 | Idioma alternado no cabeçalho | Página inteira no novo idioma, preferência persistida | `POST /api/locale` 200, cookie e `html lang` corretos em `/`, `/properties`, detalhe, 404, login, registo e portal autenticado | Passa |
| 18 | Falha simulada na escrita do idioma | Reversão do estado e aviso | Pill reverte, botões mantêm-se ativos, mensagem anunciada; nova tentativa funciona | Passa |

### 7.3 Prova de atomicidade

O cenário 4 é o teste central do projeto. Duas requisições concorrentes para o mesmo intervalo foram disparadas contra a mesma base de dados; o resultado foi **uma** resposta `201`, **uma** resposta `409` e **uma única** linha em `bookings` e em `booking_nights`. O teste foi repetido em `workerd` local com D1 criado de raiz e, posteriormente, na versão publicada. A conclusão é que a garantia não depende do tempo de resposta nem da ordem de chegada, mas da restrição `UNIQUE (property_id, date)`.

### 7.4 Testes de usabilidade

Não foi realizado um estudo formal com participantes externos nem medições (tempo de tarefa, SUS, taxa de erro). O que existiu foi **revisão heurística e percursos guiados** durante o desenvolvimento, com registo das observações que geraram alterações (secção 5.4). Esta é uma lacuna metodológica a colmatar: um teste com 5 a 8 participantes por persona, com tarefas definidas (reservar, cancelar, publicar casa, agendar inspeção), produziria evidência quantitative que o projeto atualmente não tem.

### 7.5 Dificuldades técnicas e soluções

| Dificuldade | Impacto | Solução |
| --- | --- | --- |
| D1 sem transações interativas e adaptador Prisma que executa instruções isoladamente | Risco de reservas parciais e duplas | `db.batch()` atómico + índice único + *trigger*; a inserção é a reivindicação |
| Ausência de `ENUM` no Prisma para SQLite | Estados inválidos possíveis | `String` + validação central em `lib/constants.ts` + uniões de literais em TypeScript |
| Fuso horário a deslocar reservas | Reservas de um dia para o outro | Datas-calendário normalizadas para meia-noite UTC (`lib/dates.ts`) |
| Base de dados gerida começa vazia e sem SQL manual | Aplicação sem dados após *deploy* | *Bootstrap* idempotente no primeiro pedido, com marcador e `INSERT OR IGNORE` |
| Configuração de D1 local com estado corrompido | Erros `internal error; reference …` a bloquear páginas | Diagnóstico do *binding* local; documentação do procedimento de limpeza de `.wrangler/` e trabalho continuado na configuração de desenvolvimento |
| Adaptador OpenNext exigir manifesto de *build* | *Deploy* falhado por artefacto em falta | Preparação do projeto com OpenNext antes do *deploy*; validação do manifesto |
| Ciclo de *hot reload* provocado por escrita de log dentro do projeto | Recompilação contínua e instabilidade | *Logs* redirecionados para fora da árvore do projeto |
| Hidratação tardia em capturas automatizadas | Capturas de ecrã inconsistentes | Esperas explícitas por elementos e repetição do passo |
| Seletor de idioma inerte após falha de escrita | Utilizador sem forma de recuperar sem recarregar | Confirmação da resposta HTTP, reversão do estado otimista e anúncio `aria-live` |
| Resíduos de moeda após migração GBP → EUR | Inconsistência entre interface e documentação | Formatação centralizada, aviso de moeda e varrimento global do código e dos textos |

### 7.6 Ameaças à validade

- **Ambiente:** os testes correram em D1 local e no *runtime* de produção, mas não em múltiplos dispositivos reais nem em redes lentas.
- **Dados:** o conjunto é sintético e ancorado à data de geração; volumes reais alterariam o desempenho das consultas de calendário.
- **Observador:** a verificação foi feita pelo autor, sem dupla validação independente.
- **Cobertura:** ausência de testes automatizados significa que regressões futuras não são detetadas por *CI*.
- **Publicação:** a versão publicada pode estar desatualizada em relação ao código local; a fonte de verdade é o repositório.

---

## 8. Conclusão e Trabalho Futuro

### 8.1 Funcionalidades concluídas

| Área | Estado |
| --- | --- |
| Site público (início, coleção com pesquisa e ordenação, detalhe com calendário) | Concluído |
| Autenticação, registo e autorização por perfil e por recurso | Concluído |
| Reserva atómica com prevenção de duplicação ao nível da base de dados | Concluído |
| Preços autoritativos no servidor, em euros, com taxa de limpeza e serviço | Concluído |
| Cancelamento com três escalões de reembolso e reposição do calendário | Concluído |
| Portal do hóspede com fatura imprimível e histórico | Concluído |
| Portal do anfitrião com calendário de 365 dias e preços personalizados | Concluído |
| Portal do especialista com vagas e registo de inspeção | Concluído |
| Portal do administrador com métricas, moderação e *override* de reembolso | Concluído |
| Interface bilingue EN/PT com preferência persistida | Concluído |
| *Bootstrap* automático de esquema e dados no D1 | Concluído |
| Documentação (relatório, manual, apresentação, README) | Concluído |

O projeto atinge o objetivo central: **converter uma promessa de curadoria numa máquina de estados auditável**, com garantias de integridade que não dependem da boa-fé do cliente nem da ordem de chegada dos pedidos.

### 8.2 Limitações atuais

1. **Pagamentos e email simulados** — nenhum cartão é cobrado, nenhuma mensagem é enviada; os reembolsos são registos, não movimentos financeiros.
2. **Fatura por impressão** — o download usa o diálogo de impressão do navegador; não há PDF gerado no servidor.
3. **Fotografia de *stock*** — o anfitrião escolhe de uma coleção curada; não existe *upload*, validação nem otimização de imagens.
4. **Sem tarefas em segundo plano** — lembretes, reconciliação de pagamentos e transições agendadas estão fora de âmbito.
5. **Credenciais de demonstração** — palavras-passe simples e públicas; contas de especialista e administrador não são de autosserviço.
6. **Sem testes automatizados nem limitação de taxa** — a matriz de testes é manual; *endpoints* de autenticação e reserva não estão protegidos contra abuso.
7. **Moeda ao nível de apresentação** — o euro é a única moeda, sem fonte de câmbios, taxas históricas ou motor de IVA.
8. **Acessibilidade não auditada** — suporte de teclado e semântica implementados, mas sem auditoria WCAG nem testes com tecnologia de apoio.
9. **Estudo de usabilidade incompleto** — observações heurísticas, sem participantes externos nem métricas.
10. **Ambiente local de D1 com problemas de configuração** — páginas dependentes de dados podem falhar localmente até o *binding* ser corrigido; a versão publicada funciona.

### 8.3 Trabalho futuro

| Prioridade | Melhoria | Impacto | Esforço |
| --- | --- | --- | --- |
| Alta | **Stripe Payment Intents** com confirmação por *webhook* e reembolsos idempotentes reconciliados com o registo de cancelamento | Fecha o ciclo financeiro real | Médio-alto |
| Alta | **Testes end-to-end com Playwright em CI**, incluindo o teste de reserva paralela | Impede regressões na invariante mais crítica | Médio |
| Alta | **Email transacional** (confirmação, cancelamento, resultado de inspeção, lembretes) | Fecha a comunicação com o utilizador | Baixo-médio |
| Média | ***Upload* direto para R2** com validação, variantes responsivas e moderação | Substitui fotografia de *stock* | Médio |
| Média | **Auditoria de acessibilidade WCAG 2.2 AA** com leitor de ecrã e `axe` em CI | Inclusão e conformidade | Médio |
| Média | **Limitação de taxa e proteção contra bots** em autenticação e reserva | Reduz abuso e *scraping* | Baixo |
| Média | **Sincronização iCal** (importação/exportação, duas vias com Airbnb/Vrbo) | Elimina duplas reservas externas | Alto |
| Baixa | **Registo de auditoria** de *overrides* administrativos, exportações CSV e extratos de pagamento | Operação e disputas | Médio |
| Baixa | **Moeda e fiscalidade configuráveis** com fonte de câmbios e regras de IVA por jurisdição | Expansão internacional | Alto |
| Baixa | **Checklists de inspeção** estruturadas com evidência fotográfica e reagendamento | Qualidade da curadoria | Alto |
| Baixa | **Aplicação móvel** (PWA ou *wrapper* nativo) com notificações e modo offline para inspeções no local | Conveniência para especialistas | Alto |

### 8.4 Considerações finais

O contributo principal deste trabalho não está no número de ecrãs, mas na demonstração de que **as regras de negócio podem ser a arquitetura**. A decisão de modelar a ocupação como um *ledger* de noites com restrição única resolveu, de uma vez, o problema de concorrência, a libertação de datas no cancelamento e a auditabilidade do que foi vendido. A decisão de calcular todos os valores no servidor tornou a interface uma consequência dos dados, e não uma fonte de verdade paralela.

O projeto deixa também um conjunto de limitações honestas — pagamentos simulados, ausência de testes automatizados, acessibilidade por auditar — que definem um caminho claro e priorizado. A aplicação está funcional, publicada e documentada; o que falta é operação real, não desenho.

---

## 9. Referências

[1] The Plum Guide. *Our Story*. <https://www.plumguide.com/our-story> (consultado em novembro de 2026).

[2] Wikipedia. *The Plum Guide*. <https://en.wikipedia.org/wiki/The_Plum_Guide> (consultado em novembro de 2026).

[3] TechCrunch (2019). *The Plum Guide raises $18.5M to expand its vacation homes for the elite service*. <https://techcrunch.com/2019/03/20/the-plum-guide-raises-18-5m-to-expand-its-vacation-homes-for-the-elite-service/>

[4] PhocusWire. *Startup Stage: Plum Guide*. <https://www.phocuswire.com/Startup-Stage-Plum-Guide>

[5] Business Insider (2019). *Plum Guide wants to be the Michelin Guide of home rentals*. <https://www.businessinsider.com/plum-guide-wants-to-be-michelin-guide-of-home-rentals-2019-7>

[6] The Plum Guide. *Site público*. <https://www.plumguide.com/>

[7] Vercel. *Next.js Documentation — App Router*. <https://nextjs.org/docs/app>

[8] Prisma. *Cloudflare D1*. <https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1>

[9] Cloudflare. *D1 Worker API*. <https://developers.cloudflare.com/d1/worker-api/d1-database/>

[10] Cloudflare. *Workers Documentation*. <https://developers.cloudflare.com/workers/>

[11] W3C. *Web Content Accessibility Guidelines (WCAG) 2.2*. <https://www.w3.org/TR/WCAG22/>

[12] OWASP. *Application Security Verification Standard*. <https://owasp.org/www-project-application-security-verification-standard/>

---

## 10. Anexos

### Anexo A — Contas de demonstração

| Perfil | Email | Palavra-passe |
| --- | --- | --- |
| Hóspede | `guest@plumguide.com` | `Guest123!` |
| Anfitrião | `host@plumguide.com` | `Host123!` |
| Especialista | `specialist@plumguide.com` | `Specialist123!` |
| Administrador | `admin@plumguide.com` | `Admin123!` |

Contas adicionais: anfitriões `rafael@plumguide.com` e `ingrid@plumguide.com`, hóspede `noah@example.com`, especialistas `julian@plumguide.com` e `sofia@plumguide.com`.

### Anexo B — Rotas principais

| Rota | Função |
| --- | --- |
| `/` | Página inicial editorial |
| `/properties` | Coleção aprovada, com `?q=` e `?sort=` |
| `/properties/[id]` | Detalhe, relatório de inspeção e calendário |
| `/bookings/[id]/confirmation` | Confirmação e resumo de reembolso |
| `/bookings/[id]/invoice` | Fatura imprimível |
| `/login`, `/signup` | Autenticação e registo |
| `/dashboard/{guest,host,specialist,admin}` | Portais por perfil |

### Anexo C — Superfície da API

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/auth/signup` | Público | Criar hóspede ou anfitrião |
| `POST /api/auth/login` | Público | Iniciar sessão |
| `POST /api/auth/logout` | Sessão | Terminar sessão |
| `POST /api/bookings` | Sessão | Reserva transacional |
| `POST /api/bookings/[id]/cancel` | Proprietário ou administrador | Cancelar, reembolsar e libertar noites |
| `POST /api/properties` | Anfitrião | Submeter rascunho |
| `PATCH /api/properties/[id]` | Proprietário ou administrador | Atualizar título e preço |
| `POST /api/properties/[id]/availability` | Proprietário ou administrador | Abrir/fechar noite, preço personalizado |
| `POST /api/properties/[id]/inspection-request` | Proprietário | Reclamar vaga de inspeção |
| `POST /api/specialist/slots` | Especialista | Publicar vaga |
| `DELETE /api/specialist/slots/[id]` | Proprietário | Retirar vaga não reclamada |
| `POST /api/specialist/inspections/[id]` | Proprietário ou administrador | Registar pontuação e notas |
| `POST /api/admin/properties/[id]/moderate` | Administrador | Aprovar ou rejeitar |
| `POST /api/admin/cancellations/[id]/override` | Administrador | Ajustar reembolso |
| `POST /api/locale` | Público | Gravar preferência de idioma |

### Anexo D — Comandos

```bash
git clone https://github.com/kitokaesu/plum-guide-curation.git
cd plum-guide-curation
npm install
cp .env.example .env
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

### Anexo E — Artefactos do projeto

| Artefacto | Localização |
| --- | --- |
| Relatório (este documento) | `docs/relatorio-projeto.md` |
| Relatório em inglês (versão anterior) | `docs/report.html` |
| Manual do utilizador | `docs/user-guide.html` |
| Apresentação | `docs/presentation.html` |
| README técnico | `README.md` |

### Anexo F — Exportação para PDF

O documento está em Markdown, pelo que pode ser convertido sem perda de tabelas:

```bash
pandoc docs/relatorio-projeto.md -o relatorio.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=2.5cm \
  -V lang=pt-PT \
  -V mainfont="Inter" \
  --toc --number-sections
```

Alternativas: extensão *Markdown PDF* no VS Code, ou abrir a pré-visualização de Markdown e imprimir para PDF. As tabelas largas devem ser impressas em A4 horizontal ou com margens de 2 cm.
