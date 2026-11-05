# Manual do Utilizador

## Plum Guide — Curadoria, Inspeção e Reservas

| | |
| --- | --- |
| **Aplicação** | Plum Guide |
| **Versão do manual** | 1.0 — novembro de 2026 |
| **Destinatários** | Hóspedes, anfitriões, especialistas Plum e administradores |
| **Aplicação online** | <https://site-ef110a907aa543e89a6159ea2358c1de.freebuff.page> |
| **Repositório** | <https://github.com/kitokaesu/plum-guide-curation> |
| **Nível** | Não requer conhecimentos técnicos (exceto a opção de execução local, na secção 1.4) |

---

## Como usar este manual

- Os passos estão **numerados** e devem ser seguidos por ordem.
- O texto em **negrito** corresponde a um elemento visível no ecrã (botão, ligação, campo ou título).
- O marcador `[Inserir Captura de Ecrã: …]` indica onde deve entrar uma imagem ilustrativa antes da publicação em PDF.
- As caixas **Nota** explicam detalhes úteis; as caixas **Atenção** assinalam riscos ou limites.

> **Nota:** esta é uma aplicação de demonstração. Os pagamentos são simulados, nenhum cartão é cobrado e os dados existentes (casas, reservas, contas) são fictícios. Não introduza dados pessoais reais.

---

## 1. Como Aceder

### 1.1 O que precisa

| Requisito | Opção online | Opção local |
| --- | --- | --- |
| Navegador atualizado (Chrome, Edge, Firefox ou Safari) | Sim | Sim |
| Ligação à Internet | Sim | Não |
| Node.js 22 ou superior + npm 10 | Não | Sim |
| Instalação de software | Nenhuma | `npm install` |

A aplicação funciona em computador, tablet e telemóvel; o menu e os calendários adaptam-se à largura do ecrã.

### 1.2 Opção A — através do endereço online (recomendada)

1. Abra o navegador.
2. Introduza o endereço **https://site-ef110a907aa543e89a6159ea2358c1de.freebuff.page** e prima **Enter**.
3. Aguarde o primeiro carregamento. Na primeira visita, a aplicação prepara a base de dados de demonstração, o que pode demorar alguns segundos.
4. Confirme que surge a página inicial da Plum Guide, com o título **"As melhores 3% das casas. Nada menos."** (em inglês, antes de mudar de idioma) e o botão **Entrar** no canto superior direito.

**Resultado esperado:** a página inicial está visível e pode navegar para **Casas verificadas** sem instalar nada.

`[Inserir Captura de Ecrã: página inicial da Plum Guide no navegador, com o cabeçalho, o botão Entrar e o seletor EN | PT visíveis]`

### 1.3 Opção B — através da máquina virtual da unidade curricular

1. Confirme que está ligado à rede onde a máquina virtual está disponível.
2. No navegador, introduza **http://lab.csmiguel.pt** (ou o endereço IP e porta fornecidos pelo docente, por exemplo `http://10.0.0.15:3000`).
3. Prima **Enter** e aguarde o carregamento.
4. Se a página não abrir, confirme com o docente a porta correta e se o serviço está em execução.

**Resultado esperado:** a aplicação comporta-se exatamente como na Opção A.

> **Nota:** o endereço da máquina virtual pode variar entre edições da unidade curricular. Use sempre o endereço indicado na entrega.

### 1.4 Opção C — execução local no seu computador

Esta opção destina-se a quem quer explorar o projeto ou demonstrá-lo sem Internet.

1. Instale o **Node.js 22 LTS** (ou superior) a partir de <https://nodejs.org>. Confirme a instalação abrindo um terminal e escrevendo `node -v` e `npm -v`.
2. Abra um terminal e clone o repositório:

   ```bash
   git clone https://github.com/kitokaesu/plum-guide-curation.git
   cd plum-guide-curation
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Crie o ficheiro de configuração a partir do modelo:

   ```bash
   cp .env.example .env
   ```

   > **Nota:** pode deixar `AUTH_SECRET` como está para uso local. Em produção, este valor tem de ser substituído por uma chave aleatória longa.

5. Inicie o servidor:

   ```bash
   npm run dev
   ```

6. Abra o navegador em **http://localhost:3000**.
7. Aguarde a mensagem de que o servidor está pronto e recarregue a página uma vez, se ainda não aparecerem casas.
8. Para terminar, volte ao terminal e prima **Ctrl + C**.

**Resultado esperado:** a aplicação está disponível em `localhost:3000`, com a base de dados criada automaticamente no primeiro pedido.

`[Inserir Captura de Ecrã: terminal após "npm run dev", com o endereço http://localhost:3000 e a indicação de que o servidor está pronto]`

> **Atenção:** não é necessário instalar Docker, MySQL ou PostgreSQL. A base de dados local é criada e gerida pela própria aplicação.

### 1.5 Contas de demonstração

Pode criar a sua própria conta (secção 2.1) ou usar uma das contas já preparadas. Os portais de anfitrião, especialista e administrador só estão disponíveis com estas contas.

| Perfil | Email | Palavra-passe |
| --- | --- | --- |
| Hóspede | `guest@plumguide.com` | `Guest123!` |
| Anfitrião | `host@plumguide.com` | `Host123!` |
| Especialista | `specialist@plumguide.com` | `Specialist123!` |
| Administrador | `admin@plumguide.com` | `Admin123!` |

> **Atenção:** estas palavras-passe são públicas e existem apenas para demonstração. Nunca devem ser usadas numa instalação real.

---

## 2. Guia Passo a Passo das Principais Tarefas

Cada tarefa indica o perfil necessário. O idioma pode ser alterado a qualquer momento (secção 2.6).

### 2.1 Criar conta e iniciar sessão

**Perfil:** qualquer visitante.

#### 2.1.1 Criar uma conta nova

1. Na página inicial, clique em **Aderir à Plum** (canto superior direito).
2. Preencha o campo **Nome completo**.
3. Introduza um **endereço de email** válido — será o seu nome de utilizador.
4. Escolha uma **palavra-passe** com pelo menos 8 caracteres.
5. Indique se pretende a conta como **Hóspede** ou **Anfitrião**.
6. Clique em **Criar conta**.

**Resultado esperado:** a sessão inicia automaticamente e é encaminhado para o painel correspondente ao seu perfil.

`[Inserir Captura de Ecrã: formulário de criação de conta com os campos de nome, email, palavra-passe e a escolha do perfil]`

> **Nota:** o registo público cria apenas contas de hóspede ou anfitrião. As contas de especialista e administrador são criadas pelo sistema e usam-se através das credenciais de demonstração.

#### 2.1.2 Iniciar sessão

1. Clique em **Entrar** no canto superior direito.
2. Introduza o **email** e a **palavra-passe**.
3. Clique em **Entrar**.

**Atalho:** no ecrã de login existe uma lista de **contas de demonstração**. Clique numa delas para preencher o formulário automaticamente e depois confirme em **Entrar**.

`[Inserir Captura de Ecrã: ecrã de login com os campos preenchidos e a lista de contas de demonstração]`

**Resultado esperado:** surge o painel do seu perfil — `/dashboard/guest` para hóspedes, `/dashboard/host` para anfitriões.

#### 2.1.3 Terminar sessão

1. No cabeçalho, clique em **Sair**.
2. Confirme que regressa à página inicial e que o botão **Entrar** volta a aparecer.

### 2.2 Reservar uma casa

**Perfil:** hóspede. **Duração:** 3 a 5 minutos.

1. No cabeçalho, clique em **Casas verificadas** para abrir a coleção (ou **Explorar a coleção** na página inicial).
2. Use a caixa de **pesquisa** para filtrar por destino e o seletor de **ordenação** para alterar a ordem dos resultados.
3. Clique no cartão de uma casa para abrir a página de detalhe.
4. Leia o bloco **O Plum Test**: mostra a **Pontuação Plum** (0 a 100) e a indicação de que a casa foi avaliada em **150 critérios**. Uma casa só é publicada com pontuação igual ou superior a **85**.
5. No **calendário**, clique na data de entrada e depois na data de saída. Consulte a legenda para distinguir:

   | Símbolo | Significado |
   | --- | --- |
   | Data destacada | Dia selecionado para a estadia |
   | Data riscada | Dia indisponível (fechado pelo anfitrião ou já reservado) |
   | Ponto dourado | Dia com preço personalizado pelo anfitrião |

6. Confirme a **cotação** apresentada junto ao botão: número de noites, subtotal, **taxa de limpeza (€180)**, **taxa de serviço (8%)** e **total**.
7. Clique em **Confirmar e pagar** (*Confirm & Pay*).
8. Aguarde a confirmação. A página de confirmação apresenta a **referência da reserva** (formato `PLM-XXXXXXXX`), as datas e o resumo do valor.

`[Inserir Captura de Ecrã: página de uma casa com o calendário aberto, datas escolhidas e a cotação com o total antes do botão Confirmar e pagar]`

**Resultado esperado:** a reserva fica **Confirmada**, as datas passam a aparecer como indisponíveis para outros visitantes e a referência `PLM-…` fica disponível no seu painel.

> **Nota:** se outra pessoa estiver a reservar as mesmas noites ao mesmo tempo, apenas uma reserva é aceite. A segunda recebe uma mensagem a indicar que as datas acabaram de ser reservadas e não é cobrada.

#### 2.2.1 Ver a confirmação e a fatura

1. Na página de confirmação, clique em **Fatura** (ou abra a reserva no painel e escolha **Fatura**).
2. Confirme os dados: referência, casa, datas, noites, subtotal, taxas e total.
3. Clique em **Imprimir** ou prima **Ctrl + P** (**Cmd + P** no Mac).
4. No destino da impressão, escolha **Guardar como PDF** e confirme.

`[Inserir Captura de Ecrã: fatura com o discriminativo de preços e o botão de impressão]`

**Resultado esperado:** obtém um PDF da fatura, com o total igual ao apresentado no momento da reserva.

### 2.3 Consultar e cancelar uma reserva

**Perfil:** hóspede.

1. Clique em **Painel** no cabeçalho (ou em **Entrar**, se ainda não tiver sessão).
2. Em **Viagens futuras**, localize a reserva pela referência ou pelo nome da casa.
3. Para cancelar, clique em **Cancelar reserva**.
4. No diálogo **Cancelar esta reserva?**, confirme o **reembolso estimado**, a percentagem e o escalão aplicável:

   | Quando cancela | Reembolso |
   | --- | --- |
   | Mais de 14 dias antes do check-in | 100% do total |
   | Entre 7 e 14 dias antes | 50% do total |
   | Menos de 7 dias antes | 0% |

5. Escreva o **motivo do cancelamento** (mínimo 10 caracteres).
6. Clique em **Confirmar cancelamento**. Para desistir, clique em **Manter reserva**.

`[Inserir Captura de Ecrã: diálogo de cancelamento com o reembolso estimado, o escalão e o campo de motivo]`

**Resultado esperado:** a reserva passa a **Cancelada**, o reembolso fica registado e as noites voltam a estar disponíveis no calendário da casa.

> **Nota:** o cancelamento é definitivo e só pode ser feito uma vez por reserva. Uma segunda tentativa é recusada com uma mensagem de aviso.

### 2.4 Publicar uma casa, agendar inspeção e gerir o calendário

**Perfil:** anfitrião.

#### 2.4.1 Submeter uma casa

1. Entre com a conta de anfitrião e abra o **Painel**.
2. Clique em **Submeter casa** (ou **Submeter uma casa para o Plum Test**).
3. Preencha o **título**, a **localização**, o **preço base por noite**, o número de **quartos**, **casas de banho** e **hóspedes máximos**.
4. Escolha uma **imagem** da coleção disponível.
5. Clique em **Guardar**.

**Resultado esperado:** a casa aparece na sua lista com o estado **Rascunho**.

`[Inserir Captura de Ecrã: formulário de submissão de uma casa com os campos preenchidos]`

#### 2.4.2 Agendar o Plum Test

1. Na lista de casas, abra a casa em **Rascunho**.
2. Clique em **Agendar inspeção** (ou **Reservar vaga**).
3. Escolha uma **vaga disponível** na lista de especialistas — cada vaga indica data, hora e especialista.
4. Confirme a marcação.

**Resultado esperado:** o estado da casa passa a **Inspeção agendada** e a vaga deixa de estar disponível para outros anfitriões.

`[Inserir Captura de Ecrã: lista de vagas de inspeção com data, hora e especialista, e o botão de confirmação]`

#### 2.4.3 Gerir disponibilidade e preços

1. Abra a casa no painel e escolha o separador **Disponibilidade**.
2. No calendário de **365 dias**, clique num dia para o **fechar** ou **reabrir**.
3. Para definir um preço diferente nesse dia, introduza o valor no campo **Preço personalizado** e confirme.
4. Verifique a legenda: dias fechados, dias reservados e dias com preço personalizado têm marcas distintas.

`[Inserir Captura de Ecrã: calendário de disponibilidade com dias fechados, dias reservados e um preço personalizado em edição]`

**Resultado esperado:** as alterações ficam guardadas de imediato e refletem-se na página pública da casa.

> **Atenção:** uma noite já reservada não pode ser reaberta enquanto a reserva existir. Cancele ou aguarde o cancelamento pelo hóspede.

### 2.5 Inspecionar e moderar casas

**Perfis:** especialista (2.5.1) e administrador (2.5.2).

#### 2.5.1 Registar uma inspeção (especialista)

1. Entre com a conta de especialista e abra o **Painel**.
2. Para disponibilizar novas datas, use **Publicar vaga**, indique data e hora e confirme.
3. Em **Inspeções atribuídas**, abra a casa a inspecionar. Confirme o **contacto do anfitrião**.
4. Preencha a **pontuação (0 a 100)** e as **notas da inspeção**.
5. Clique em **Concluir inspeção**.

`[Inserir Captura de Ecrã: formulário de inspeção com a pontuação, as notas e o botão Concluir inspeção]`

**Resultado esperado:** a casa passa automaticamente a **Aprovada Plum** se a pontuação for **85 ou superior**; abaixo de 85 passa a **Não aprovada** e é encaminhada para a equipa de curadoria.

#### 2.5.2 Moderar e ajustar reembolsos (administrador)

1. Entre com a conta de administrador e abra o **Painel**.
2. Consulte as **métricas** da plataforma: casas por estado, reservas e membros.
3. Na **fila de inspeções**, abra uma casa inspecionada.
4. Para **aprovar**, clique em **Aprovar**. Para **rejeitar**, clique em **Rejeitar** e confirme em **Sim, rejeitar** — a rejeição exige dois passos.
5. Em **Cancelamentos**, abra um registo e ajuste o **valor do reembolso**.
6. Confirme. O valor não pode exceder o **total da reserva**.

`[Inserir Captura de Ecrã: fila de inspeções com as ações Aprovar e Rejeitar e a confirmação em dois passos]`

**Resultado esperado:** o estado da casa é atualizado e o reembolso ajustado fica registado como **ajuste manual**, com autor e data.

### 2.6 Alterar o idioma (EN / PT)

1. No canto superior direito, localize o grupo **Idioma** com os botões **EN** e **PT**.
2. Clique em **PT** para português europeu ou em **EN** para inglês.
3. Aguarde um instante: a página é atualizada no idioma escolhido, sem perder a posição nem os dados introduzidos.

`[Inserir Captura de Ecrã: cabeçalho com o seletor EN | PT e o idioma português ativo]`

**Resultado esperado:** todos os textos do site público, da confirmação e da fatura aparecem no idioma escolhido, e a preferência mantém-se nas visitas seguintes.

> **Nota:** se a alteração não for aplicada, o botão regressa ao idioma anterior e surge uma mensagem a indicar que não foi possível mudar de idioma. Verifique a ligação e tente novamente (ver secção 3).

---

## 3. Resolução de Problemas Comuns

### 3.1 Tabela de problemas e soluções

| # | O que vê | Causa provável | O que fazer |
| --- | --- | --- | --- |
| 1 | **"O email e a palavra-passe não são reconhecidos."** | Credenciais erradas ou conta inexistente | Verifique maiúsculas, minúsculas e espaços; use uma conta de demonstração (1.5); se criou a conta agora, confirme o email utilizado no registo |
| 2 | **"Acesso negado"** ao abrir um portal | A conta tem outro perfil | Confirme o perfil da conta; hóspedes não acedem ao portal de administração |
| 3 | **"Não foi possível carregar a página"** ou erro interno | Falha temporária do servidor ou da base de dados | Recarregue com **Ctrl + F5**; aguarde 30 segundos e tente novamente; se persistir, use a Opção A (1.2) |
| 4 | Página abre mas **sem casas** | A base de dados ainda está a ser preparada | Recarregue a página uma vez após o primeiro carregamento |
| 5 | **"internal error; reference …"** na execução local | Estado local da base de dados corrompido | Pare o servidor (**Ctrl + C**), apague a pasta `.wrangler` e execute `npm run dev` novamente |
| 6 | **"A porta 3000 já está em uso"** | Outra instância do servidor está a correr | Feche o outro terminal ou execute `npx next dev -p 3001` e abra `http://localhost:3001` |
| 7 | **"As datas acabaram de ser reservadas"** | Outro utilizador reservou as mesmas noites primeiro | Escolha outras datas; nenhuma cobrança é efetuada |
| 8 | **"Esta noite foi fechada pelo anfitrião"** | O anfitrião marcou o dia como indisponível | Escolha outra data ou contacte o anfitrião |
| 9 | Datas que não selecionam | Dia riscado (indisponível) ou intervalo inválido | Consulte a legenda do calendário; a saída tem de ser posterior à entrada |
| 10 | **Idioma não muda** | Pedido de alteração não chegou ao servidor | Verifique a ligação, recarregue e tente novamente; o botão regressa ao idioma anterior quando falha |
| 11 | **Sessão terminou sozinha** | Sessão expirada (validade de 7 dias) ou cookie apagado | Volte a entrar com as mesmas credenciais |
| 12 | **"Não é possível abrir esta reserva"** | A reserva pertence a outra conta | Abra a reserva a partir do painel da conta que a criou |
| 13 | Fatura não descarrega | O browser bloqueou a janela de impressão | Permita janelas pop-up para o site e repita **Imprimir → Guardar como PDF** |
| 14 | Cancelamento recusado | A reserva já foi cancelada | Cada reserva só pode ser cancelada uma vez; confirme o estado no painel |
| 15 | Reembolso de **0%** | Cancelamento a menos de 7 dias do check-in | Consulte a tabela de escalões (2.3); o valor é calculado na data do cancelamento |
| 16 | Preço diferente do esperado | Preço personalizado definido pelo anfitrião para esse dia | Verifique o ponto dourado no calendário; o total mostrado antes de confirmar é o valor cobrado |
| 17 | Página de administração sem dados | Conta sem permissões de administrador | Use a conta `admin@plumguide.com` (1.5) |

### 3.2 Verificações rápidas

1. **Recarregue a página** com **Ctrl + F5** (**Cmd + Shift + R** no Mac).
2. **Confirme o endereço** na barra do navegador — deve começar por `https://` na versão online ou `http://localhost:3000` na versão local.
3. **Confirme a sessão**: se o cabeçalho mostrar **Entrar** em vez de **Sair**, a sessão terminou.
4. **Experimente outro navegador** ou uma janela privada, para excluir extensões e cache.
5. **Na versão local**, confirme que o terminal continua a mostrar o servidor em execução, sem mensagens de erro repetidas.

### 3.3 Como pedir ajuda

Se o problema persistir, reúna a seguinte informação antes de contactar o suporte:

- O endereço que estava a usar (online, máquina virtual ou `localhost`).
- O perfil com que estava autenticado.
- Os passos que seguiu imediatamente antes do erro.
- O texto exato da mensagem de erro (ou uma captura de ecrã).
- A data e a hora aproximadas.

**Contacto de demonstração:** `concierge@plumguide.com` (este endereço é ilustrativo e não recebe mensagens).

---

## Anexo A — Glossário

| Termo | Significado |
| --- | --- |
| **Plum Test** | Inspeção presencial feita por um especialista, com mais de 150 critérios de avaliação |
| **Pontuação Plum** | Resultado da inspeção, de 0 a 100; a aprovação automática ocorre a partir de **85** |
| **Aprovada Plum** | Estado de uma casa que passou a inspeção e está publicada na coleção |
| **Inspeção agendada** | Estado de uma casa com Plum Test marcado, ainda sem resultado |
| **Rascunho** | Casa submetida pelo anfitrião, ainda sem inspeção agendada |
| **Taxa de limpeza** | Valor fixo de **€180** por reserva |
| **Taxa de serviço** | **8%** sobre o subtotal das noites |
| **Noite ocupada** | Noite reservada por um hóspede; fica indisponível para todos os outros |
| **Noite fechada** | Noite que o anfitrião marcou como indisponível no calendário |
| **Referência `PLM-…`** | Código único da reserva, usado no apoio ao cliente |
| **Ajuste manual** | Alteração do reembolso feita por um administrador, registada com autor e data |
| **Painel** | Área privada de cada perfil, em `/dashboard/…` |

## Anexo B — Mapa rápido das páginas

| Página | Endereço | Para quem |
| --- | --- | --- |
| Página inicial | `/` | Todos |
| Coleção de casas | `/properties` | Todos |
| Detalhe e reserva | `/properties/[id]` | Todos |
| Confirmação | `/bookings/[id]/confirmation` | Hóspede da reserva, anfitrião ou administrador |
| Fatura | `/bookings/[id]/invoice` | Hóspede da reserva, anfitrião ou administrador |
| Entrar / Criar conta | `/login`, `/signup` | Visitantes |
| Painel do hóspede | `/dashboard/guest` | Hóspedes |
| Painel do anfitrião | `/dashboard/host` | Anfitriões |
| Painel do especialista | `/dashboard/specialist` | Especialistas |
| Painel do administrador | `/dashboard/admin` | Administradores |

## Anexo C — Exportar este manual para PDF

**Com Pandoc (recomendado):**

```bash
pandoc docs/manual-utilizador.md -o manual-utilizador.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=2.2cm \
  -V lang=pt-PT \
  --toc
```

**Sem instalar software:** abra a pré-visualização de Markdown no editor (ou o ficheiro no GitHub), use **Imprimir** e escolha **Guardar como PDF**. Neste caso, ative a opção de imprimir cabeçalhos e numeração de páginas.

**Antes de publicar:** substitua cada marcador `[Inserir Captura de Ecrã: …]` pela imagem correspondente, mantendo a legenda por baixo. As capturas devem ser feitas com o idioma **PT** ativo, exceto quando o passo se referir a um portal ainda em inglês.
