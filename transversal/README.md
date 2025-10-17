# Dashboard Transversal (MVC)

## 1. Introduction

Ce projet est une application web de type **dashboard** conçue avec une architecture **Modèle-Vue-Contrôleur (MVC)** stricte. Son objectif principal est pédagogique : démontrer une séparation claire des responsabilités en utilisant des technologies distinctes pour chaque couche de l'application.

*   Le **Modèle** gère la logique métier et la persistance des données.
*   Le **Contrôleur** agit comme une passerelle sécurisée pour acheminer les requêtes.
*   La **Vue** est responsable de l'interface utilisateur et des interactions.

## 2. Architecture et Technologies Utilisées

L'application est composée de trois services indépendants, chacun dans son propre répertoire et conteneur Docker, orchestrés par Docker Compose.

### 2.1. Modèle (`/model`)

*   **Technologie**: **Spring Boot** (Java)
*   **Base de données**: **PostgreSQL**
*   **Responsabilités**:
    *   Gérer la logique métier (CRUD, validations).
    *   Interagir avec la base de données PostgreSQL.
    *   Exposer une API **GraphQL** pour l'accès aux données.
    *   **Sécurité**: Intègre **Spring Security** pour autoriser l'accès à son API GraphQL **uniquement** si la requête provient du Contrôleur et contient un secret interne partagé.

### 2.2. Contrôleur (`/controller `)

*   **Technologie**: **Bun** avec le framework **Hono** (TypeScript)
*   **Responsabilités**:
    *   Servir de **passerelle sécurisée** entre la Vue et le Modèle.
    *   Recevoir les requêtes GraphQL de la Vue.
    *   Valider les tokens **JWT** reçus de la Vue pour l'authentification utilisateur.
    *   Transmettre les requêtes validées à l'API GraphQL du Modèle, en incluant un secret interne pour l'authentification inter-services.
    *   Retourner les réponses du Modèle à la Vue.
    *   **Ne contient aucune logique métier.**

### 2.3. Vue (`/view`)

*   **Technologie**: **React** (avec Vite pour le développement rapide)
*   **Librairies UI**: **TailwindCSS** et **Shadcn/UI** pour un design moderne et réactif.
*   **Responsabilités**:
    *   Construire l'interface utilisateur du dashboard.
    *   Utiliser **Apollo Client** pour envoyer des requêtes GraphQL au Contrôleur.
    *   Gérer le stockage du token JWT côté client.
    *   Afficher les données et permettre les interactions utilisateur.

## 3. Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé les éléments suivants sur votre machine :

*   **Docker Desktop** (inclut Docker Engine et Docker Compose) : [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
*   Un éditeur de code (par exemple, **VS Code**) est fortement recommandé.

## 4. Lancement de l'Application (Guide Détaillé pour Débutants)

Suivez ces étapes pour lancer l'ensemble de l'application :

1.  **Ouvrir un Terminal :**
    *   Sur Windows, utilisez PowerShell ou Git Bash.
    *   Sur macOS/Linux, utilisez votre terminal habituel.

2.  **Naviguer vers le Répertoire du Projet :**
    *   Utilisez la commande `cd` (change directory) pour vous rendre dans le répertoire racine de ce projet (là où se trouve ce fichier `README.md` et le fichier `docker-compose.yml`).
    *   Exemple : `cd /home/boywithuke/Project/Badamena/transversal` (adaptez ce chemin à l'endroit où vous avez cloné/téléchargé le projet).

3.  **Lancer les Services avec Docker Compose :**
    *   Dans le terminal, exécutez la commande suivante :
        ```bash
        docker-compose up --build -d
        ```
    *   **Explication de la commande :**
        *   `docker-compose up` : Démarre tous les services définis dans le fichier `docker-compose.yml`.
        *   `--build` : Force la reconstruction des images Docker pour chaque service. C'est important lors du premier lancement ou après des modifications dans les `Dockerfile` ou le code source des services.
        *   `-d` : Lance les services en mode "détaché" (en arrière-plan), ce qui vous permet de continuer à utiliser votre terminal.

    *   **Attendez la fin :** Cette étape peut prendre quelques minutes, surtout la première fois, car Docker doit télécharger les images de base et construire les images de vos services. Vous verrez des messages de construction et de démarrage dans le terminal.

4.  **Vérifier le Statut des Services :**
    *   Une fois la commande `docker-compose up` terminée, vous pouvez vérifier que tous les services sont bien en cours d'exécution avec :
        ```bash
        docker-compose ps
        ```
    *   Vous devriez voir une liste de vos services (`model`, `controller`, `view`, `db`) avec leur statut `Up` (en cours d'exécution).

5.  **Accéder à l'Application :**

    *   **Vue (Frontend React) :**
        *   Ouvrez votre navigateur web et allez à l'adresse : `http://localhost:5173`
        *   C'est ici que vous interagirez avec le dashboard.

    *   **Contrôleur (Backend Hono) :**
        *   Le contrôleur écoute sur le port `4000`. Vous pouvez le tester en allant sur : `http://localhost:4000`
        *   Vous devriez voir un message de confirmation.

    *   **Modèle (Backend Spring Boot - GraphiQL) :**
        *   Le modèle expose son API GraphQL. Pour la tester directement (utile pour le développement), vous pouvez accéder à l'interface GraphiQL sur : `http://localhost:8080/graphiql`
        *   **Note importante :** L'accès direct à `/graphql` sur le modèle est sécurisé et n'est autorisé que pour le contrôleur via le secret interne.

## 5. Flux de Données Simplifié

Pour comprendre comment les services interagissent :

1.  **Connexion (Vue -> Contrôleur) :** L'utilisateur se connecte via la **Vue**. La Vue envoie les identifiants au **Contrôleur**.
2.  **Authentification JWT (Contrôleur) :** Le Contrôleur vérifie les identifiants (potentiellement en interrogeant le Modèle pour la validation) et génère un token JWT qu'il renvoie à la Vue. La Vue stocke ce token.
3.  **Requêtes Protégées (Vue -> Contrôleur) :** Pour toute requête de données (ex: "afficher les produits"), la Vue envoie une requête GraphQL avec le token JWT dans les en-têtes au **Contrôleur**.
4.  **Validation JWT et Relais (Contrôleur -> Modèle) :** Le Contrôleur valide le token JWT. Si valide, il transmet la requête GraphQL au **Modèle** en ajoutant un en-tête `X-Internal-Auth` contenant le secret interne partagé.
5.  **Authentification Inter-services (Modèle) :** Le Modèle, grâce à Spring Security, valide l'en-tête `X-Internal-Auth`. Si le secret est correct, il exécute la requête sur PostgreSQL et renvoie les données.
6.  **Affichage (Modèle -> Contrôleur -> Vue) :** Les données remontent au Contrôleur, puis à la Vue pour être affichées à l'utilisateur.

## 6. Arrêter l'Application

Pour arrêter tous les services Docker et nettoyer les conteneurs :

1.  Retournez dans le terminal où vous avez lancé l'application (ou ouvrez un nouveau terminal et naviguez vers le répertoire racine du projet).
2.  Exécutez la commande :
    ```bash
    docker-compose down
    ```
    *   Cette commande arrête et supprime les conteneurs, les réseaux et les volumes créés par `docker-compose up`.

## 7. Développement

*   Si vous modifiez le code source d'un service (par exemple, Java dans le `model`, TypeScript dans le `controller` ou `view`), vous devrez généralement reconstruire et redémarrer ce service.
*   Pour reconstruire un service spécifique (ex: `model`) : `docker-compose up --build -d model`
*   Pour redémarrer tous les services après des changements de code : `docker-compose down && docker-compose up --build -d` (cela garantit une reconstruction propre).
