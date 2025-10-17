# Utiliser une image de base avec Maven et JDK 17
FROM maven:3.8.4-openjdk-17 AS build

# Copier le code source
WORKDIR /app
COPY . .

# Construire l'application
RUN mvn clean package -DskipTests

# Utiliser une image plus légère pour l'exécution
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copier le JAR depuis le stage de build
COPY --from=build /app/target/model-0.0.1-SNAPSHOT.jar app.jar

# Exposer le port et lancer l'application
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
