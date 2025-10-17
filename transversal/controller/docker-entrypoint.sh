#!/bin/sh

# Vérifie si le dossier node_modules est vide
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
  echo "node_modules directory is empty or does not exist. Installing dependencies with Bun..."
  bun install
else
  echo "node_modules directory already contains dependencies. Skipping bun install."
fi

# Exécute la commande principale (CMD) passée à l'ENTRYPOINT
exec "$@"
