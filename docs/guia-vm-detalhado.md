# Guia detalhado — pôr a aplicação a correr na VM

Este documento assume que **nunca trabalhaste com uma máquina virtual (VM)**. Explica cada comando, o que deve aparecer no ecrã e o que fazer quando aparece outra coisa.

Se já souberes o essencial e só quiseres o resumo, usa o `docs/guia-vm.md`. Este guia é o mesmo percurso, mas devagar.

---

## 0. Primeiro, o vocabulário

Cinco palavras que vais ver constantemente:

| Palavra | O que é, em uma frase |
| --- | --- |
| **VM** (máquina virtual) | Um computador Linux alugado ou cedido pela escola, que só se usa por linha de comandos. Não tem ambiente gráfico. |
| **SSH** | O programa que abre uma sessão de terminal *dentro* da VM a partir do teu computador. |
| **Terminal** | A janela preta onde escreves comandos. No Windows é o PowerShell. |
| **sudo** | "Executa este comando como administrador". Pede a password do teu utilizador na VM. |
| **porta** | Um número que identifica um serviço. O nginx fica na **80** (e 443 para HTTPS) e a aplicação Next.js na **3000**. Ninguém acede à 3000 diretamente: o nginx recebe e encaminha. |

O percurso completo é este:

```
O teu navegador
   │  http://lab.csmiguel.pt   (porta 80)
   ▼
nginx, dentro da VM          ← recebe o pedido e reenvia-o
   │  http://127.0.0.1:3000
   ▼
A aplicação Next.js          ← desenhada pelo "serviço" plum-guide
   │
   ▼
Base de dados D1 local       ← ficheiros em /opt/plum-guide-curation/.wrangler
```

---

## 1. Reúne quatro informações antes de começar

Sem estas quatro coisas não vale a pena continuar:

1. **O endereço IP da VM** — algo como `192.168.1.50` ou `10.0.0.23`.
2. **O nome de utilizador** na VM — por exemplo `aluno`, `ubuntu` ou o teu número.
3. **A password** desse utilizador (ou uma chave SSH, se te deram um ficheiro `.pem`).
4. **Quem controla o DNS** de `csmiguel.pt` — se não fores tu, tens de pedir a alguém da escola para criar o registo que aponta `lab.csmiguel.pt` para o IP da VM.

> **Se ainda não souberes o IP:** pergunta ao docente ou vê no painel da plataforma onde a VM foi criada (Proxmox, VirtualBox, Azure, etc.). Não é possível adivinhar.

---

## 2. Abrir o terminal no teu computador

No Windows:

1. Carrega na tecla **Windows**.
2. Escreve `powershell`.
3. Abre **Windows PowerShell** (não precisa de administrador).

Vais ver uma linha parecida com:

```
PS C:\Users\a11165>
```

Tudo o que neste guia aparece começado por `$` é para escrever aí (o `$` não se escreve).

---

## 3. Entrar na VM (SSH)

Escreve, substituindo o utilizador e o IP pelos teus:

```bash
ssh aluno@192.168.1.50
```

O que acontece na primeira vez:

```
The authenticity of host '192.168.1.50' can't be established.
ED25519 key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Escreve **`yes`** e Enter. Isto só acontece uma vez: estás a aceitar a identidade da máquina.

Depois pede a password:

```
aluno@192.168.1.50's password:
```

**A password não aparece enquanto escreves** — nem asteriscos. É normal. Escreve e Enter.

Quando entrares, o `prompt` muda de `PS C:\...>` para algo como:

```
aluno@vm-lab:~$
```

A partir daqui, **todos os comandos são executados dentro da VM**, não no teu computador.

### Se não conseguir ligar

| Mensagem | Significado | O que fazer |
| --- | --- | --- |
| `Connection timed out` | O IP está errado, a VM está desligada, ou a firewall bloqueia a porta 22 | Confirma o IP e se a VM está a correr; pergunta ao docente se o SSH está aberto |
| `Connection refused` | A máquina responde, mas não tem SSH a escutar | O serviço SSH pode estar parado — só o docente ou o painel da VM resolve |
| `Permission denied (publickey)` | A VM só aceita chave, não password | Pediste (ou recebeste) um ficheiro `.pem`: usa `ssh -i caminho\da\chave.pem aluno@IP` |
| `Could not resolve hostname` | Escreveste mal o nome | Usa o IP, não o domínio |

---

## 4. Atualizar o sistema

Dentro da VM:

```bash
sudo apt update
sudo apt upgrade -y
```

- O primeiro comando pede a password (a mesma do SSH). Ao escrever, não aparece nada — é normal.
- `update` atualiza a *lista* de pacotes; `upgrade` instala as versões novas.
- Pode demorar alguns minutos e mostrar muito texto. No fim, volta ao prompt.

Se aparecer uma pergunta azul sobre *restart services* ou *config files*, aceita a opção pré-selecionada (Enter).

---

## 5. Confirmar as ferramentas base

```bash
git --version
node -v
```

- `git --version` deve responder `git version 2.x`. Se disser `command not found`: `sudo apt install -y git`.
- `node -v` deve responder `v22.x` (ou superior). Se não existir ou for inferior a 22, instala agora:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs
node -v
```

O `curl` descarrega o instalador oficial do Node e o `| sudo bash -` executa-o. É seguro: é o repositório oficial da NodeSource.

---

## 6. Descarregar o projeto

Ainda dentro da VM, na tua pasta pessoal:

```bash
cd ~
git clone https://github.com/kitokaesu/plum-guide-curation.git
cd plum-guide-curation
ls
```

O `ls` deve listar algo como:

```
README.md  deploy  docs  next.config.mjs  package.json  prisma  scripts  src  ...
```

Se o `git clone` falhar com `Repository not found`, o repositório ainda não está público ou escreveste o URL com erro. Testa com:

```bash
curl -I https://github.com/kitokaesu/plum-guide-curation
```

Deve responder `HTTP/2 200`.

---

## 7. Criar o ficheiro de configuração

```bash
cp .env.example .env
```

Agora gera uma chave secreta (uma linha aleatória):

```bash
openssl rand -base64 32
```

Vai aparecer algo como `k3Jd8...==`. **Copia esse texto** (seleciona com o rato e Ctrl+Shift+C) e abre o `.env`:

```bash
nano .env
```

Dentro do `nano`:

1. Usa as setas para chegar à linha `AUTH_SECRET=...`.
2. Apaga o valor antigo com Backspace.
3. Cola o texto gerado (clique direito ou Ctrl+Shift+V).
4. **Gravar:** `Ctrl+O` e depois **Enter**.
5. **Sair:** `Ctrl+X`.

Confirma que ficou bem gravado:

```bash
grep AUTH_SECRET .env
```

Deve mostrar a linha com o teu valor. Este ficheiro nunca se publica nem se envia por email — é o segredo que assina as sessões.

> O `.env` está no `.gitignore`, por isso o Git ignora-o. É intencional.

---

## 8. Ensaio: correr a aplicação à mão

Antes de instalar serviços, testa o essencial. Dentro da pasta do projeto:

```bash
npm install
```

Demora um a três minutos. É normal ver avisos amarelos (`npm warn deprecated`); só é problema se terminar com `npm error`.

Depois:

```bash
npm run dev
```

Deve aparecer algo como:

```
▲ Next.js 16.x
- Local:        http://localhost:3000
- Network:      http://192.168.1.50:3000

✓ Ready in 4.2s
```

**Deixa esta janela aberta.** Abre uma **segunda** janela do PowerShell no teu computador e liga-te outra vez:

```bash
ssh aluno@192.168.1.50
curl -I http://127.0.0.1:3000
```

Resposta esperada na primeira linha: `HTTP/1.1 200 OK`.

- Se o `curl` disser `Connection refused`, a aplicação não arrancou: volta à primeira janela e lê o erro.
- Se disser `500`, a aplicação arrancou mas falhou a renderizar: é o caso da base de dados, tratado na secção 13.

Quando terminares o ensaio, volta à primeira janela e carrega em **`Ctrl+C`** para parar. O prompt volta — isso significa que parou.

> Porque é que a base de dados funciona aqui? Porque o `npm run dev` arranca também o Wrangler/Miniflare, que cria uma base D1 local em `.wrangler/state`. Um `npm run build && npm start` **não** tem esse mecanismo — é por isso que na VM o serviço usa `npm run dev`.

---

## 9. Instalar como serviço permanente

Agora que sabes que a aplicação funciona, deixa-a a correr sozinha, mesmo depois de fechares o SSH. Um único comando faz o resto:

```bash
cd ~/plum-guide-curation
sudo DOMAIN=lab.csmiguel.pt bash deploy/setup-vm.sh
```

O script demora alguns minutos e vai imprimir oito secções (`==> 1/8` … `==> 8/8`). No fim, duas linhas de verificação:

```
  127.0.0.1:3000  -> 200
  http://lab.csmiguel.pt  -> 200
```

Se as duas disserem `200`, está feito. (A segunda pode dizer `000` se o DNS ainda não apontar para a VM — não é grave nesta fase; a primeira é a que importa.)

Se preferires ver o estado do serviço:

```bash
systemctl status plum-guide --no-pager
```

O que procurar: a linha `Active: active (running)`. Para ver os últimos registos:

```bash
journalctl -u plum-guide -n 40 --no-pager
```

(Sai do `journalctl -f` com `Ctrl+C`.)

O script fez, por esta ordem: instalou `nginx`, o Node 22 e o `openssl`; criou o utilizador de sistema `plum`; clonou o projeto para `/opt/plum-guide-curation`; instalou as dependências; gerou o `.env` com um segredo novo; registou o serviço; configurou o nginx para `lab.csmiguel.pt`.

---

## 10. Verificar o nginx

```bash
sudo nginx -t
curl -I http://lab.csmiguel.pt
```

`nginx -t` deve dizer `syntax is ok` e `test is successful`. O `curl` deve devolver `200`.

Interpretação:

| Código | Significado |
| --- | --- |
| `200` | Tudo certo. |
| `502 Bad Gateway` | O nginx está bem, a aplicação não: `systemctl status plum-guide`. |
| `000` / `Could not resolve` | O nome `lab.csmiguel.pt` ainda não aponta para esta VM. Testa por IP: `curl -I http://<IP-da-VM>`. |
| `403` | Ficheiros com permissões erradas: `sudo chown -R plum:plum /opt/plum-guide-curation`. |

---

## 11. Abrir a firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

A primeira linha é essencial: garante que não te trancas fora da VM.

O `ufw status` deve mostrar:

```
80/tcp     ALLOW
443/tcp    ALLOW
OpenSSH    ALLOW
```

> Se a VM estiver numa rede da escola, o firewall da VM pode não ser o único: confirma com o responsável que o tráfego de entrada nas portas 80/443 chega à máquina.

---

## 12. HTTPS (opcional, mas recomendado)

Só faz sentido depois de `http://lab.csmiguel.pt` responder `200`. O certificado é emitido para um nome de domínio, não para um IP.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lab.csmiguel.pt
```

Perguntas que vão aparecer:

| Pergunta | Resposta |
| --- | --- |
| Email for renewal notices | O teu email |
| Agree to the Terms of Service | `A` (agree) |
| Redirect HTTP to HTTPS? | `2` (redirect) — recomendado |

No fim, confirma que a renovação automática está a funcionar:

```bash
sudo certbot renew --dry-run
```

---

## 13. Quando algo falha

Ordem de diagnóstico — segue-a de cima para baixo, porque cada passo isola metade dos problemas:

```bash
# 1. O serviço está vivo?
systemctl status plum-guide --no-pager

# 2. A aplicação responde localmente?
curl -I http://127.0.0.1:3000

# 3. O nginx chega lá?
curl -I http://lab.csmiguel.pt

# 4. O que dizem os registos?
journalctl -u plum-guide -n 60 --no-pager
sudo tail -n 40 /var/log/nginx/error.log
```

Casos concretos:

| Sintoma | Causa | Comando que resolve |
| --- | --- | --- |
| `Active: failed` | A aplicação não arranca | Ver o erro em `journalctl -u plum-guide -n 60` |
| `EADDRINUSE` | Outra instância na porta 3000 | `sudo ss -lptn 'sport = :3000'` e parar o processo indicado |
| `502` no nginx, `200` no local | nginx com configuração antiga | `sudo nginx -t && sudo systemctl reload nginx` |
| Páginas 500 com `internal error; reference …` | Estado da base D1 local inconsistente | `sudo systemctl stop plum-guide`, `sudo rm -rf /opt/plum-guide-curation/.wrangler`, `sudo systemctl start plum-guide` |
| `Permission denied` em `.next` | Ficheiros de outro utilizador | `sudo chown -R plum:plum /opt/plum-guide-curation` |
| Alterações não aparecem | O serviço não foi reiniciado | `sudo systemctl restart plum-guide` |
| O browser mostra "site não seguro" | Só com HTTP, sem certificado | Secção 12 |

Se nada disto resolver, guarda a saída destes quatro comandos — é a informação que qualquer ajuda vai pedir:

```bash
systemctl status plum-guide --no-pager
journalctl -u plum-guide -n 60 --no-pager
sudo nginx -t
node -v && npm -v
```

---

## 14. Atualizar a aplicação mais tarde

```bash
cd ~/plum-guide-curation
git pull
sudo git -C /opt/plum-guide-curation pull
sudo npm --prefix /opt/plum-guide-curation install
sudo systemctl restart plum-guide
```

A forma mais simples é repetir o script, que faz tudo:

```bash
sudo DOMAIN=lab.csmiguel.pt bash ~/plum-guide-curation/deploy/setup-vm.sh
```

---

## 15. Parar, arrancar e desinstalar

```bash
sudo systemctl stop plum-guide       # parar
sudo systemctl start plum-guide      # arrancar
sudo systemctl restart plum-guide    # reiniciar
sudo systemctl disable plum-guide    # não arrancar com o sistema
```

Para deixar de publicar o site (mantendo os ficheiros):

```bash
sudo rm /etc/nginx/sites-enabled/plum-guide
sudo systemctl reload nginx
```

---

## 16. Resumo em uma página

```bash
# no teu computador
ssh aluno@<IP-da-VM>

# dentro da VM
sudo apt update && sudo apt upgrade -y
git clone https://github.com/kitokaesu/plum-guide-curation.git
cd plum-guide-curation
cp .env.example .env && nano .env          # colar: openssl rand -base64 32
npm install && npm run dev                  # ensaio; parar com Ctrl+C
sudo DOMAIN=lab.csmiguel.pt bash deploy/setup-vm.sh
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
curl -I http://lab.csmiguel.pt               # 200 = pronto
sudo certbot --nginx -d lab.csmiguel.pt      # opcional: HTTPS
```

Contas de demonstração: `guest@plumguide.com` / `Guest123!` e `host@plumguide.com` / `Host123!`.
