FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências (use install ao invés de ci)
RUN npm install --production=false

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção
FROM node:20-alpine

WORKDIR /app

# Copiar apenas o necessário do builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expor porta (será sobrescrita por variável de ambiente)
EXPOSE 3003

# Comando para iniciar
CMD ["node", "dist/main.js"]