import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Le serveur du contrôleur (Bun + Hono) est en cours d\'exécution !')
})

const port = 4000
console.log(`🚀 Le serveur du contrôleur est prêt sur http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
