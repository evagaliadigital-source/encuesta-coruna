import { serve } from '@hono/node-server'
import app from './src/index.js'

// Render deployment - Using PORT env variable
const port = process.env.PORT || 3000

console.log(`🚀 Servidor iniciado en puerto ${port}`)
console.log(`📊 Dashboard Eva disponible en /dashboard`)
console.log(`🎁 Encuesta pública disponible en /`)

serve({
  fetch: app.fetch,
  port
})
