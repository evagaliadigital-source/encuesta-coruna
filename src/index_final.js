import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const app = new Hono()

// Persistent storage in JSON file
const RESPONSES_FILE = './responses.json'

// Load existing responses on startup
let responses = []
let nextRaffleNumber = 20

function loadResponses() {
  try {
    if (existsSync(RESPONSES_FILE)) {
      const data = readFileSync(RESPONSES_FILE, 'utf8')
      const parsed = JSON.parse(data)
      responses = parsed.responses || []
      nextRaffleNumber = parsed.nextRaffleNumber || 20
      console.log(`✅ Cargadas ${responses.length} respuestas desde archivo`)
    }
  } catch (error) {
    console.log('⚠️  No hay respuestas previas, empezando desde cero')
  }
}

function saveResponses() {
  try {
    writeFileSync(RESPONSES_FILE, JSON.stringify({ responses, nextRaffleNumber }, null, 2))
  } catch (error) {
    console.error('❌ Error guardando respuestas:', error)
  }
}

// Load on startup
loadResponses()

// Enable CORS
app.use('/api/*', cors())

// Serve dashboard
app.get('/dashboard', (c) => {
  return c.html(readFileSync('./dashboard.html', 'utf8'))
})

// API: Get all responses
app.get('/api/responses', (c) => {
  const hot = responses.filter(r => r.priority === '🔥 HOT').length
  const warm = responses.filter(r => r.priority === '🟡 WARM').length
  const cold = responses.filter(r => r.priority === '🟢 COLD').length
  const raffleParticipants = responses.filter(r => r.participatesInRaffle).length

  return c.json({
    total: responses.length,
    hot,
    warm,
    cold,
    raffleParticipants,
    responses
  })
})

// API: Submit survey

