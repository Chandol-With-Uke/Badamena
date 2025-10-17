# Utiliser l'image officielle de Bun
FROM oven/bun:1

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances. On ne copie plus le lockfile.
COPY package.json ./

# Installer les dépendances
RUN bun install

# Copier le reste du code source
COPY . .

# Exposer le port que l'application utilisera
EXPOSE 4000

# Commande pour lancer l'application
CMD ["bun", "start"]
