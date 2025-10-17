# Stage 1: Base
FROM oven/bun:alpine AS base
WORKDIR /app
COPY package.json ./

# Stage 2: Développement
FROM base AS development
COPY . .
# Ajout d'un script d'entrée pour gérer les dépendances et le démarrage
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "run", "dev"]
