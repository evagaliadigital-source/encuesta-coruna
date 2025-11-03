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

                            <select name="p4" required class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                                <option value="">Selecciona una opción...</option>
                                <option value="El precio">El precio</option>
                                <option value="No sé si realmente funciona">No sé si realmente funciona</option>
                                <option value="Miedo a perder control">Miedo a perder control</option>
                                <option value="No tengo tiempo de implementarlo">No tengo tiempo de implementarlo</option>
                                <option value="Desconfianza en la tecnología">Desconfianza en la tecnología</option>
                                <option value="Nada, lo haría ahora mismo">Nada, lo haría ahora mismo</option>
                            </select>
                        </div>

                        <!-- P5 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                5. ⭐ Si pudieras probarlo GRATIS durante 15 días, ¿lo harías?
                            </label>
                            <select name="p5" required class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                                <option value="">Selecciona una opción...</option>
                                <option value="Sí, ahora mismo">Sí, ahora mismo</option>
                                <option value="Sí, pero en 1-2 meses">Sí, pero en 1-2 meses</option>
                                <option value="Quizás, necesito más información">Quizás, necesito más información</option>
                                <option value="No me interesa">No me interesa</option>
                            </select>
                        </div>
                    </div>

                    <!-- Block 3: Otras Necesidades -->
                    <div class="question-block" data-block="3">
                        <h3 class="text-2xl font-bold text-gray-800 mb-6">📱 Bloque 3: Otras Necesidades</h3>
                        
                        <!-- P6 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                6. ⭐ Además de la agenda, ¿qué más te QUITA TIEMPO o DINERO? (puedes marcar varias)
                            </label>
                            <div class="space-y-2">
                                <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-[#008080] cursor-pointer">
                                    <input type="checkbox" name="p6" value="Facturación y gestión de tickets/facturas" class="mr-3 w-5 h-5 text-[#008080]">
                                    <span>Facturación y gestión de tickets/facturas</span>
                                </label>
                                <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-[#008080] cursor-pointer">
                                    <input type="checkbox" name="p6" value="Control de stock de productos" class="mr-3 w-5 h-5 text-[#008080]">
                                    <span>Control de stock de productos</span>
                                </label>
                                <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-[#008080] cursor-pointer">
                                    <input type="checkbox" name="p6" value="Gestión de horarios y turnos de empleados" class="mr-3 w-5 h-5 text-[#008080]">
                                    <span>Gestión de horarios y turnos de empleados</span>
                                </label>
                                <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-[#008080] cursor-pointer">
                                    <input type="checkbox" name="p6" value="Nóminas y control de horas trabajadas" class="mr-3 w-5 h-5 text-[#008080]">
                                    <span>Nóminas y control de horas trabajadas</span>
                                </label>
                                <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-[#008080] cursor-pointer">
                                    <input type="checkbox" name="p6" value="Cálculo de comisiones por servicios" class="mr-3 w-5 h-5 text-[#008080]">
                                    <span>Cálculo de comisiones por servicios</span>
                                </label>
                                <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-[#008080] cursor-pointer">
                                    <input type="checkbox" name="p6" value="Cuadrar caja al final del día" class="mr-3 w-5 h-5 text-[#008080]">
                                    <span>Cuadrar caja al final del día</span>
                                </label>
                            </div>
                        </div>

                        <!-- P7 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                7. ⭐ ¿Sabes que en 2026 será OBLIGATORIO facturar electrónicamente en tiempo real?
                            </label>
                            <select name="p7" required class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                                <option value="">Selecciona una opción...</option>
                                <option value="Sí, y ya estoy preparándome">Sí, y ya estoy preparándome</option>
                                <option value="Sí, pero no sé cómo hacerlo">Sí, pero no sé cómo hacerlo</option>
                                <option value="No tenía ni idea">No tenía ni idea</option>
                                <option value="Me da igual, ya veré">Me da igual, ya veré</option>
                            </select>
                        </div>

                        <!-- P8 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                8. ⭐ ¿Cuánto tiempo dedicas A LA SEMANA a gestionar stock de productos?
                            </label>
                            <select name="p8" required class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                                <option value="">Selecciona una opción...</option>
                                <option value="Nada, no vendo productos">Nada, no vendo productos</option>
                                <option value="Menos de 1 hora">Menos de 1 hora</option>
                                <option value="1-3 horas">1-3 horas</option>
                                <option value="3-5 horas">3-5 horas</option>
                                <option value="Más de 5 horas">Más de 5 horas</option>
                            </select>
                        </div>

                        <!-- P9 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                9. ⭐ Si tienes empleados, ¿cómo gestionas sus horarios y turnos?
                            </label>
                            <select name="p9" required class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                                <option value="">Selecciona una opción...</option>
                                <option value="No tengo empleados, trabajo sola">No tengo empleados, trabajo sola</option>
                                <option value="Excel / papel / WhatsApp (caos)">Excel / papel / WhatsApp (caos)</option>
                                <option value="App específica de horarios">App específica de horarios</option>
                                <option value="Memoria y cruzo los dedos">Memoria y cruzo los dedos</option>
                            </select>
                        </div>

                        <!-- P10 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                10. ⭐ ¿Pagarías por un sistema que automatizara facturación + stock + turnos + agenda TODO EN UNO?
                            </label>
                            <select name="p10" required class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                                <option value="">Selecciona una opción...</option>
                                <option value="Sí, si me ahorra tiempo y dolores de cabeza">Sí, si me ahorra tiempo y dolores de cabeza</option>
                                <option value="Depende del precio">Depende del precio</option>
                                <option value="No, prefiero herramientas separadas">No, prefiero herramientas separadas</option>
                                <option value="No necesito eso">No necesito eso</option>
                            </select>
                        </div>
                    </div>

                    <!-- Block 4: Tus Datos -->
                    <div class="question-block" data-block="4">
                        <h3 class="text-2xl font-bold text-gray-800 mb-6">📝 Bloque 4: Tus Datos</h3>
                        
                        <!-- Info Text before P11 -->
                        <div class="bg-gradient-to-r from-[#E6F2F2] to-[#EBF5F5] border-2 border-[#B3D9D9] rounded-xl p-6 mb-6">
                            <h4 class="text-xl font-bold text-gray-800 mb-3">🎁 TU REGALO INMEDIATO:</h4>
                            <p class="text-gray-700 mb-3">Al finalizar recibirás:</p>
                            <ul class="space-y-2 text-gray-700">
                                <li>✅ Análisis personalizado de tu situación</li>
                                <li>✅ Plan de automatización a tu medida</li>
                                <li>✅ Consultoría gratuita de 30 minutos</li>
                            </ul>
                        </div>

                        <!-- P11 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                11. ⭐ Tu nombre
                            </label>
                            <input type="text" name="p11" required 
                                   placeholder="Ej: María García"
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                        </div>

                        <!-- P12 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                12. ⭐ Nombre de tu peluquería/salón
                            </label>
                            <input type="text" name="p12" required 
                                   placeholder="Ej: Peluquería María Estilistas"
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                        </div>

                        <!-- P13 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                13. ⭐ WhatsApp (incluye prefijo +34)
                            </label>
                            <input type="tel" name="p13" required 
                                   placeholder="Ej: +34 600 123 456"
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                        </div>

                        <!-- P14 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                14. ⭐ Email
                            </label>
                            <input type="email" name="p14" required 
                                   placeholder="tu@email.com"
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                        </div>

                        <!-- P15 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                15. ⭐ Ciudad donde está tu salón
                            </label>
                            <input type="text" name="p15" required 
                                   placeholder="Ej: A Coruña"
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                        </div>

                        <!-- P16 (OPCIONAL) -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                16. Dirección completa de tu salón (Calle + número - opcional para sorteo)
                            </label>
                            <input type="text" name="p16" 
                                   placeholder="Ej: Calle Real 25"
                                   class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                        </div>

                        <!-- P17 -->
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-3">
                                17. ⭐ ¿Cuándo te vendría bien que te contactemos?
                            </label>
                            <select name="p17" required class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#008080] focus:outline-none">
                                <option value="">Selecciona una opción...</option>
                                <option value="Esta semana">Esta semana</option>
                                <option value="Próxima semana">Próxima semana</option>
                                <option value="Dentro de 2-3 semanas">Dentro de 2-3 semanas</option>
                                <option value="Solo email, no llamar">Solo email, no llamar</option>
                            </select>
                        </div>

                        <!-- Opt-ins Section -->
                        <div class="border-t-2 border-gray-200 pt-6 mt-8">
                            <h4 class="text-lg font-bold text-gray-800 mb-4">✅ Confirmación y Permisos</h4>
                            
                            <!-- Opt-in: Sorteo -->
                            <div class="mb-4">
                                <label class="flex items-start cursor-pointer">
                                    <input type="radio" name="wantRaffle" value="si" class="mt-1 mr-3 w-5 h-5 text-[#008080]">
                                    <span class="text-gray-700">
                                        <strong>SÍ, quiero participar en el sorteo</strong> de 1 año de Agenda Inteligente IA (solo para salones de A Coruña)
                                    </span>
                                </label>
                            </div>
                            <div class="mb-6">
                                <label class="flex items-start cursor-pointer">
                                    <input type="radio" name="wantRaffle" value="no" class="mt-1 mr-3 w-5 h-5 text-[#008080]">
                                    <span class="text-gray-700">No quiero participar en el sorteo</span>
                                </label>
                            </div>

                            <!-- Opt-in: Informe -->
                            <div class="mb-4">
                                <label class="flex items-start cursor-pointer">
                                    <input type="radio" name="wantReport" value="si" class="mt-1 mr-3 w-5 h-5 text-[#008080]">
                                    <span class="text-gray-700">
                                        <strong>SÍ, quiero recibir el informe personalizado</strong> con mi plan de automatización
                                    </span>
                                </label>
                            </div>
                            <div class="mb-6">
                                <label class="flex items-start cursor-pointer">
                                    <input type="radio" name="wantReport" value="no" class="mt-1 mr-3 w-5 h-5 text-[#008080]">
                                    <span class="text-gray-700">No quiero recibir el informe</span>
                                </label>
                            </div>

                            <!-- GDPR Obligatorio -->
                            <div class="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
                                <label class="flex items-start cursor-pointer">
                                    <input type="checkbox" name="gdpr" required class="mt-1 mr-3 w-5 h-5 text-[#008080]">
                                    <span class="text-sm text-gray-700">
                                        ⭐ <strong>Acepto la</strong> 
                                        <a href="https://galiadigital.es/privacidad/" target="_blank" class="text-[#008080] underline hover:text-[#006666]">política de privacidad</a> 
                                        y el tratamiento de mis datos según RGPD (obligatorio)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation Buttons -->
                    <div class="flex justify-between mt-8">
                        <button type="button" id="prevBtn" class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition" style="display: none;">
                            ← Anterior
                        </button>
                        <button type="button" id="nextBtn" class="px-6 py-3 bg-[#008080] text-white rounded-lg font-semibold hover:bg-[#006666] transition ml-auto">
                            Siguiente →
                        </button>
                        <button type="submit" id="submitBtn" class="px-8 py-3 bg-gradient-to-r from-[#008080] to-[#1b285e] text-white rounded-lg font-bold hover:shadow-xl transition" style="display: none;">
                            🚀 Enviar Encuesta
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Success Modal -->
        <div id="successModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl max-w-lg w-full p-8 text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-4">¡Gracias!</h2>
                <div id="modalContent"></div>
                <button onclick="window.location.href='/'" class="mt-6 px-8 py-3 bg-[#008080] text-white rounded-lg font-bold hover:bg-[#006666] transition">
                    Cerrar
                </button>
            </div>
        </div>
    </div>

    <script>
        const form = document.getElementById('surveyForm');
        const blocks = document.querySelectorAll('.question-block');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        let currentBlock = 0;
        const totalBlocks = blocks.length;

        function updateProgress() {
            const answeredQuestions = countAnsweredQuestions();
            const totalQuestions = 17;
            const percentage = (answeredQuestions / totalQuestions) * 100;
            
            progressBar.style.width = percentage + '%';
            progressText.textContent = answeredQuestions + '/' + totalQuestions;
        }

        function countAnsweredQuestions() {
            let count = 0;
            
            // P1-P5, P7-P10, P17 (selects)
            const selects = ['p1', 'p2', 'p3', 'p4', 'p5', 'p7', 'p8', 'p9', 'p10', 'p17'];
            selects.forEach(name => {
                const select = form.elements[name];
                if (select && select.value) count++;
            });
            
            // P6 (checkboxes - al menos uno)
            const p6Checked = form.querySelectorAll('input[name="p6"]:checked').length > 0;
            if (p6Checked) count++;
            
            // P11-P15 (text inputs obligatorios)
            const texts = ['p11', 'p12', 'p13', 'p14', 'p15'];
            texts.forEach(name => {
                const input = form.elements[name];
                if (input && input.value.trim()) count++;
            });
            
            // P16 es opcional, no cuenta
            
            return count;
        }

        function showBlock(index) {
            blocks.forEach((block, i) => {
                block.classList.toggle('active', i === index);
            });
            
            prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
            nextBtn.style.display = index === totalBlocks - 1 ? 'none' : 'inline-block';
            submitBtn.style.display = index === totalBlocks - 1 ? 'inline-block' : 'none';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function validateCurrentBlock() {
            const currentBlockEl = blocks[currentBlock];
            const inputs = currentBlockEl.querySelectorAll('input[required], select[required]');
            
            for (let input of inputs) {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    const name = input.name;
                    const checked = currentBlockEl.querySelector(\`input[name="\${name}"]:checked\`);
                    if (!checked && input.hasAttribute('required')) {
                        alert('Por favor, completa todos los campos obligatorios');
                        return false;
                    }
                } else {
                    if (!input.value.trim()) {
                        alert('Por favor, completa todos los campos obligatorios');
                        input.focus();
                        return false;
                    }
                }
            }
            return true;
        }

        prevBtn.addEventListener('click', () => {
            if (currentBlock > 0) {
                currentBlock--;
                showBlock(currentBlock);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (validateCurrentBlock() && currentBlock < totalBlocks - 1) {
                currentBlock++;
                showBlock(currentBlock);
                updateProgress();
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateCurrentBlock()) return;

            const formData = new FormData(form);
            const data = {};
            
            // Get all form values
            for (let [key, value] of formData.entries()) {
                if (key === 'p6') {
                    // Multiple checkboxes
                    if (!data[key]) data[key] = [];
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
            
            // Convert p6 array to string
            if (Array.isArray(data.p6)) {
                data.p6 = data.p6.join(', ');
            }

            try {
                const response = await fetch('/api/submit-survey', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    let message = \`<p class="text-gray-700 mb-4">Tu respuesta ha sido registrada correctamente.</p>\`;
                    message += \`<p class="text-gray-600 mb-2"><strong>Prioridad:</strong> \${result.priority}</p>\`;
                    
                    if (result.raffleNumber) {
                        message += \`<div class="bg-[#E6F2F2] border-2 border-[#B3D9D9] rounded-lg p-4 mt-4">\`;
                        message += \`<p class="text-lg font-bold text-[#008080]">🎁 ¡Estás en el sorteo!</p>\`;
                        message += \`<p class="text-2xl font-bold text-[#008080] mt-2">Número: #\${result.raffleNumber}</p>\`;
                        message += \`<p class="text-sm text-gray-600 mt-2">Sorteo: 24 noviembre 2025</p>\`;
                        message += \`</div>\`;
                    }
                    
                    document.getElementById('modalContent').innerHTML = message;
                    document.getElementById('successModal').classList.remove('hidden');
                    document.getElementById('successModal').classList.add('flex');
                }
            } catch (error) {
                alert('Error al enviar la encuesta. Por favor, intenta de nuevo.');
                console.error(error);
            }
        });

        // Update progress on any input change
        form.addEventListener('input', updateProgress);
        form.addEventListener('change', updateProgress);

        // Initialize
        showBlock(0);
        updateProgress();
    </script>
</body>
</html>
  `)
}

export default app
