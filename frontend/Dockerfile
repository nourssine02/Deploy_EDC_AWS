# Dockerfile.frontend

# Étape 1: Utiliser Nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copier les fichiers de build existants
COPY build /usr/share/nginx/html

# Exposer le port 80 pour le serveur Nginx
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
