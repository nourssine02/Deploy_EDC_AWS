# Dockerfile.backend

# Étape 1: Utiliser une image Node.js officielle comme image de base
FROM node:16-alpine AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm install --only=production

# Copier le reste du code source dans le conteneur
COPY . .

# Exposer le port 5001 pour accéder à l'application
EXPOSE 5001

# Démarrer l'application
CMD ["node", "server.js"]
