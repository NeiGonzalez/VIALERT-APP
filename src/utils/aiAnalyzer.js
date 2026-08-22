const URGENT_WORDS = [
  'herido','heridos','grave','graves','muerto','muertos','atrapado','atrapados',
  'explosion','explosión','fuego','incendio','quemado','quemados','arder','ardiendo',
  'niños','ninos','bebe','bebé','familia','casa','vivienda','cerca','proximo','próximo',
  'urgente','ayuda','socorro','morir','muriendo','sangre','inconsciente',
  'vehiculo','camioneta','auto','volcado','derrape','precipicio','barranco',
  'desbarrancó','desbarranco','choque','chocado','volcó','volco','fuego','llamas',
  'humo','negro','espeso','cerca de','a metros','a pocos'
]

export function analyzeUrgency(text, hasImage, hasAudio, isEmergencyButton, confirmations = 0) {
  const lower = (text || '').toLowerCase()
  let score = 0
  let matched = []

  URGENT_WORDS.forEach(word => {
    if (lower.includes(word)) {
      score += 1
      if (!matched.includes(word)) matched.push(word)
    }
  })

  if (hasImage) score += 1
  if (hasAudio) score += 1
  if (isEmergencyButton) score += 6
  if (confirmations >= 2) score += 2
  if (confirmations >= 1) score += 1

  if (score >= 6) {
    return { level: 'ALTA', reason: 'Emergencia confirmada: ' + matched.slice(0,3).join(', ') + (confirmations > 0 ? `, ${confirmations} confirmación${confirmations > 1 ? 'es' : ''}` : '') }
  }
  if (score >= 2) {
    return { level: 'MEDIA', reason: 'Posible riesgo: ' + matched.slice(0,3).join(', ') }
  }
  return { level: 'NORMAL', reason: 'Sin indicios de riesgo inmediato' }
}

// Verificar si un reporte expiró según tipo
export function isExpired(report) {
  const now = Date.now()
  const age = now - report.createdAt
  const hours12 = 12 * 60 * 60 * 1000
  const hours48 = 48 * 60 * 60 * 1000

  if (report.type === 'accident') return age > hours12
  if (report.type === 'fire') return age > hours48
  return false
}
