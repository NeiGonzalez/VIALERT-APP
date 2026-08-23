import { useState, useEffect, useCallback, useRef } from 'react'

const LATIN_LANGS = ['es-AR', 'es-MX', 'es-US', 'es-419', 'es-CO', 'es-CL', 'es-PE', 'es-UY', 'es-VE', 'es-EC', 'es-BO', 'es-PY', 'es-CR', 'es-PA', 'es-GT', 'es-SV', 'es-HN', 'es-NI', 'es-DO', 'es-PR', 'es-CU']
const MALE_NAME_HINTS = ['pablo', 'raul', 'raúl', 'jorge', 'juan', 'carlos', 'diego', 'miguel', 'andres', 'andrés', 'mateo', 'tomas', 'tomás', 'nicolas', 'nicolás', 'alejandro']

function scoreVoice(voice) {
  const lang = (voice.lang || '').replace('_', '-')
  const name = (voice.name || '').toLowerCase()
  let score = 0
  if (LATIN_LANGS.includes(lang)) score += 100
  else if (lang.toLowerCase().startsWith('es-') && lang.toLowerCase() !== 'es-es') score += 70
  else if (lang.toLowerCase() === 'es-es') score += 10
  if (MALE_NAME_HINTS.some(hint => name.includes(hint))) score += 35
  if (lang === 'es-AR') score += 18
  if (lang === 'es-MX') score += 15
  if (lang === 'es-US' || lang === 'es-419') score += 12
  return score
}

function getBestSpanishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || []
  const spanish = voices.filter(v => (v.lang || '').replace('_', '-').toLowerCase().startsWith('es'))
  if (!spanish.length) return null
  return [...spanish].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [supportsSpeech, setSupportsSpeech] = useState(false)
  const recognitionRef = useRef(null)
  const stopTimerRef = useRef(null)
  const dictationCancelledRef = useRef(false)

  useEffect(() => {
    setSupportsSpeech('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    // Fuerza a algunos navegadores a cargar su lista de voces.
    window.speechSynthesis?.getVoices?.()
  }, [])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return
    const voice = getBestSpanishVoice()
    // Nunca usar una voz inglesa para leer castellano.
    if (!voice) return

    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.voice = voice
    utter.lang = voice.lang
    utter.rate = 1.0
    utter.pitch = 0.88
    utter.volume = 1
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }, [])

  const stopListening = useCallback(() => {
    dictationCancelledRef.current = true
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }
    const rec = recognitionRef.current
    recognitionRef.current = null
    try { rec?.stop() } catch (_) {}
    setListening(false)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    window.speechSynthesis?.cancel()

    // Si ya estaba escuchando, cerramos esa sesión antes de iniciar otra.
    stopListening()
    dictationCancelledRef.current = false

    // Ventana máxima: 45 s. El usuario puede terminar antes con el botón.
    const deadline = Date.now() + 45000
    let accumulated = ''
    let sessionFinal = ''
    let sessionInterim = ''

    const launch = () => {
      if (dictationCancelledRef.current || Date.now() >= deadline) {
        stopListening()
        return
      }

      const rec = new SpeechRecognition()
      recognitionRef.current = rec
      rec.lang = 'es-AR'
      rec.continuous = true
      rec.interimResults = true
      rec.maxAlternatives = 1
      sessionFinal = ''
      sessionInterim = ''

      rec.onstart = () => setListening(true)
      rec.onresult = (e) => {
        // Chrome vuelve a entregar los resultados provisionales varias veces.
        // Los provisionales se REEMPLAZAN; sólo los resultados finales se consolidan.
        let finalText = ''
        let interimText = ''

        for (let i = 0; i < e.results.length; i++) {
          const text = (e.results[i][0]?.transcript || '').trim()
          if (!text) continue
          if (e.results[i].isFinal) finalText += `${text} `
          else interimText += `${text} `
        }

        sessionFinal = finalText.trim()
        sessionInterim = interimText.trim()
        const visible = [accumulated, sessionFinal, sessionInterim]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        setTranscript(visible)
      }
      rec.onerror = (e) => {
        const fatal = ['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)
        if (fatal) stopListening()
      }
      rec.onend = () => {
        // Al cerrar una sesión, consolidamos una sola vez lo reconocido.
        // Si Chrome no llegó a marcar el último fragmento como final, conservamos el provisional.
        const sessionText = [sessionFinal, sessionInterim]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (sessionText) {
          accumulated = [accumulated, sessionText]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
          setTranscript(accumulated)
        }

        sessionFinal = ''
        sessionInterim = ''

        if (!dictationCancelledRef.current && Date.now() < deadline) {
          // Chrome puede cortar por una pausa: reabrimos mientras siga dentro de los 45 s.
          window.setTimeout(launch, 120)
        } else {
          setListening(false)
        }
      }

      try {
        rec.start()
      } catch (_) {
        stopListening()
      }
    }

    setTranscript('')
    stopTimerRef.current = window.setTimeout(stopListening, 45000)
    launch()
  }, [stopListening])

  useEffect(() => () => stopListening(), [stopListening])

  return { speaking, listening, transcript, supportsSpeech, speak, startListening, stopListening }
}
