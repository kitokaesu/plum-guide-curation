# Apresentação de Projeto e Guião de Defesa

## Plum Guide — Curadoria, Inspeção e Reservas

| | |
| --- | --- |
| **Aplicação** | Plum Guide |
| **Autor** | [@kitokaesu](https://github.com/kitokaesu) |
| **Data** | Novembro de 2026 |
| **Empresa / tema** | The Plum Guide — marketplace de alojamento curado (recriação académica do modelo operacional) |
| **Formato** | Diapositivos 16:9 (1920 × 1080), exportáveis para PDF |
| **Duração** | 10 minutos de apresentação + 5 minutos de perguntas |
| **Deck de referência** | `docs/presentation.html` (versão inglesa com capturas; traduzir mantendo o desenho) |

---

## Como usar este documento

Cada diapositivo tem três blocos:

1. **No ecrã** — o que aparece no slide (títulos curtos, no máximo 6 linhas).
2. **Visual** — o diagrama ou imagem que acompanha.
3. **Guião** — o que dizer, com marcação de tempo. As frases entre aspas podem ser lidas quase literalmente.

Regra de ouro: **o slide não se lê**. O slide sustenta a fala; a fala explica o raciocínio.

### Plano de tempos

| Slide | Tema | Tempo | Acumulado |
| --- | --- | --- | --- |
| 1 | Capa e enquadramento | 0:30 | 0:30 |
| 2 | Problema e solução proposta | 1:30 | 2:00 |
| 3 | Arquitetura e base de dados | 2:30 | 4:30 |
| 4 | Roteiro da demonstração | 3:30 | 8:00 |
| 5 | Utilização de IA no desenvolvimento | 1:00 | 9:00 |
| 6 | Conclusões e limitações | 1:00 | 10:00 |
| — | Perguntas | 5:00 | 15:00 |

> **Nota:** se o tempo estiver apertado, encurte o slide 5 (IA) e o slide 2; **nunca** encurte o slide 3 nem a demonstração, que é onde a nota se decide.

---

## Slide 1 — Capa

### No ecrã

- **Plum Guide** — Curadoria, Inspeção e Reservas
- Plataforma web *full-stack* que transforma a promessa "as melhores 3% das casas" em regras executáveis
- Nome do autor · Número de estudante · Unidade curricular
- Novembro de 2026

### Visual

Fotografia de uma casa em tom quente, ocupando dois terços do slide, com o título alinhado à esquerda. Sem logótipo real da empresa: usar apenas a designação textual.

### Guião (0:30)

> "Bom dia. Chamo-me [nome] e vou apresentar a **Plum Guide**, uma aplicação web que reproduz o modelo operacional de uma plataforma de alojamento curado: o anfitrião submete a casa, um especialista inspeciona-a, a casa é aprovada ou rejeitada e, a partir daí, pode ser reservada, faturada e cancelada com regras claras.
>
> Ao longo de dez minutos vou mostrar o problema, a arquitetura e a base de dados, fazer uma demonstração com os quatro perfis e explicar como usei IA — incluindo o que a IA errou."

**Transição:** "Começo pelo problema, porque foi ele que definiu todas as decisões técnicas."

---

## Slide 2 — O Problema e a Solução Proposta

### No ecrã

**O problema — três incertezas**

| Incerteza | Consequência para o utilizador |
| --- | --- |
| Qualidade desconhecida antes da estadia | O hóspede decide às cegas |
| Disponibilidade pouco fiável | Duas reservas para a mesma noite |
| Custos que aparecem tarde | Abandono e desconfiança |

**A solução — estados auditáveis**

- Inspeção com pontuação **0–100** e **150 critérios**; aprovação automática a partir de **85**
- **Uma noite pertence a uma só reserva**, garantido pela base de dados
- Total calculado **no servidor**: noites + **€180** de limpeza + **8%** de serviço
- Cancelamento com escalões **100% / 50% / 0%** e libertação imediata das datas

### Visual

Dois blocos lado a lado: à esquerda um cartão de anúncio genérico com um "?" na qualidade; à direita o mesmo cartão com o selo **Aprovada Plum** e a pontuação. Por baixo, três números grandes: `85`, `1 reserva por noite`, `100/50/0`.

### Guião (1:30)

> "Num marketplace aberto, o hóspede enfrenta três incertezas. Primeira: não sabe se a casa é boa — só o descobre depois de lá estar. Segunda: não sabe se o calendário é verdadeiro. Terceira: o preço final aparece tarde, com taxas que ninguém previu.
>
> A minha proposta foi converter a promessa da marca em **estados que se podem auditar**. 'Casa bonita' é uma opinião; 'aprovada depois de uma inspeção com pontuação igual ou superior a 85' é uma regra que se implementa, se testa e se explica a um anfitrião.
>
> Na prática, isto significa três coisas. A casa só é publicada com uma inspeção registada. A ocupação é um registo de noites com restrição única, por isso duas pessoas nunca compram a mesma noite. E todos os valores são recalculados no servidor — o cliente não decide preços.
>
> É uma aplicação de demonstração: os pagamentos são simulados, mas as regras são reais."

**Transição:** "Estas regras obrigaram a escolhas de arquitetura muito concretas."

---

## Slide 3 — Arquitetura do Sistema e Base de Dados

### No ecrã

**Arquitetura em três camadas**

```
Navegador (React 19)
      │ HTML/RSC + fetch JSON
Next.js 16 · App Router (Cloudflare Worker)
      │ Server Components · Route Handlers · src/lib
Prisma 6 + adaptador D1
      │ binding DB
Cloudflare D1 (SQLite gerido)
```

**Sete tabelas**

`users` · `properties` · `inspection_slots` · `availability_calendars` · `bookings` · `booking_nights` · `cancellations`

**Relações que sustentam o modelo**

- `users` (anfitrião) **1:N** `properties` · `users` (hóspede) **1:N** `bookings`
- `bookings` **1:1** `cancellations` (`booking_id` único)
- `properties` **1:N** `booking_nights` — com **UNIQUE `(property_id, date)`**
- `properties` **1:N** `availability_calendars` — **UNIQUE `(property_id, date)`**

**Duas invariantes vivem na base de dados**

1. Índice único de ocupação: a segunda reserva falha e o lote inteiro é revertido
2. *Trigger* que recusa noites fechadas pelo anfitrião

### Visual

Diagrama de camadas à esquerda (três caixas empilhadas) e mini-ER à direita, com as quatro tabelas centrais e as cardinalidades. Destacar a caixa `booking_nights` com a etiqueta **UNIQUE (property_id, date)**.

### Guião (2:30)

> "A arquitetura tem três camadas. No browser, React 19 trata da interação: calendários, modais, formulários. No servidor, Next.js 16 com o App Router faz a renderização no servidor — o que é essencial, porque o idioma e a sessão vivem em cookies e eu não queria um flash de conteúdo errado no primeiro paint. A persistência é Cloudflare D1, uma base SQLite gerida, acedida por Prisma com o adaptador D1.
>
> Sete tabelas. **users** guarda os quatro perfis — hóspede, anfitrião, especialista e administrador — com palavra-passe em bcrypt. **properties** pertence a um anfitrião e carrega o estado de aprovação e a pontuação da inspeção. **inspection_slots** são as vagas que o especialista publica; quando o anfitrião as reserva, ficam ligadas à casa. **availability_calendars** tem uma linha por casa e por dia, com preço personalizado opcional. **bookings** é a reserva, com referência legível e discriminativo de preços. **booking_nights** é o registo de cada noite ocupada. E **cancellations** é um-para-um com a reserva, com `booking_id` único.
>
> As relações importantes são estas: um anfitrião tem muitas casas, um hóspede tem muitas reservas, uma reserva tem no máximo um cancelamento, e uma casa tem muitas noites ocupadas e muitos dias de calendário.
>
> E há duas regras que não vivem no código: o índice único em `booking_nights (property_id, date)` e um trigger que recusa noites fechadas. Isto importa porque o D1 **não tem transações interativas**. Não posso ler, decidir e escrever com segurança. Então inverti o problema: **a inserção é a reivindicação**. Quem insere a noite ganha; o outro recebe um 409 e o lote é revertido por inteiro.
>
> Uma ressalva técnica honesta: os estados são `String` e não `ENUM`, porque o SQLite não tem enums nativos no Prisma. A validação está centralizada num único ficheiro de constantes e nos tipos TypeScript."

**Transição:** "Isto vê-se melhor a funcionar. Vou fazer a demonstração."

---

## Slide 4 — Roteiro da Demonstração

### No ecrã

**Oito minutos, quatro perfis — 3:30 de demonstração**

| # | Perfil | Ação | O que deve ficar visível |
| --- | --- | --- | --- |
| 1 | Hóspede | Abrir a coleção e uma casa aprovada | Selo, pontuação, relatório do Plum Test, calendário com legenda |
| 2 | Hóspede | Escolher datas e ler a cotação | Noites + €180 + 8% = total antes de confirmar |
| 3 | Hóspede | **Confirmar e pagar** | Referência `PLM-…`, estado **Confirmada**, fatura |
| 4 | Hóspede | Cancelar a reserva | Modal com reembolso estimado, escalão e motivo |
| 5 | Anfitrião | Fechar uma noite e definir preço personalizado | Calendário persistido; data deixa de ser reservável |
| 6 | Especialista | Registar inspeção com pontuação **92** | Casa passa a **Aprovada Plum** automaticamente |
| 7 | Administrador | Ver métricas e a fila de inspeções | Aprovar/rejeitar em dois passos; *override* registado |
| 8 | Hóspede | Voltar ao calendário | Datas canceladas novamente disponíveis |

**Antes de começar (checklist)**

- Servidor em execução (`npm run dev` ou endereço online) e base de dados com *seed* fresco
- Separador do navegador com zoom a 100% e janela maximizada
- Contas de demonstração copiadas: `guest@`, `host@`, `specialist@`, `admin@plumguide.com`
- Uma reserva **já cancelada** e uma casa em **rascunho** disponíveis como plano B
- Cronómetro visível para si (não para a plateia)

### Guião (3:30)

> "Vou entrar como hóspede. Esta é a coleção; este selo significa que a casa foi inspecionada e esta é a pontuação, 91 em 100, avaliada em 150 critérios.
>
> Escolho duas noites. Reparem que a cotação aparece **antes** do botão: noites, 180 euros de limpeza, 8 por cento de serviço, total. Confirmo. A referência fica imediatamente disponível e as datas desaparecem do calendário para qualquer outro visitante.
>
> Agora o cancelamento: o sistema mostra quanto recebo antes de eu decidir — neste caso 100 por cento, porque faltam mais de 14 dias.
>
> Passo a anfitrião. Fecho esta noite e ponho um preço especial. [fecha] A página pública já não a oferece.
>
> Especialista: registo a inspeção com 92. [confirma] A casa passa a **Aprovada Plum** sem intervenção humana — a regra é automática a partir de 85.
>
> E o administrador vê as métricas e a fila. Se rejeitar, exige dois passos, para não destruir nada por engano.
>
> Por fim, volto ao calendário: as noites canceladas estão outra vez disponíveis. O ciclo fecha."

**Se a demonstração falhar**

1. Não reinicie a aplicação à frente da plateia. Diga: "vou mostrar o registo desta mesma operação" e abra as capturas do manual (`docs/user-guide.html`).
2. Se a base de dados local falhar, use a versão publicada no endereço online.
3. Se o login falhar, use os botões de preenchimento automático do ecrã de entrada.
4. Tenha sempre o PDF com os ecrãs aberto num segundo separador.

---

## Slide 5 — Utilização de Inteligência Artificial no Desenvolvimento

### No ecrã

**Ferramentas**

- Agente de programação (Codebuff/Freebuff) sobre modelo *frontier* alojado
- Agente de pesquisa web para contexto da empresa e fontes
- Navegador automatizado para verificação visual

**Três contribuições concretas**

| Tarefa | O que a IA propôs | O que foi corrigido |
| --- | --- | --- |
| Esquema e *bootstrap* do D1 | Sete tabelas, índices e carregador idempotente | Enums nativos e transações interativas — incompatíveis com SQLite/D1 |
| Correção da reserva | *Ledger* de noites com índice único e `batch` | A primeira proposta lia antes de inserir: havia corrida |
| Cancelamento e reembolso | Escalões, *batch* e modal de confirmação | Valores verificados à mão; *override* limitado ao total pago |

**Princípio adoptado**

> "O modelo propõe, a documentação e os testes decidem."

**Transparência**

- Não foi usado modelo de pesos abertos (Llama, DeepSeek, Mistral): o ambiente não tinha GPU e as tarefas exigiam modelos maiores
- A aplicação **não** chama IA em execução; as pontuações são baseadas em regras, para serem auditáveis

### Visual

Tabela de três linhas com uma coluna "erro" destacada a vinho, e a citação em corpo grande. Ao lado, ícone de documento oficial (D1/Prisma) para reforçar a verificação.

### Guião (1:00)

> "Usei um agente de programação sobre um modelo alojado, para implementação, revisão de SQL e depuração. Não usei um modelo de pesos abertos como Llama ou Mistral, e digo-o explicitamente: o ambiente não tinha GPU e as tarefas críticas eram de compatibilidade com D1, onde um modelo maior erra menos.
>
> O que interessa não é o que a IA escreveu, é o que eu verifiquei. Três exemplos. No esquema, a IA propôs enums e transações interativas — ambas impossíveis neste runtime; substituí por strings validadas e por um lote atómico. Na reserva, a primeira proposta lia a disponibilidade e só depois inseria: era uma corrida clássica; a solução foi fazer da inserção a reivindicação. No cancelamento, os valores foram recalculados à mão e o limite do reembolso passou a ser o total pago.
>
> Encontrei seis erros relevantes da IA e todos estão documentados no relatório. O princípio foi sempre o mesmo: **o modelo propõe, a documentação e os testes decidem**."

**Transição:** "Fecho com o que está feito e com o que não está."

---

## Slide 6 — Conclusões e Limitações Atualizadas

### No ecrã

**Concluído**

- Site público, autenticação e quatro portais por perfil
- Reserva atómica sem duplicação, provada com pedidos concorrentes
- Preços autoritativos em euros, cancelamento com três escalões e reposição do calendário
- Interface bilingue EN/PT com preferência persistida
- *Bootstrap* automático do esquema e dos dados no D1

**Limitações atuais**

| Limitação | Estado |
| --- | --- |
| Pagamentos e email simulados | Fora de âmbito, assumido |
| Sem testes automatizados em CI | Matriz manual de 18 cenários |
| Acessibilidade sem auditoria WCAG | Semântica e teclado implementados |
| Portais de gestão em inglês | Decisão consciente |
| Sem *upload* de imagens | Fotografia curada de *stock* |
| Configuração local de D1 instável | Versão publicada funciona; problema de ambiente |

**Trabalho futuro**

Stripe + *webhooks* · Playwright em CI · email transacional · WCAG 2.2 AA · sincronização iCal

### Visual

Duas colunas: "feito" com marcas verdes e "não feito" com marcas âmbar; rodapé com a frase final em corpo grande.

### Guião (1:00)

> "O que fica feito: a aplicação está publicada, tem os quatro perfis, reserva atómica provada com pedidos simultâneos, preços calculados no servidor, cancelamento com reembolso e reposição do calendário, e interface bilingue.
>
> O que não está feito, e digo-o antes de me perguntarem: os pagamentos são simulados, não há testes automatizados em CI, não fiz auditoria de acessibilidade, os portais de gestão estão em inglês e a configuração local do D1 deu problemas durante a verificação — a versão publicada funciona.
>
> O contributo principal não está no número de ecrãs. Está em ter percebido que **as regras de negócio podem ser a arquitetura**: se a ocupação é um registo de noites com restrição única, então a concorrência, o cancelamento e a auditabilidade resolvem-se no mesmo sítio.
>
> Obrigado. Fico disponível para perguntas."

---

## Secção Especial — Preparação para Perguntas

Regras de resposta: **uma frase de tese, dois factos, uma consequência**. Se não souber, diga o que faria para descobrir — nunca invente um número.

### Pergunta 1 — "O D1 não tem transações. Como é que garante que a reserva é atómica?"

**Resposta:** A atomicidade não está na aplicação, está numa operação única. A reserva e as noites são escritas num só `db.batch()`, que o D1 executa atomicamente: ou entram todas as instruções, ou nenhuma. Além disso, a garantia contra duplicação não depende do tempo: o índice único `(property_id, date)` recusa a segunda inserção e o lote inteiro reverte. Não faço *read-modify-write*.

**Se insistirem:** "O que acontece se o batch falhar a meio?" — O D1 não deixa estado parcial; o cliente recebe um erro e nenhuma linha de reserva fica gravada. Foi o que validei no cenário 4 e 5 da matriz de testes.

### Pergunta 2 — "E se dois pedidos chegarem exatamente no mesmo instante? Onde é que decide quem ganha?"

**Resposta:** Decide a base de dados, não o código. As duas transações tentam inserir a mesma noite; o índice único serializa-as e uma delas viola a restrição. O vencedor recebe `201`, o perdedor `409`, e existe exatamente uma reserva e uma linha de noites. Testei com dois pedidos simultâneos: uma confirmação, um conflito, uma linha. A correção não depende da ordem de chegada nem do tempo de resposta.

**Se insistirem:** "Como sabe que o teste é válido?" — O teste foi repetido em workerd local com D1 criado de raiz e depois na versão publicada; e a prova é verificável na base: uma contagem em `bookings` e em `booking_nights`.

### Pergunta 3 — "Porque não usou PostgreSQL, que tem transações a sério?"

**Resposta:** Porque o destino de execução é Cloudflare Workers e o D1 é o armazenamento nativo, sem servidor para operar nem credenciais no código. Mas reconheço o custo: com PostgreSQL e transações interativas, a lógica seria mais simples de escrever e de manter. A minha escolha obrigou-me a resolver a correção com restrições declarativas, o que tem uma vantagem: a garantia fica na base de dados e não depende de disciplina no código. Se o projeto crescesse para operações com várias invariantes por transação, migraria para Postgres.

**Se insistirem:** "O que mudaria?" — Substituiria o adaptador e o *batch* por transações Prisma; o modelo relacional mantinha-se, porque foi desenhado em SQL normal.

### Pergunta 4 — "Porque é que os estados são `String` e não `ENUM`? Isso não permite dados inválidos?"

**Resposta:** Permite, e é uma limitação real. O SQLite não tem `ENUM` nativo no Prisma, por isso guardo texto e valido numa única fonte — `src/lib/constants.ts` — que alimenta também uniões de literais em TypeScript. A aplicação nunca escreve um estado fora dessa lista. O risco que sobra é alguém alterar a base diretamente; a mitigação seria acrescentar restrições `CHECK` no DDL, que é precisamente uma das melhorias que registei.

**Se insistirem:** "Como deteta o desvio?" — Hoje, por revisão e testes; com `CHECK` na base, a violação passaria a ser impossível. É a diferença entre validar na aplicação e validar no esquema.

### Pergunta 5 — "O cliente pode alterar o preço no pedido?"

**Resposta:** Pode tentar, mas não tem efeito. O servidor ignora qualquer valor enviado pelo cliente: recalcula a cotação a partir do preço da casa, do preço personalizado do dia, das taxas fixas e do número de noites, e grava esse total. A autorização também é revalidada na rota, não no botão. O total mostrado antes de confirmar é o mesmo que fica gravado, e a fatura vem da base.

**Se insistirem:** "E se alterarem as datas?" — As datas são novamente validadas: passado, intervalo inválido e noites fechadas são recusados antes de qualquer escrita.

### Pergunta 6 — "Depois de um cancelamento, como garante que o calendário fica coerente?"

**Resposta:** Porque tudo acontece no mesmo lote: atualizar a reserva para cancelada, inserir o cancelamento, apagar as noites ocupadas e reabrir os dias no calendário. Se qualquer passo falhar, nada é gravado. E o cancelamento é único: `cancellations.booking_id` tem índice único, por isso um segundo pedido recebe `409` em vez de duplicar o reembolso.

**Se insistirem:** "E o reembolso?" — É calculado no momento do cancelamento, a partir da data de check-in: 100% acima de 14 dias, 50% entre 7 e 14, 0% abaixo de 7. O administrador pode ajustar, mas nunca acima do total pago, e o ajuste fica marcado como manual.

### Pergunta 7 — "Que parte do código é que foi escrita por IA? Como é que sei que está correta?"

**Resposta:** A IA foi usada como par de programação: propôs esquema, SQL, o desenho do *ledger* de noites e o *batch* de cancelamento, entre outros. Nada foi aceite sem verificação. Encontrei seis erros materiais — enums e transações impossíveis no D1, uma corrida de leitura antes da escrita, rejeição num só clique, confusão entre 150 critérios e pontuação de 100, resíduos de libra na migração para euro e um estado otimista no seletor de idioma que deixava o botão inerte. Cada correção está no relatório. A responsabilidade pelo código é minha: sei explicar cada linha e cada decisão de base de dados.

**Se insistirem:** "Porque não usou um modelo aberto, como Llama ou Mistral?" — Porque não havia GPU no ambiente e as tarefas críticas eram de compatibilidade com D1/SQLite. A alternativa é viável — Ollama com Llama 3.x, ou Aider com DeepSeek-Coder — mas manteria o mesmo protocolo: o modelo propõe, a documentação e os testes decidem. E a aplicação em si não chama IA nenhuma: as pontuações são regras, para serem auditáveis.

### Perguntas de recurso (se sobrar tempo)

| Pergunta | Linha de resposta |
| --- | --- |
| "Como escala para 10 000 casas?" | Índices por casa e por intervalo de datas; a consulta de disponibilidade é por intervalo, não por tabela inteira; o limite prático passaria a ser o número de escritas concorrentes no D1, que exigiria medir |
| "Que dados pessoais guarda?" | Apenas nome, email e *hash* bcrypt; sessão em cookie `HttpOnly`; nada de dados de cartão, porque o pagamento é simulado |
| "O que faria com mais duas semanas?" | Stripe com *webhooks* e testes Playwright em CI, incluindo o teste de reserva paralela |

---

## Anexo A — Checklist da véspera

- [ ] Base de dados local recriada: apagar `.wrangler` e executar `npm run dev`
- [ ] Login testado nas quatro contas
- [ ] Uma reserva criada **e** cancelada antes da apresentação, para ter histórico visível
- [ ] Casa em **rascunho** disponível para a demonstração do anfitrião
- [ ] PDF com os ecrãs do manual aberto num segundo separador (plano B)
- [ ] Deck exportado para PDF e guardado em dois sítios (computador e nuvem)
- [ ] Cronómetro e plano de tempos impressos
- [ ] Slide 3 revisto em voz alta: é o mais denso e o que mais perguntas gera

## Anexo B — Exportar a apresentação para PDF

**A partir do deck existente (`docs/presentation.html`):**

1. Abrir o ficheiro no navegador.
2. **Imprimir** → **Guardar como PDF** → formato A4 horizontal, margens mínimas, "gráficos de fundo" ativados.

**A partir deste guião (Markdown):**

```bash
pandoc docs/apresentacao-e-guiao.md -o apresentacao-e-guiao.pdf \
  --pdf-engine=xelatex -V geometry:margin=2cm -V lang=pt-PT --toc
```

> **Nota:** este documento é o **guião e a estrutura**. O ficheiro para projetar é o deck (HTML ou PDF de 16:9); o guião fica impresso, na mão de quem apresenta.

## Anexo C — O que não fazer na defesa

1. **Não ler os diapositivos.** Se está a ler, não está a explicar.
2. **Não atribuir decisões à IA.** "A IA fez assim" é a resposta que mais desvaloriza o trabalho; a decisão foi sua e a verificação também.
3. **Não esconder limitações.** Ao anunciá-las primeiro, controla a narrativa e ganha credibilidade.
4. **Não improvisar números.** Se não tem certeza de um valor, diga "posso confirmar no relatório" e continue.
5. **Não reiniciar a aplicação durante a demonstração.** Use o plano B (capturas) e mantenha a calma.
