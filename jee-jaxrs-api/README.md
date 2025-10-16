# Projet API JAX-RS avec PostgreSQL et Redis

Ce projet est une application web Java EE utilisant JAX-RS pour exposer une API REST simple. L'application affiche des données de produits qui sont stockées dans une base de données PostgreSQL et mises en cache dans Redis. L'ensemble de l'environnement (application, base de données, cache) est orchestré à l'aide de Docker Compose.

## 1. Architecture des Données

Les données de l'application ne proviennent pas d'une source externe fixe, mais sont générées au moment du lancement :

-   **Base de données PostgreSQL** : Au démarrage de l'application, la base de données est automatiquement peuplée avec **50 produits** factices, chacun ayant un nom et un nombre de ventes aléatoire.
-   **Cache Redis** : Immédiatement après la création des produits, l'application interroge la base de données PostgreSQL pour trouver les **20 produits les plus vendus** et les stocke dans un cache Redis pour un accès rapide.

## 2. Pages Frontend

L'interface utilisateur est simple et se compose de trois pages JSP situées dans `src/main/webapp/` :

-   `index.jsp` : La page d'accueil qui sert de portail vers les deux autres pages.
-   `products.jsp` : Affiche la liste complète des **50 produits** en les récupérant directement depuis **PostgreSQL**.
-   `top-products.jsp` : Affiche le classement des **20 produits les plus vendus** en les récupérant depuis le cache **Redis**.

## 3. Lancer le Projet

L'ensemble du projet est conçu pour être lancé avec Docker.

### Étape 1 : Build Maven (Optionnel)

Le projet utilise Maven pour compiler le code source Java et le packager dans un fichier `.war`.

```bash
mvn clean package
```

> **Note** : Le répertoire `target`, qui contient le fichier `.war` résultant, est déjà inclus dans ce dépôt Git. Par conséquent, il n'est **pas nécessaire** d'exécuter cette commande si vous n'avez pas modifié le code Java. Vous ne devez reconstruire le projet que si vous apportez des modifications aux fichiers `.java`.

### Étape 2 : Lancer avec Docker Compose

La commande principale pour lancer l'ensemble de l'environnement est :

```bash
docker-compose up --build
```

-   **Pourquoi `docker-compose up` ?** Cette commande lit le fichier `docker-compose.yaml` et démarre tous les services définis : l'application web, la base de données PostgreSQL et le cache Redis.
-   **Pourquoi l'option `--build` ?** Cette option force Docker à reconstruire l'image de l'application. Il est important de l'utiliser **chaque fois que vous modifiez le code** (Java ou JSP) et que vous reconstruisez le `.war` avec Maven, pour s'assurer que la nouvelle version de l'application est bien utilisée. Si vous n'avez rien changé, un simple `docker-compose up` suffit.

Une fois les conteneurs lancés, l'application est accessible à l'adresse [http://localhost:8080/jee-jaxrs-api/](http://localhost:8080/jee-jaxrs-api/).

## 4. Commandes Docker Utiles

Voici quelques commandes Docker Compose utiles pour la gestion de ce projet :

-   **Démarrer les services (avec reconstruction)** :
    ```bash
    docker-compose up --build
    ```

-   **Démarrer les services en arrière-plan** :
    ```bash
    docker-compose up -d
    ```

-   **Arrêter et supprimer les conteneurs, réseaux et volumes** :
    ```bash
    docker-compose down
    ```

-   **Voir les logs de l'application en temps réel** :
    ```bash
    docker-compose logs -f backend
    ```

-   **Lister les conteneurs en cours d'exécution** :
    ```bash
    docker-compose ps
    ```
