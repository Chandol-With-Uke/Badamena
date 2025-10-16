# Feuille de route pour l'intégration de PostgreSQL et Redis

Ce document décrit les étapes nécessaires pour intégrer une base de données PostgreSQL et un cache Redis à l'application JAX-RS, et pour créer deux pages web affichant des données de produits.

## Phase 1: Mise en place de l'environnement avec Docker Compose

1.  **Créer `docker-compose.yaml`**:
    *   Définir trois services : `app` (l'application JAX-RS), `db` (PostgreSQL), et `cache` (Redis).
    *   Configurer les images, les ports, les volumes et les variables d'environnement pour chaque service.
    *   Établir un réseau commun pour que les conteneurs puissent communiquer.
    *   Utiliser `depends_on` pour s'assurer que la base de données et le cache sont démarrés avant l'application.

## Phase 2: Développement du Backend (Java EE)

1.  **Mettre à jour les dépendances (`pom.xml`)**:
    *   Ajouter le pilote JDBC PostgreSQL.
    *   Ajouter un client Redis comme Jedis.
    *   Ajouter les dépendances de Jakarta EE pour la persistance (JPA) et l'injection de dépendances (CDI).

2.  **Créer le modèle de données**:
    *   Créer une entité JPA `Product` avec les champs `id`, `name` et `salesCount`.

3.  **Initialisation de la base de données au démarrage**:
    *   Créer un bean `@Singleton @Startup` (par exemple, `DatabaseInitializer`).
    *   Dans la méthode `@PostConstruct` de ce bean :
        *   Injecter une `EntityManager` pour interagir avec PostgreSQL.
        *   Générer et insérer 50 produits aléatoires dans la base de données.

4.  **Logique de mise en cache au démarrage**:
    *   Dans le même bean `@Startup` :
        *   Établir une connexion avec Redis.
        *   Exécuter une requête sur PostgreSQL pour récupérer les 20 produits les plus vendus.
        *   Stocker ces 20 produits dans Redis (par exemple, dans une liste ou un sorted set).

5.  **Créer les Endpoints JAX-RS**:
    *   Créer une nouvelle ressource JAX-RS (par exemple, `ProductResource.java`).
    *   Créer une méthode `GET /products` qui :
        *   Récupère la liste complète des 50 produits depuis PostgreSQL.
        *   Retourne les données au format JSON.
    *   Créer une méthode `GET /products/top` qui :
        *   Récupère la liste des 20 meilleurs produits depuis Redis.
        *   Retourne les données au format JSON.

## Phase 3: Développement du Frontend (Pages JSP)

1.  **Créer `products.jsp`**:
    *   Cette page affichera la liste de tous les produits.
    *   Utiliser JavaScript (`fetch` API) pour appeler l'endpoint `/api/products`.
    *   Générer dynamiquement un tableau HTML pour afficher les produits reçus.

2.  **Créer `top-products.jsp`**:
    *   Cette page affichera les produits les plus vendus.
    *   Utiliser JavaScript (`fetch` API) pour appeler l'endpoint `/api/products/top`.
    *   Générer dynamiquement un tableau HTML pour afficher les produits reçus.

3.  **Mettre à jour `index.jsp`**:
    *   Ajouter des liens de navigation vers `products.jsp` et `top-products.jsp`.

## Phase 4: Finalisation et Tests

1.  **Configuration de la source de données**:
    *   Configurer la source de données PostgreSQL dans l'application (par exemple, via `web.xml` ou des annotations).
2.  **Tests**:
    *   Démarrer l'environnement avec `docker-compose up --build`.
    *   Vérifier que les données sont correctement initialisées dans PostgreSQL et Redis.
    *   Accéder aux pages web pour s'assurer que les données sont affichées correctement.
