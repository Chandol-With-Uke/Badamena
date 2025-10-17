import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

const MODEL_GRAPHQL_URL = "http://model:8080/graphql";

app.use(
  "/graphql",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "OPTIONS"],
    credentials: true,
  }),
);

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