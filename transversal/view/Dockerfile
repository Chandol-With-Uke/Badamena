# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./

# Stage 2: Dépendances
FROM base AS deps
RUN npm install -g bun
RUN bun install

# Stage 3: Développement
FROM deps AS development
COPY . .
CMD ["bun", "run", "dev"]
