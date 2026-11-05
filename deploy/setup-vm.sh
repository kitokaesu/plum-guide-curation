#!/usr/bin/env bash
# Instalação da Plum Guide numa VM Ubuntu/Debian.
#
#   sudo DOMAIN=lab.csmiguel.pt bash deploy/setup-vm.sh
#
# O script é seguro de repetir: atualiza o código, reinstala dependências
# e recarrega os serviços.

set -euo pipefail

DOMAIN="${DOMAIN:-lab.csmiguel.pt}"
APP_DIR="${APP_DIR:-/opt/plum-guide-curation}"
REPO="${REPO:-https://github.com/kitokaesu/plum-guide-curation.git}"
APP_USER="${APP_USER:-plum}"
PORT="${PORT:-3000}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Execute com sudo (ou como root)." >&2
  exit 1
fi

echo "==> 1/8 Pacotes base"
apt-get update -qq
apt-get install -y -qq git curl ca-certificates nginx openssl

echo "==> 2/8 Node.js 22"
if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
node -v
npm -v

echo "==> 3/8 Utilizador de serviço"
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
fi

echo "==> 4/8 Código"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO" "$APP_DIR"
fi

echo "==> 5/8 Dependências"
cd "$APP_DIR"
npm install --no-audit --no-fund

echo "==> 6/8 Configuração (.env)"
[ -f .env ] || cp .env.example .env
if grep -q 'replace-with-a-long-random-string' .env; then
  SECRET="$(openssl rand -base64 32)"
  sed -i "s|replace-with-a-long-random-string|${SECRET}|" .env
  echo "AUTH_SECRET gerado e gravado em .env"
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "==> 7/8 Serviço systemd"
sed -e "s|/opt/plum-guide-curation|${APP_DIR}|g" \
    -e "s|User=plum|User=${APP_USER}|" \
    -e "s|Group=plum|Group=${APP_USER}|" \
    -e "s|PORT=3000|PORT=${PORT}|" \
    deploy/plum-guide.service > /etc/systemd/system/plum-guide.service
systemctl daemon-reload
systemctl enable plum-guide >/dev/null 2>&1
systemctl restart plum-guide
sleep 4
systemctl --no-pager --lines=8 status plum-guide || true

echo "==> 8/8 Nginx"
sed -e "s|lab.csmiguel.pt|${DOMAIN}|g" \
    -e "s|127.0.0.1:3000|127.0.0.1:${PORT}|" \
    deploy/nginx-lab.csmiguel.pt.conf > /etc/nginx/sites-available/plum-guide
ln -sf /etc/nginx/sites-available/plum-guide /etc/nginx/sites-enabled/plum-guide
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo
echo "==> Verificação"
curl -s -o /dev/null -w "  127.0.0.1:${PORT}  -> %{http_code}\n" "http://127.0.0.1:${PORT}/" || true
curl -s -o /dev/null -w "  http://${DOMAIN}  -> %{http_code}\n" "http://${DOMAIN}/" || true
echo
echo "Instalação concluída."
echo "Falta: abrir a firewall (ufw allow 80,443) e, se quiseres HTTPS,"
echo "  apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d ${DOMAIN}"
