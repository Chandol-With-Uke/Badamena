import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign, verify } from "hono/jwt";

const app = new Hono();

const MODEL_GRAPHQL_URL = "http://model:8080/graphql";
const JWT_SECRET = "votre_secret_jwt_super_securise"; // À changer en production

// Middleware d'authentification
const authMiddleware = async (c: any, next: any) => {
  // Exclure les routes publiques
  if (c.req.path === "/login" || c.req.path === "/") {
    return await next();
  }

  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    c.status(401);
    return c.json({ error: "Token manquant" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verify(token, JWT_SECRET);
    c.set("user", payload);
    await next();
  } catch (error) {
    c.status(401);
    return c.json({ error: "Token invalide" });
  }
};

app.use("*", authMiddleware);

app.use(
  "/graphql",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "OPTIONS"],
    credentials: true,
  }),
);

// Route de login pour obtenir le token
app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    // Vérification simple des credentials (à adapter selon vos besoins)
    if (username === "admin" && password === "admin") {
      const token = await sign(
        { 
          username: "admin",
          role: "admin",
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 heures
        },
        JWT_SECRET
      );

      return c.json({ 
        success: true, 
        token,
        user: { username: "admin", role: "admin" }
      });
    }

    c.status(401);
    return c.json({ success: false, error: "Identifiants invalides" });
  } catch (error) {
    c.status(500);
    return c.json({ success: false, error: "Erreur serveur" });
  }
});

app.get("/", (c) => {
  return c.text(
    "Le serveur du contrôleur (Bun + Hono) est en cours d'exécution !",
  );
});

app.get("/graphql", (c) => {
  c.status(405);
  return c.json({ error: "GraphQL endpoint only accepts POST requests." });
});

app.post("/graphql", async (c) => {
  try {
    const body = await c.req.json();

    const headers = new Headers(c.req.header);
    headers.delete("Host");
    headers.set("Content-Type", "application/json");

    // Ajouter l'utilisateur authentifié aux headers pour le service model si nécessaire
    const user = c.get("user");
    if (user) {
      headers.set("X-User-ID", user.username);
    }

    const response = await fetch(MODEL_GRAPHQL_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(
        "Error from model service:",
        response.status,
        response.statusText,
      );
      return c.json(await response.json(), response.status);
    }

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