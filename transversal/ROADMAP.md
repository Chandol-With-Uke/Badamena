# Roadmap du Projet Dashboard Transversal

> **Note de développement**: Pour simplifier la gestion des dépendances dans l'environnement Docker, ce projet n'utilisera pas de fichiers de lock (`bun.lock`, `package-lock.json`, etc.). Les dépendances seront installées directement à partir de `package.json` à chaque build.

Ce document décrit les étapes de développement pour la création du dashboard MVC.

## Vue d'ensemble de l'architecture

*   **Modèle (Model)**: Spring Boot - Gère la logique métier, l'accès à la base de données (PostgreSQL) et expose les données via une API GraphQL.
*   **Contrôleur (Controller)**: Bun / Hono - Sert de passerelle (gateway) entre la vue et le modèle. Il consomme l'API GraphQL du modèle et l'expose à la vue, potentiellement en y ajoutant une couche de sécurité (JWT).
*   **Vue (View)**: React / Vite - Interface utilisateur du dashboard, construite avec Shadcn/UI et TailwindCSS.

---

### Étape 1: Environnement de Développement avec Docker

**Objectif**: Avoir un environnement de développement complet, conteneurisé et reproductible.

*   [x] **1.1. Fichier `docker-compose.yml`**: Créer un fichier `docker-compose.yml` à la racine du projet pour définir les 4 services :
    *   `db`: Le serveur de base de données PostgreSQL.
    *   `model`: L'application Spring Boot.
    *   `controller`: Le serveur Node.js.
    *   `view`: Le serveur de développement Vite pour React.
*   [x] **1.2. Dockerfile pour le Modèle**: Créer un `Dockerfile` dans le dossier `model/` pour compiler et exécuter l'application Spring Boot.
*   [x] **1.3. Dockerfile pour le Contrôleur**: Créer un `Dockerfile` dans le dossier `controller/` pour exécuter le serveur Node.js.
*   [x] **1.4. Dockerfile pour la Vue**: Créer un `Dockerfile` dans le dossier `view/` pour lancer le serveur de développement Vite.
*   [x] **1.5. Configuration**: Ajuster les configurations (`vite.config.ts`, `package.json`) pour que les serveurs soient accessibles depuis l'extérieur des conteneurs.
*   [x] **1.6. Lancement**: Vérifier que la commande `docker-compose up --build` lance tous les services sans erreur.

---

### Étape 2: Modèle (Spring Boot) - Logique Métier et GraphQL

**Objectif**: Mettre en place la base de données, les entités et l'API GraphQL.

*   **2.1. Connexion Base de Données**: Configurer la connexion à la base de données PostgreSQL dans `application.properties`.
*   **2.2. Entités JPA**: Définir les entités (ex: `User`, `Product`, `Order`) avec les annotations JPA.
*   **2.3. Schéma GraphQL**: Créer le schéma GraphQL dans `src/main/resources/graphql/` pour définir les types, requêtes (queries) et mutations.
*   **2.4. Resolvers GraphQL**: Implémenter les `GraphQLController` en Java pour répondre aux requêtes définies dans le schéma.
*   **2.5. Démarrage**: S'assurer que le modèle démarre et que le playground GraphQL (GraphiQL) est accessible.

---

### Étape 3: Contrôleur (Bun / Hono) - Passerelle GraphQL

**Objectif**: Faire le lien entre la vue et le modèle.

*   **3.1. Serveur Hono**: Mettre en place un serveur Hono de base.
*   **3.2. "Schema Stitching" / "Federation" (simplifié)**: Configurer le serveur pour qu'il agisse comme un proxy. Il recevra les requêtes de la vue et les transmettra à l'API GraphQL du service `model`.
*   **3.3. Test de la passerelle**: Envoyer une requête GraphQL au contrôleur et vérifier qu'elle est bien résolue par le modèle.

---

### Étape 4: Vue (React) - Interface Utilisateur

**Objectif**: Construire les premiers composants du dashboard.

*   **4.1. Installation UI**: Intégrer TailwindCSS et `shadcn/ui`.
*   **4.2. Client Apollo**: Configurer Apollo Client dans l'application React pour communiquer avec le contrôleur Node.js.
*   **4.3. Composants de base**: Créer les composants principaux (Layout, Sidebar, Header, etc.).
*   **4.4. Première page**: Créer une page simple (ex: "Liste des utilisateurs") qui envoie une requête GraphQL via le contrôleur pour afficher des données provenant du modèle.

---

### Étape 5: CRUD Complet

**Objectif**: Implémenter toutes les opérations CRUD pour une ressource.

*   **5.1. Mutations GraphQL**: S'assurer que les mutations (create, update, delete) sont bien définies dans le modèle Spring Boot.
*   **5.2. Transmission des mutations**: Permettre au contrôleur Node.js de transmettre les mutations.
*   **5.3. Intégration UI**: Créer les formulaires et les boutons dans React pour exécuter les mutations (ex: ajouter un utilisateur, modifier, supprimer).

---

### Étape 6: Sécurité avec JWT

**Objectif**: Sécuriser l'application.

*   **6.1. Spring Security**: Mettre en place Spring Security dans le modèle pour gérer l'authentification.
*   **6.2. Génération de Token**: Créer des endpoints ou des mutations GraphQL pour l'inscription (`register`) et la connexion (`login`) qui retournent un token JWT.
*   **6.3. Validation du Token**: Dans le contrôleur Node.js, ajouter un middleware qui intercepte chaque requête, valide le token JWT et injecte les informations de l'utilisateur dans le contexte de la requête.
*   **6.4. Gestion du Token côté Vue**: Stocker le token JWT dans le client React (ex: `localStorage`) et l'envoyer dans les en-têtes de chaque requête GraphQL.
*   **6.5. Routes protégées**: Mettre en place la logique de routes protégées dans React.
