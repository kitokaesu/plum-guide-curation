# Guia de instalação na VM — lab.csmiguel.pt

Este guia põe a aplicação a correr numa máquina virtual Linux (Ubuntu/Debian) e acessível em `http://lab.csmiguel.pt`, através do nginx como *reverse proxy*.

```
Navegador  →  nginx (porta 80/443)  →  next dev (127.0.0.1:3000)  →  D1 local (.wrangler/state)
```

> Se nunca trabalhaste numa VM, começa pelo [`guia-vm-detalhado.md`](guia-vm-detalhado.md): tem os mesmos passos, mas com o resultado esperado de cada comando e a explicação do que fazer quando o resultado é outro.

---

## 0. Antes de começar

Precisas de:

| Requisito | Como confirmar |
| --- | --- |
| Endereço IP da VM | Fornecido pelo docente / painel da VM |
| Acesso SSH com `sudo` | `ssh utilizador@lab.csmiguel.pt` (ou pelo IP) |
| O domínio `lab.csmiguel.pt` a apontar para a VM | Pedido ao responsável de TI da escola, se ainda não apontar |
| Portas 80 e 443 abertas | Firewall da escola e da VM |

> **Se não controlares o DNS:** podes testar tudo por IP (`http://<ip-da-vm>`) e só depois pedir o registo `A lab.csmiguel.pt → <ip-da-vm>`.

---

## 1. Apontar o domínio para a VM

No painel de DNS da escola, cria (ou pede) um registo:

| Tipo | Nome | Valor | TTL |
| --- | --- | --- | --- |
| A | `lab` | `<IP público da VM>` | 300 |

Confirma a propagação a partir da VM:

```bash
sudo apt-get install -y dnsutils
dig +short lab.csmiguel.pt
```

Deve devolver o IP da VM. Se devolver outro endereço, o problema é de DNS e não da aplicação.

> Se a VM estiver atrás de NAT, é também necessário encaminhar as portas 80 e 443 do exterior para ela.

---

## 2. Entrar na máquina

```bash
ssh utilizador@lab.csmiguel.pt
sudo -v          # confirma que tens privilégios
```

---

## 3. Obter o código

O repositório é público, por isso não é preciso autenticação:

```bash
git clone https://github.com/kitokaesu/plum-guide-curation.git
cd plum-guide-curation
```

---

## 4. Instalação automática (recomendada)

Um único comando instala o Node.js 22, as dependências, o serviço systemd e o nginx:

```bash
sudo DOMAIN=lab.csmiguel.pt bash deploy/setup-vm.sh
```

O script:

1. Instala `git`, `curl`, `nginx` e `openssl`.
2. Instala o Node.js 22 (se ainda não existir).
3. Cria o utilizador de sistema `plum`.
4. Clona o repositório para `/opt/plum-guide-curation`.
5. Instala as dependências (`npm install`).
6. Cria o `.env` e gera um `AUTH_SECRET` aleatório.
7. Instala e arranca o serviço `plum-guide` (systemd).
8. Configura o nginx para `lab.csmiguel.pt` e recarrega-o.

No fim deve imprimir dois códigos HTTP. `200` no primeiro é o sinal de que a aplicação está viva.

### 4.1 Instalação manual (se preferires controlar cada passo)

```bash
sudo apt-get update
sudo apt-get install -y git curl nginx openssl

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs
node -v    # deve ser v22.x

# Utilizador e código
sudo useradd --system --create-home --shell /usr/sbin/nologin plum
sudo mkdir -p /opt
sudo git clone https://github.com/kitokaesu/plum-guide-curation.git /opt/plum-guide-curation
cd /opt/plum-guide-curation
sudo npm install

# Configuração
sudo cp .env.example .env
openssl rand -base64 32     # copiar o resultado para AUTH_SECRET no .env
sudo nano .env

# Permissões
sudo chown -R plum:plum /opt/plum-guide-curation

# Serviço
sudo cp deploy/plum-guide.service /etc/systemd/system/plum-guide.service
sudo systemctl daemon-reload
sudo systemctl enable --now plum-guide
systemctl status plum-guide --no-pager

# Nginx
sudo sed 's|lab.csmiguel.pt|lab.csmiguel.pt|' deploy/nginx-lab.csmiguel.pt.conf \
  | sudo tee /etc/nginx/sites-available/plum-guide >/dev/null
sudo ln -sf /etc/nginx/sites-available/plum-guide /etc/nginx/sites-enabled/plum-guide
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. Verificar

Na VM:

```bash
systemctl status plum-guide --no-pager     # "active (running)"
curl -I http://127.0.0.1:3000              # 200
curl -I http://lab.csmiguel.pt             # 200
sudo tail -f /var/log/nginx/error.log      # sem erros repetidos
```

No teu computador, abre <http://lab.csmiguel.pt> e confirma:

- A página inicial carrega com casas.
- O botão **Entrar** funciona com `guest@plumguide.com` / `Guest123!`.
- O seletor **EN | PT** muda o idioma.

> O primeiro pedido pode demorar alguns segundos: é quando a aplicação cria o esquema e os dados de demonstração na base D1 local.

---

## 6. Abrir a firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Se a VM estiver numa rede da escola, confirma também com o responsável que o tráfego de entrada nas portas 80/443 é permitido.

---

## 7. HTTPS (recomendado)

Com o DNS já a apontar para a VM:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lab.csmiguel.pt
```

O Certbot obtém o certificado, altera a configuração do nginx e renova automaticamente. Testa a renovação com:

```bash
sudo certbot renew --dry-run
```

---

## 8. Atualizar a aplicação

Sempre que houver alterações no repositório:

```bash
cd /opt/plum-guide-curation
sudo git pull
sudo npm install          # só se package.json mudou
sudo systemctl restart plum-guide
```

Ou, de forma mais simples, volta a correr o script: `sudo DOMAIN=lab.csmiguel.pt bash deploy/setup-vm.sh`.

---

## 9. Problemas comuns

| Sintoma | Causa provável | Resolução |
| --- | --- | --- |
| `502 Bad Gateway` no nginx | A aplicação não está a correr na porta 3000 | `systemctl status plum-guide` e `journalctl -u plum-guide -n 50` |
| `curl 127.0.0.1:3000` recusa ligação | Serviço parado ou a arrancar | `sudo systemctl restart plum-guide`; ver os logs |
| `lab.csmiguel.pt` não abre, o IP abre | DNS ainda não propagou | `dig +short lab.csmiguel.pt`; aguardar o TTL |
| Página abre sem casas | Base de dados a ser criada no primeiro pedido | Recarregar após alguns segundos |
| Páginas com dados devolvem erro 500 com `internal error; reference …` | Estado local da base D1 inconsistente | `sudo systemctl stop plum-guide`, apagar `/opt/plum-guide-curation/.wrangler`, `sudo systemctl start plum-guide` |
| `EADDRINUSE` nos logs | Outra instância na porta 3000 | `sudo ss -lptn 'sport = :3000'` e parar o processo antigo |
| Alterações não aparecem | Serviço não foi reiniciado | `sudo systemctl restart plum-guide` |
| Permissão negada em `.next` | Ficheiros criados por outro utilizador | `sudo chown -R plum:plum /opt/plum-guide-curation` |

---

## 10. Limitações desta instalação

- **Corre em modo de desenvolvimento.** A aplicação lê a base de dados pelo *binding* D1, que só existe quando o `next dev` (via Wrangler/Miniflare) está a correr. Por isso o serviço usa `npm run dev`, não `npm run build && npm start`. É adequado para demonstração e avaliação, não para produção: o modo de desenvolvimento recompila páginas e consome mais CPU e memória.
- **A base de dados é local à VM** (`.wrangler/state`). Não é partilhada com o site publicado no Cloudflare, pelo que os dados das duas instalações são independentes.
- **Caminho de produção:** para servir tráfego real, o destino é Cloudflare Workers com D1 gerido (é o que está publicado), ou adaptar a persistência para PostgreSQL e usar o *build* de produção com transações.

---

## 11. Resumo dos comandos

```bash
# tudo de uma vez, na VM
git clone https://github.com/kitokaesu/plum-guide-curation.git
cd plum-guide-curation
sudo DOMAIN=lab.csmiguel.pt bash deploy/setup-vm.sh

# verificação
systemctl status plum-guide --no-pager
curl -I http://lab.csmiguel.pt

# HTTPS
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lab.csmiguel.pt
```
