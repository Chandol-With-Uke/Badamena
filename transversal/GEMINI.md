# Présentation du Projet : Dashboard Transversal (MVC)

Ce document fournit une vue d'ensemble de l'architecture, des technologies et des objectifs du projet de dashboard.

## 1. Objectif du Projet

L'objectif est de construire une application web de type **dashboard** en suivant une architecture **Modèle-Vue-Contrôleur (MVC)** stricte. Ce projet a un but pédagogique : démontrer la séparation claire des responsabilités en utilisant des technologies distinctes pour chaque couche de l'application.

-   Le **Modèle** gérera toute la logique métier et la persistance des données.
-   Le **Contrôleur** agira comme une simple passerelle (gateway) pour acheminer les requêtes.
-   La **Vue** sera responsable de l'affichage et de l'interaction avec l'utilisateur.

## 2. Architecture et Technologies

L'application est divisée en trois services indépendants, chacun dans son propre répertoire et conteneur Docker.

### Modèle (`/model`)

-   **Technologie**: **Spring Boot** (Java)
-   **Responsabilités**:
    -   Gérer la logique métier (CRUD, validations, etc.).
    -   Communiquer avec la base de données.
    -   Définir et exposer une API **GraphQL** pour que le contrôleur puisse accéder aux données.
    -   Gérer l'authentification et la génération des tokens **JWT**.
-   **Base de données**: **PostgreSQL**

### Contrôleur (`/controller`)

-   **Technologie**: **Bun** avec **Hono**
-   **Responsabilités**:
    -   Servir de **passerelle sécurisée** entre la Vue et le Modèle.
    -   Recevoir les requêtes GraphQL de la Vue.
    -   Valider les tokens JWT reçus de la Vue.
    -   Transmettre les requêtes validées à l'API GraphQL du Modèle.
    -   Retourner les réponses du Modèle à la Vue.
    -   **Ne contient aucune logique métier.**

### Vue (`/view`)

-   **Technologie**: **React** (avec Vite)
-   **Responsabilités**:
    -   Construire l'interface utilisateur du dashboard.
    -   Utiliser **Apollo Client** pour envoyer des requêtes GraphQL au Contrôleur.
    -   Gérer le stockage du token JWT côté client.
    -   Afficher les données et permettre les interactions utilisateur (formulaires, boutons, etc.).
-   **Librairies UI**: **TailwindCSS** et **Shadcn/UI** pour un design moderne et efficace.

## 3. Flux de Données (Exemple)

1.  L'utilisateur se connecte via l'interface React (`Vue`).
2.  La `Vue` envoie les identifiants au `Contrôleur` via une mutation GraphQL.
3.  Le `Contrôleur` transmet cette mutation au `Modèle`.
4.  Le `Modèle` vérifie les identifiants en base de données et génère un token JWT qu'il retourne.
5.  Le token remonte jusqu'à la `Vue`, qui le stocke.
6.  Pour toute requête suivante (ex: "afficher la liste des produits"), la `Vue` envoie la requête GraphQL avec le token JWT dans les en-têtes au `Contrôleur`.
7.  Le `Contrôleur` valide le token. Si valide, il transmet la requête au `Modèle`.
8.  Le `Modèle` exécute la requête, récupère les données de PostgreSQL et les retourne.
9.  Les données remontent jusqu'à la `Vue` pour être affichées.

## 4. Environnement de Développement

L'ensemble de l'application (les 3 services + la base de données) est orchestré par **Docker Compose** pour garantir un environnement de développement cohérent et facile à lancer.
