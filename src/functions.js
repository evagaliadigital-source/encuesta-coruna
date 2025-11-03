// Priority calculation based on new survey structure
function calculatePriority(data) {
  let score = 0
  
  // P1: Daily time on appointments (higher time = more pain)
  if (data.p1 === 'Más de 2 horas') score += 3
  else if (data.p1 === '1-2 horas') score += 2
  else if (data.p1 === '30 minutos - 1 hora') score += 1
  
  // P2: Main problem (all problems = high pain)
  if (data.p2 === 'Todo lo anterior') score += 3
  else if (data.p2) score += 1
  
  // P3: Willingness to pay (CRITICAL)
  if (data.p3 === 'Más de 100€/mes') score += 5
  else if (data.p3 === '60-100€/mes') score += 4
  else if (data.p3 === '40-60€/mes') score += 3
  else if (data.p3 === '20-40€/mes') score += 2
  else if (data.p3 === 'Nada, lo quiero gratis') score -= 2
  
  // P4: Blocker (no blocker = ready to buy)
  if (data.p4 === 'Nada, lo haría ahora mismo') score += 5
  else if (data.p4 === 'El precio') score += 1
  else score += 0
  
  // P5: Trial interest (CRITICAL)
  if (data.p5 === 'Sí, ahora mismo') score += 5
  else if (data.p5 === 'Sí, pero en 1-2 meses') score += 3
  else if (data.p5 === 'Quizás, necesito más información') score += 1
  
  // P17: Contact timing (indicates urgency)
  if (data.p17 === 'Esta semana') score += 3
  else if (data.p17 === 'Próxima semana') score += 2
  else if (data.p17 === 'Dentro de 2-3 semanas') score += 1
  
  // Scoring thresholds
  if (score >= 15) return '🔥 HOT'
  if (score >= 10) return '🟡 WARM'
  return '🟢 COLD'
}

// Email notification to Eva (logs to PM2)
function sendEmailToEva(response) {
  const priorityIcon = response.priority === '🔥 HOT' ? '🔥' : 
                       response.priority === '🟡 WARM' ? '🟡' : '🟢'
  
  console.log('\n' + '='.repeat(80))
  console.log(`📧 EMAIL PARA: eva@galiadigital.es`)
  console.log('='.repeat(80))
  console.log(`Asunto: ${priorityIcon} NUEVO LEAD ${response.priority} - ${response.p11} (${response.p12})`)
  console.log('='.repeat(80))
  console.log('')
  console.log(`PRIORIDAD: ${response.priority}`)
  console.log(`Nombre: ${response.p11}`)
  console.log(`Peluquería: ${response.p12}`)
  console.log(`Ciudad: ${response.p15}`)
  console.log(`WhatsApp: ${response.p13}`)
  console.log(`Email: ${response.p14}`)
  console.log(`Dirección: ${response.p16 || 'No proporcionada'}`)
  console.log('')
  console.log('📊 BLOQUE 1 - SITUACIÓN ACTUAL:')
  console.log(`  - Tiempo diario gestión citas: ${response.p1}`)
  console.log(`  - Mayor problema: ${response.p2}`)
  console.log('')
  console.log('💰 BLOQUE 2 - VALIDACIÓN SOLUCIÓN:')
  console.log(`  - Pagaría: ${response.p3}`)
  console.log(`  - Principal freno: ${response.p4}`)
  console.log(`  - Prueba gratis: ${response.p5}`)
  console.log('')
  console.log('📱 BLOQUE 3 - OTRAS NECESIDADES:')
  console.log(`  - Qué le quita tiempo: ${response.p6 || 'N/A'}`)
  console.log(`  - Facturación 2026: ${response.p7}`)
  console.log(`  - Tiempo gestión stock/semana: ${response.p8}`)
  console.log(`  - Gestión empleados: ${response.p9}`)
  console.log(`  - Interés sistema todo-en-uno: ${response.p10}`)
  console.log('')
  console.log('📞 BLOQUE 4 - CONTACTO:')
  console.log(`  - Cuándo contactar: ${response.p17}`)
  console.log('')
  console.log('💡 INTERESES:')
  console.log(`  - Quiere informe personalizado: ${response.wantReport === 'si' ? 'SÍ' : 'NO'}`)
  console.log(`  - Quiere participar en sorteo: ${response.wantRaffle === 'si' ? 'SÍ' : 'NO'}`)
  console.log('')
  
  if (response.participatesInRaffle) {
    console.log('🎁 SORTEO:')
    console.log(`  Participa: SÍ`)
    console.log(`  Número: #${response.raffleNumber}`)
    console.log('')
  } else if (response.wantRaffle === 'si') {
    console.log('⚠️ SORTEO:')
    console.log(`  Quería participar pero NO es de A Coruña`)
    console.log('')
  }
  
  console.log('⚡ ACCIÓN RECOMENDADA:')
  if (response.priority === '🔥 HOT') {
    console.log(`  🔥 LLAMAR EN LAS PRÓXIMAS 24 HORAS`)
    console.log(`  Perfil ideal: alta disposición de pago + necesita solución urgente`)
  } else if (response.priority === '🟡 WARM') {
    console.log(`  🟡 SEGUIMIENTO EN 3-5 DÍAS`)
    console.log(`  Interesado pero no urgente. Nutrir con contenido de valor`)
  } else {
    console.log(`  🟢 FOLLOW-UP LARGO PLAZO`)
    console.log(`  Añadir a lista de nurturing. Email automatizado mensual`)
  }
  
  console.log('')
  console.log(`Timestamp: ${response.timestamp}`)
  console.log('='.repeat(80))
  console.log('\n')
}

// Generate complete analysis report
function generateCompleteReport(r) {
  const firstName = r.p11.split(' ')[0]
  const timeDaily = r.p1
  const painPoint = r.p2
  const wtp = r.p3
  const blocker = r.p4
  const trial = r.p5
  
  const timeValue = r.p1 === 'Más de 2 horas' ? '2+ horas' : 
                    r.p1 === '1-2 horas' ? '1-2 horas' : 
                    r.p1 === '30 minutos - 1 hora' ? '30-60 min' : '< 30 min'
  
  const timeSaved = r.p1 === 'Más de 2 horas' ? '10h/semana' : 
                    r.p1 === '1-2 horas' ? '8h/semana' : '5h/semana'
  
  const hasEmployees = r.p9 && r.p9 !== 'No tengo empleados, trabajo sola'
  const needsStock = r.p8 && r.p8 !== 'Nada, no vendo productos'
  const needsInvoicing = r.p7 && (r.p7.includes('no sé cómo') || r.p7.includes('ni idea'))
  
  const additionalOpportunities = []
  if (hasEmployees) additionalOpportunities.push(`**Gestión de empleados**: Detectamos que gestionas horarios y turnos. Sistema automatizado ahorraría 3-4h/semana.`)
  if (needsStock) additionalOpportunities.push(`**Control de stock**: Tiempo dedicado ${r.p8}. Automatización recuperaría 60% del tiempo.`)
  if (needsInvoicing) additionalOpportunities.push(`**Facturación 2026**: Obligatoria en tiempo real. Te ayudamos a estar lista desde YA.`)
  
  const report = `🎯 ANÁLISIS PERSONALIZADO PARA ${r.p12.toUpperCase()}

Hola ${firstName},

Gracias por completar la encuesta. He analizado tu situación y esto es lo que he encontrado:

📊 **TU SITUACIÓN ACTUAL**

Actualmente dedicas **${timeValue} diarios** a gestionar citas. Tu mayor dolor: **${painPoint}**.

Traducido a números:
- **${timeSaved} perdidas** solo en gestión de agenda
- **${r.p1 === 'Más de 2 horas' ? '480€-800€' : '300-500€'}/mes** en coste de oportunidad (tiempo que podrías dedicar a servicios facturables)

💡 **SOLUCIÓN RECOMENDADA**

**Nivel 1: Agenda Inteligente IA**
- ✅ Reduce no-shows 80% (recuperas clientes perdidos)
- ✅ Llena horas muertas automáticamente
- ✅ Gestión WhatsApp 24/7 sin que tú estés pendiente
- ✅ Recuperas ${timeSaved} para ti

**Inversión:** 60€/mes (300€ setup inicial)
**ROI:** Se autofinancia en mes 7 con solo 42 clientes activos

📈 **OPORTUNIDADES ADICIONALES**

${additionalOpportunities.length > 0 ? additionalOpportunities.map((o, i) => `${i+1}. ${o}`).join('\n\n') : 'No detectamos necesidades adicionales urgentes por ahora.'}

${r.p10 === 'Sí, si me ahorra tiempo y dolores de cabeza' ? `\n🔥 **DATO CLAVE:** Indicaste interés en sistema todo-en-uno. Podríamos integrar todo (agenda + facturación + stock + empleados) en una única solución. ¿Hablamos?\n` : ''}

🎯 **SIGUIENTE PASO**

${r.p17 === 'Esta semana' ? 'Perfecto, indicaste que te viene bien contactarte esta semana. Te llamaré en las próximas 24-48h para ver cómo podemos ayudarte.' : 
  r.p17 === 'Próxima semana' ? 'Indicaste que prefieres contacto la próxima semana. Perfecto, te llamaré entonces.' : 
  r.p17 === 'Dentro de 2-3 semanas' ? 'Te contactaré dentro de 2-3 semanas como indicaste. Mientras tanto, recibirás email con más info.' : 
  'Como prefieres solo email, te enviaremos toda la información detallada por correo. Sin llamadas.'}

¿Preguntas? Responde a este email o WhatsApp: +34 XXX XXX XXX

Un abrazo,
**Eva Rodríguez**
Fundadora | Galia Digital
`

  return report
}

// Generate commercial proposal
function generateCommercialReport(r) {
  const firstName = r.p11.split(' ')[0]
  const wtp = r.p3
  const urgency = r.p17 === 'Esta semana' ? 'alta' : r.p17 === 'Próxima semana' ? 'media' : 'baja'
  
  const priceRange = wtp === 'Más de 100€/mes' ? '80-120€/mes' :
                     wtp === '60-100€/mes' ? '60-80€/mes' :
                     wtp === '40-60€/mes' ? '40-60€/mes' : '20-40€/mes'
  
  const hasMultipleNeeds = (r.p6 && r.p6.includes(',')) || 
                          (r.p8 && r.p8 !== 'Nada, no vendo productos') ||
                          (r.p9 && r.p9 !== 'No tengo empleados, trabajo sola')
  
  const report = `💼 PROPUESTA COMERCIAL - ${r.p12.toUpperCase()}

**Para:** ${r.p11}
**Peluquería:** ${r.p12}
**Fecha:** ${new Date().toLocaleDateString('es-ES')}

---

Hola ${firstName},

Basándome en tu encuesta, he preparado una propuesta personalizada para ${r.p12}.

## 🎯 TU SITUACIÓN

**Dolor identificado:** ${r.p2}
**Tiempo diario invertido:** ${r.p1}
**Freno principal:** ${r.p4}

## 💡 SOLUCIÓN RECOMENDADA

**OPCIÓN 1: Agenda Inteligente IA (Nivel 1)**

${hasMultipleNeeds ? '**OPCIÓN 2: Sistema Completo (Niveles 1+2+3)**\n- Agenda IA + Facturación + Stock + Empleados\n- Todo integrado en una plataforma\n- Precio especial paquete completo: A consultar\n\n' : ''}

## 📊 NÚMEROS QUE IMPORTAN

**Inversión Nivel 1:**
- Setup inicial: 300€ (única vez)
- Mensualidad: 60€/mes
- **Total año 1:** 1.020€

**Retorno esperado:**
- Recuperas ${r.p1 === 'Más de 2 horas' ? '10h' : r.p1 === '1-2 horas' ? '8h' : '5h'}/semana
- Reduces no-shows 80% (recuperas ${r.p1 === 'Más de 2 horas' ? '300-500€' : '200-300€'}/mes)
- **ROI positivo en mes 7**

## 🎁 OFERTA EXCLUSIVA

${r.participatesInRaffle ? `✅ **¡Estás en el sorteo!** Número #${r.raffleNumber}\nSi no ganas, tienes un **15% descuento** en el setup inicial.\n` : ''}

${r.p5 === 'Sí, ahora mismo' ? '✅ **Prueba gratis 15 días** - Sin compromiso, sin tarjeta\n' : ''}

## 📞 SIGUIENTE PASO

${r.p17 === 'Esta semana' ? '🔥 **URGENTE:** Te llamo en las próximas 24-48h para cerrar detalles y arrancar.' : 
  r.p17 === 'Próxima semana' ? 'Te contacto la próxima semana para arrancar cuando te venga bien.' : 
  r.p17 === 'Dentro de 2-3 semanas' ? 'Te contacto dentro de 2-3 semanas. Mientras tanto, aquí tienes toda la info.' : 
  'Como prefieres, te envío todo por email. Sin llamadas.'}

**¿Dudas?** WhatsApp: ${r.p13} | Email: ${r.p14}

---

Un abrazo,
**Eva Rodríguez**
Fundadora | Galia Digital
📱 +34 XXX XXX XXX
`

  return report
}

module.exports = {
  calculatePriority,
  sendEmailToEva,
  generateCompleteReport,
  generateCommercialReport
}
