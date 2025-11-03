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
app.post('/api/submit-survey', async (c) => {
  const data = await c.req.json()
  
  // Calculate priority
  const priority = calculatePriority(data)
  
  // Check if participates in raffle (must want it AND be from A Coruña)
  const isFromCoruna = data.p14?.toLowerCase().includes('coruña') || 
                       data.p14?.toLowerCase().includes('coruna')
  const wantsRaffle = data.wantRaffle === 'si'
  const participatesInRaffle = wantsRaffle && isFromCoruna
  
  const raffleNumber = participatesInRaffle ? nextRaffleNumber++ : null
  
  // Store response
  const response = {
    ...data,
    priority,
    participatesInRaffle,
    raffleNumber,
    timestamp: new Date().toISOString()
  }
  
  responses.push(response)
  
  // Save to file immediately
  saveResponses()
  
  console.log(`✅ Nueva encuesta recibida: ${data.p10} - ${priority}`)
  
  // Send email notification to Eva
  sendEmailToEva(response)
  
  return c.json({
    success: true,
    raffleNumber,
    priority,
    message: 'Encuesta recibida correctamente'
  })
})

// API: Generate report
app.post('/api/generate-report', async (c) => {
  const { index, type } = await c.req.json()
  
  if (index < 0 || index >= responses.length) {
    return c.json({ error: 'Respuesta no encontrada' }, 404)
  }
  
  const response = responses[index]
  const report = type === 'complete' ? generateCompleteReport(response) : generateCommercialReport(response)
  
  return c.json({ report })
})

// API: Draw winner
app.post('/api/draw-winner', (c) => {
  const participants = responses.filter(r => r.participatesInRaffle)
  
  if (participants.length === 0) {
    return c.json({ error: 'No hay participantes en el sorteo' }, 400)
  }
  
  const randomIndex = Math.floor(Math.random() * participants.length)
  const winner = participants[randomIndex]
  
  return c.json({
    winner: {
      name: winner.p10,
      business: winner.p11,
      raffleNumber: winner.raffleNumber,
      email: winner.p13,
      whatsapp: winner.p12
    },
    totalParticipants: participants.length
  })
})

// Serve main survey page
