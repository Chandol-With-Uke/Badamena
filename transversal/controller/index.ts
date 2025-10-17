import { Hono } from "hono";
import { cors } from "hono/cors"; // Importez le middleware CORS

const app = new Hono();

// L'URL du service modèle, accessible via le nom de service Docker
const MODEL_GRAPHQL_URL = "http://model:8080/graphql";

// 1. Configuration CORS
// Appliquer le middleware CORS à toutes les requêtes allant vers /graphql
app.use(
  "/graphql",
  cors({
    origin: "http://localhost:5173", // L'URL de votre application React
    allowHeaders: ["Content-Type", "Authorization"], // Autoriser l'en-tête Authorization
    allowMethods: ["POST", "OPTIONS"], // POST pour GraphQL, OPTIONS pour les requêtes preflight CORS
    credentials: true, // Si vous utilisez des cookies ou des en-têtes d'autorisation avec des credentials
  }),
);

app.get("/", (c) => {
  return c.text(
    "Le serveur du contrôleur (Bun + Hono) est en cours d'exécution !",
  );
});

// Route pour indiquer que le point de terminaison GraphQL n'accepte que les requêtes POST
app.get("/graphql", (c) => {
  c.status(405); // Method Not Allowed
  return c.json({ error: "GraphQL endpoint only accepts POST requests." });
});

// Route principale qui agit comme une passerelle GraphQL
app.post("/graphql", async (c) => {
  try {
    // 1. Récupérer le corps de la requête (qui contient la query GraphQL)
    const body = await c.req.json();

    // 2. Préparer les en-têtes pour la requête vers le modèle
    const headers = new Headers(c.req.headers);
    // Supprimer l'en-tête 'Host' pour éviter les problèmes de routage interne Docker
    headers.delete("Host");
    // S'assurer que Content-Type est toujours json
    headers.set("Content-Type", "application/json");

    // 3. Transférer la requête au service 'model'
    const response = await fetch(MODEL_GRAPHQL_URL, {
      method: "POST",
      headers: headers, // Utiliser tous les en-têtes de la requête entrante
      body: JSON.stringify(body),
    });

    // 4. Si la réponse du modèle n'est pas OK, on propage l'erreur
    if (!response.ok) {
      console.error(
        "Error from model service:",
        response.status,
        response.statusText,
      );
      // Propager le statut et le corps de l'erreur du modèle
      return c.json(await response.json(), response.status);
    }

    // 5. Retourner la réponse du modèle directement à la vue
    // Copier tous les en-têtes de la réponse du Modèle, y compris ceux de CORS si le Modèle en ajoute.
    // Cela permet de ne pas écraser les en-têtes CORS déjà définis par Hono si le Modèle n'en fournit pas.
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error in GraphQL proxy:", error);
    c.status(500);
    return c.json({ errors: [{ message: "Internal server error" }] }, 500);
  }
});

const port = 4000;
console.log(
  `🚀 Le serveur du contrôleur est prêt sur http://localhost:${port}`,
);

export default {
  port,
  fetch: app.fetch,
};
