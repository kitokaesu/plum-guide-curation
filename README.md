# Plum Guide — Curadoria, Inspeções e Reservas

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020?logo=cloudflare&logoColor=white)

Plataforma completa que reproduz a operação por trás da curadoria da Plum Guide — "as melhores 3% das casas". Inclui o **Plum Test** (inspeção feita por especialistas), gestão de disponibilidade pelos anfitriões, reservas atómicas de hóspedes, cancelamentos com reembolso automático e quatro portais com controlo de acessos por perfil.

A aplicação é uma demonstração funcional: pagamentos e emails são simulados, mas todas as regras de negócio — pontuação mínima, preços, hierarquia de reembolsos e exclusão de reservas sobrepostas — são aplicadas no servidor e garantidas pela base de dados.

---

## 1. Descrição Geral

### Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS 3 (design system próprio) |
| ORM | Prisma 6 com *driver adapter* D1 |
| Base de dados | Cloudflare D1 (SQLite gerido) — localmente via Wrangler/Miniflare |
| Autenticação | `bcryptjs` (cost 10) + JWT HS256 (`jose`) em cookie HTTP-only |
| Deploy | Cloudflare Workers através de OpenNext |

### Funcionalidades principais

| Perfil | Portal | Capacidades |
| --- | --- | --- |
| **Hóspede** | `/dashboard/guest` | Viagens futuras, referências de reserva, faturas imprimíveis, cancelamento com pré-visualização do reembolso, histórico |
| **Anfitrião** | `/dashboard/host` | Submeter casas, agendar Plum Test com um especialista disponível, calendário de 365 dias com preços personalizados, editar anúncio, acompanhar receita |
| **Especialista** | `/dashboard/specialist` | Publicar/retirar vagas de inspeção, consultar inspeções atribuídas, registar pontuação e notas |
| **Administrador** | `/dashboard/admin` | Métricas da plataforma, fila de inspeções com aprovação/rejeição, monitorização de reservas, ajuste manual de reembolsos |

**Site público:** página inicial editorial, coleção pesquisável de casas aprovadas, páginas de detalhe com calendário de disponibilidade e reserva imediata, autenticação, confirmação e fatura.

### Regras de negócio implementadas

- **Plum Test:** pontuação de 0 a 100; **≥ 85 aprova automaticamente**, abaixo disso a casa é rejeitada e encaminhada para a equipa de curadoria. O administrador pode inverter qualquer resultado.
- **Disponibilidade:** uma noite está indisponível se o anfitrião a fechou **ou** se existe reserva confirmada que a cobre.
- **Reservas:** a reserva e o registo de noites ocupadas são escritos num único `batch` atómico do D1. Um índice único `(property_id, date)` garante que duas reservas simultâneas para as mesmas datas produzem **exatamente uma** confirmação e um `409` amigável.
- **Preços:** soma das noites (preço base ou personalizado) **+ €180 de limpeza + 8% de taxa de serviço**. O servidor recalcula e guarda sempre o total autoritativo; todos os valores são apresentados em euros.
- **Cancelamentos:** reembolso de 100% a mais de 14 dias do *check-in*, 50% entre 7 e 14 dias, 0% abaixo de 7 dias. As noites são devolvidas ao calendário na mesma operação atómica.
- **Idiomas:** inglês e português europeu, alternáveis no cabeçalho (`EN | PT`). A preferência fica no cookie `plum_locale`, pelo que o servidor já renderiza o idioma correto no primeiro *paint*.

---

## 2. Links de Acesso

| Ambiente | Endereço |
| --- | --- |
| **Aplicação online** (Cloudflare Workers + D1) | <https://site-ef110a907aa543e89a6159ea2358c1de.freebuff.page> |
| **Servidor da unidade curricular** (VM) | `http://lab.csmiguel.pt` *(substituir pelo endereço/porta efetivamente usados na entrega)* |
| **Repositório GitHub** | <https://github.com/kitokaesu/plum-guide-curation> |

A versão publicada corre em Cloudflare Workers com uma base de dados D1 gerida. O esquema e os dados de demonstração são criados automaticamente no primeiro pedido, pelo que a aplicação fica utilizável sem qualquer passo manual de base de dados.

**Contas de demonstração**

| Perfil | Email | Palavra-passe |
| --- | --- | --- |
| Hóspede | `guest@plumguide.com` | `Guest123!` |
| Anfitrião | `host@plumguide.com` | `Host123!` |
| Especialista | `specialist@plumguide.com` | `Specialist123!` |
| Administrador | `admin@plumguide.com` | `Admin123!` |

O ecrã de login tem botões que preenchem estas contas automaticamente. O registo público cria apenas contas de **Hóspede** ou **Anfitrião**.

---

## 3. Instruções de Execução Local

### Pré-requisitos

| Requisito | Versão | Notas |
| --- | --- | --- |
| **Node.js** | 22 LTS ou superior | Testado com Node 22.14.0 |
| **npm** | 10 ou superior | Testado com npm 10.9.2 |
| **Git** | Qualquer versão recente | — |

Não é necessário instalar Docker, PostgreSQL ou um servidor de base de dados: o `next dev` arranca uma instância local de Cloudflare D1 através do Wrangler, já incluído nas dependências.

### 1. Clonar o repositório

```bash
git clone https://github.com/kitokaesu/plum-guide-curation.git
cd plum-guide-curation
```

### 2. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `AUTH_SECRET` | Produção | Chave de assinatura do cookie de sessão. Em desenvolvimento pode ficar por definir (existe um valor de recurso). Em produção tem de ser um segredo da plataforma, com 32+ bytes aleatórios. |
| `DATABASE_URL` | Não | Usada **apenas** pelas ferramentas do Prisma e pelo gerador de dados de demonstração (`file:./dev.db`). A aplicação em execução lê a base de dados pelo *binding* `DB` do Cloudflare D1. |

Gerar um segredo adequado:

```bash
openssl rand -base64 32
```

> Nunca colocar `AUTH_SECRET` numa variável `NEXT_PUBLIC_*` nem no repositório. O ficheiro `.env` já está no `.gitignore`.

### 3. Instalar dependências e arrancar

```bash
npm install     # executa também `prisma generate`
npm run dev     # http://localhost:3000
```

No primeiro pedido, a aplicação cria o esquema, os índices, o *trigger* de proteção e os dados de demonstração. Os dados locais persistem em `.wrangler/state`.

### 4. Scripts disponíveis

| Comando | Efeito |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento em `0.0.0.0:3000` |
| `npm run build` | `prisma generate` + build de produção |
| `npm start` | Servir o build de produção |
| `npm run typecheck` | Verificação de tipos, sem emitir ficheiros |
| `npm run db:seed` | Regenerar o conjunto SQLite usado para produzir o *seed* do D1 |
| `npm run db:export:d1` | Exportar esse conjunto para `src/lib/d1-seed-sql.ts` |
| `npm run db:reset` | Reconstruir o conjunto SQLite de raiz |

### 5. Resolução de problemas

| Sintoma | Causa provável | Resolução |
| --- | --- | --- |
| `internal error; reference …` ao abrir o D1 | Estado local do Miniflare corrompido | Parar o servidor, apagar `.wrangler/` e voltar a executar `npm run dev` |
| `prisma generate` falha durante o `npm install` | Rede ou *postinstall* interrompido | Executar `npx prisma generate` isoladamente — não contacta nenhuma base de dados |
| Porta 3000 ocupada | Outra instância em execução | `npx next dev -p 3001` |
| Nenhuma casa aparece numa instalação nova | O *seed* corre no primeiro pedido | Recarregar a página depois de o servidor indicar que está pronto |

---

## 4. Estrutura da Base de Dados

O modelo é relacional e vive em `prisma/schema.prisma`; no D1 é criado por `src/lib/d1-bootstrap.ts` com instruções `CREATE ... IF NOT EXISTS` idempotentes.

| Entidade | Tabela | Descrição |
| --- | --- | --- |
| **User** | `users` | Conta com `role` (`GUEST`, `HOST`, `SPECIALIST`, `ADMIN`), email único e *hash* bcrypt da palavra-passe. |
| **Property** | `properties` | Casa submetida por um anfitrião: localização, preço por noite, estado (`DRAFT`, `PENDING_INSPECTION`, `APPROVED`, `REJECTED`) e pontuação do Plum Test. |
| **InspectionSlot** | `inspection_slots` | Vaga de inspeção publicada por um especialista; fica associada a uma casa quando o anfitrião a reserva e guarda pontuação, notas e data de conclusão. |
| **AvailabilityCalendar** | `availability_calendars` | Um registo por casa e por data, com `is_available` e `custom_price` opcional. Único em `(property_id, date)`. |
| **Booking** | `bookings` | Reserva com referência legível (`PLM-XXXXXXXX`), datas, número de noites, detalhe de preços e estado. |
| **BookingNight** | `booking_nights` | Registo de uma noite efetivamente ocupada. O índice único `(property_id, date)` é a garantia contra duplicação de reservas. |
| **Cancellation** | `cancellations` | Cancelamento 1:1 com a reserva (`booking_id` único), com motivo, percentagem e valor do reembolso e marca de ajuste manual. |

### Relações

```
users (HOST)     1 ─── N  properties
users (GUEST)    1 ─── N  bookings
users (SPECIALIST) 1 ── N  inspection_slots
properties       1 ─── N  availability_calendars
properties       1 ─── N  inspection_slots
properties       1 ─── N  bookings
properties       1 ─── N  booking_nights
bookings         1 ─── 1  cancellations
bookings         1 ─── N  booking_nights
users            1 ─── N  cancellations (cancelled_by)
```

### Garantias ao nível da base de dados

- `booking_nights (property_id, date)` **único** — impede duas reservas sobrepostas mesmo em concorrência.
- `cancellations.booking_id` **único** — um segundo cancelamento devolve `409`.
- *Trigger* `booking_nights_closed_guard` — rejeita noites que o anfitrião tenha fechado.
- Índices em estado de propriedade, anfitrião, hóspede, datas de reserva e data/estado de inspeção.

### Inicialização e dados de demonstração

Como o D1 gerido começa vazio e não expõe SQL arbitrário ao *deployer*, o Worker inicializa-se sozinho no primeiro uso:

1. Lê o marcador `plum_meta` (uma leitura indexada nos *isolates* seguintes).
2. Cria tabelas, índices e o *trigger* com `IF NOT EXISTS`.
3. Carrega `SEED_STATEMENTS` se `users` estiver vazia (todas as instruções são `INSERT OR IGNORE`).
4. Grava o marcador de versão.

O conjunto de demonstração é escrito em `prisma/seed.mjs` sobre um ficheiro SQLite local e depois exportado para SQL do D1:

```bash
npm run db:seed        # reconstrói prisma/dev.db com dados realistas
npm run db:export:d1   # regenera src/lib/d1-seed-sql.ts
```

Inclui 9 utilizadores, 13 casas (9 aprovadas, 2 por inspecionar, 1 rejeitada, 1 rascunho), 7 reservas (duas já canceladas), 150 dias de calendário por casa e 21 vagas de inspeção.

### Alterar o esquema

1. Atualizar `prisma/schema.prisma`.
2. Replicar a alteração no DDL de `src/lib/d1-bootstrap.ts` e incrementar `SEED_VERSION`.
3. Executar `npx prisma generate`.

As migrações SQLite em `prisma/migrations/` servem apenas para a base de dados de autoria do *seed*, não para o D1 publicado.

---

## 5. Documentação Adicional

| Documento | Conteúdo |
| --- | --- |
| [`docs/presentation.html`](docs/presentation.html) | Apresentação 16:9 com guião de demonstração, investigação e modelo de dados (`Ctrl/Cmd + P` para PDF) |
| [`docs/user-guide.html`](docs/user-guide.html) | Manual por perfil, com capturas de ecrã, regras de preços e reembolsos |
| [`docs/report.html`](docs/report.html) | Relatório: requisitos, justificação tecnológica, desenho da base de dados, testes e limitações |

Os documentos são autónomos (capturas incorporadas), podendo ser partilhados ou impressos individualmente.

### Limitações conhecidas

- Pagamentos e emails de confirmação são simulados; nenhum cartão é cobrado.
- O download da fatura usa o diálogo de impressão do navegador.
- As fotografias dos anúncios vêm de imagens de *stock* curadas; não há *upload*.
- Não existem tarefas em segundo plano: os reembolsos ficam registados à espera de integração com um fornecedor de pagamentos.
- As contas de demonstração partilham palavras-passe simples e nunca devem ser usadas em produção.

---

## 6. Autores e Agradecimentos

### Autor

- **[@kitokaesu](https://github.com/kitokaesu)** — conceção, desenvolvimento e documentação.

### Agradecimentos

- **Plum Guide**, pela inspiração no modelo de curadoria e no processo de inspeção "Plum Test".
- **Next.js, React e Vercel**, pela framework e pela documentação que sustentam a aplicação.
- **Prisma** e **Cloudflare**, pelo ORM e pela base de dados D1 em ambiente *serverless*.
- **Unsplash**, pelas fotografias usadas nos anúncios de demonstração.
- Aos docentes e colegas da unidade curricular, pelo *feedback* ao longo do desenvolvimento.

---

*Projeto de demonstração com fins académicos. Os dados, casas e reservas são fictícios. Não existe ficheiro `LICENSE`: contactar o autor antes de reutilizar o código.*
