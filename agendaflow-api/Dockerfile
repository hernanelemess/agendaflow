FROM node:20-alpine AS runtime

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodeapp -G nodejs

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN chown -R nodeapp:nodejs /app

USER nodeapp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]