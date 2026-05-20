# =============================================================================
# DOCKERFILE — agendaflow-front (React + Vite)
# Multi-stage: estágio de build (Vite) + runtime (Nginx servindo estáticos)
# =============================================================================

# -----------------------------------------------------------------------------
# ESTÁGIO 1: build
# Usa Node para compilar o React com Vite e gerar os arquivos estáticos.
# Este estágio inteiro é descartado após o build — não vai para produção.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copia dependências e instala (incluindo devDependencies — Vite é devDependency)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código-fonte
COPY . .

# ⚠️ ADAPTE: se sua API não rodar em localhost:3000 em produção,
# crie um arquivo .env.production com VITE_API_URL=https://sua-api.com
# e o Vite vai usar automaticamente durante o build
RUN npm run build
# O resultado fica em /app/dist

# -----------------------------------------------------------------------------
# ESTÁGIO 2: runtime com Nginx
# Nginx é muito mais eficiente que Node para servir arquivos estáticos.
# A imagem nginx:alpine tem apenas ~25MB.
# -----------------------------------------------------------------------------
FROM nginx:alpine AS runtime

# ⚠️ SEGURANÇA: remove o usuário root do Nginx e roda como nginx (uid 101)
# A imagem oficial nginx:alpine já inclui o usuário nginx

# Copia a configuração customizada do Nginx
# ⚠️ ADAPTE: veja o arquivo nginx.conf gerado junto com este Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados pelo Vite para o diretório que o Nginx serve
COPY --from=build /app/dist /usr/share/nginx/html

# Ajusta permissões para o usuário nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

# Healthcheck: testa se o Nginx está respondendo
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
