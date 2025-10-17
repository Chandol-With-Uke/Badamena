# Stage 1: Build - Pour compiler l'application et cacher les dépendances Maven
FROM maven:3.8.4-openjdk-17 AS builder

WORKDIR /app

# Copier uniquement le fichier pom.xml pour tirer parti du cache de Docker
# Cela garantit que les dépendances ne sont re-téléchargées que si le pom.xml change
COPY pom.xml .

# Télécharger toutes les dépendances Maven
# Utilisez dependency:go-offline pour télécharger sans compiler l'application
# Ou mvn clean install -DskipTests si vous voulez aussi un build des dépendances du projet
RUN mvn dependency:go-offline -Dmaven.repo.local=/usr/share/maven/ref/repository

# Copier le reste du code source
COPY src ./src

# Compiler l'application
RUN mvn clean package -DskipTests -Dmaven.repo.local=/usr/share/maven/ref/repository


# Stage 2: Production - Pour exécuter l'application compilée
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copier le JAR compilé depuis le stage 'builder'
# Assurez-vous que le nom du JAR correspond à celui de votre projet Maven
COPY --from=builder /app/target/model-0.0.1-SNAPSHOT.jar app.jar

# Exposer le port sur lequel l'application Spring Boot écoute
EXPOSE 8080

# Définir la commande pour lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
