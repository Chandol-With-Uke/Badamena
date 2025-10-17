import { Hono } from 'hono'

const app = new Hono()

// L'URL du service modèle, accessible via le nom de service Docker
const MODEL_GRAPHQL_URL = 'http://model:8080/graphql';

app.get('/', (c) => {
  return c.text('Le serveur du contrôleur (Bun + Hono) est en cours d\'exécution !')
})

// Route pour indiquer que le point de terminaison GraphQL n'accepte que les requêtes POST
app.get('/graphql', (c) => {
  c.status(405) // Method Not Allowed
  return c.json({ error: 'GraphQL endpoint only accepts POST requests.' });
})

// Route principale qui agit comme une passerelle GraphQL
app.post('/graphql', async (c) => {
  try {
    // 1. Récupérer le corps de la requête (qui contient la query GraphQL)
    const body = await c.req.json();

    // 2. Transférer la requête au service 'model'
    const response = await fetch(MODEL_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // On pourrait ajouter ici le transfert de headers d'authentification (ex: JWT)
        // 'Authorization': c.req.header('Authorization') || ''
      },
      body: JSON.stringify(body),
    });

    // 3. Si la réponse du modèle n'est pas OK, on propage l'erreur
    if (!response.ok) {
      console.error('Error from model service:', response.status, response.statusText);
      c.status(response.status);
      return c.json({ error: 'Failed to fetch from model service.' });
    }

    // 4. Retourner la réponse du modèle directement à la vue
    return new Response(response.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in GraphQL proxy:', error);
    c.status(500);
    return c.json({ error: 'Internal server error in controller.' });
  }
});


const port = 4000
console.log(`🚀 Le serveur du contrôleur est prêt sur http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
