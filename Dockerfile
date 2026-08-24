# Dockerfile para m-site (Static Site)
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia todos os arquivos do site para o container
COPY . .

# Porta 8080: site não usa 3000 no host (API m-manage em localhost:3000)
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

CMD ["node", "server.mjs"]
