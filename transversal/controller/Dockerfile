# Utiliser l'image officielle de Bun en version alpine
FROM oven/bun:alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances.
COPY package.json ./

# Installer les dépendances (sera géré par l'entrypoint au runtime)
# RUN bun install

# Copier le reste du code source
COPY . .

# Ajout d'un script d'entrée pour gérer les dépendances et le démarrage
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

# Exposer le port que l'application utilisera
EXPOSE 4000

# Commande pour lancer l'application
CMD ["bun", "start"]
