import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSpeech } from '../hooks/useSpeech'
import { analyzeUrgency } from '../utils/aiAnalyzer'
import ModalMap from './ModalMap'

export default function ReportFlow({ onClose, isOnline }) {
  const [user] = useLocalStorage('ViAlert-APP_user', null)
  const [reports, setReports] = useLocalStorage('ViAlert-APP_reports', [])
  const { speak, startListening, stopListening, listening, transcript, supportsSpeech } = useSpeech()

  const [step, setStep] = useState(0)
  const [type, setType] = useState(null)
  const [atLocation, setAtLocation] = useState(null)
  const [reporterPos, setReporterPos] = useState(null)
  const [incidentPos, setIncidentPos] = useState(null)
  const [description, setDescription] = useState('')
  const [answers, setAnswers] = useState({})
  const [photo, setPhoto] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isEmergency, setIsEmergency] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [mapCenter, setMapCenter] = useState([-42.8, -71.5])
  const [visualMsg, setVisualMsg] = useState('')
  const [gpsLoading, setGpsLoading] = useState(true)

  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const recordingInterval = useRef(null)
  const dictationBase = useRef('')

  const emergencyNumber = type === 'fire' ? '100' : '101'
  const emergencyService = type === 'fire' ? 'Bomberos' : 'Policía'

  // Solo mensaje visual, NO speak() para no interferir con el micrófono
  const showMsg = useCallback((text, visualType = 'info') => {
    setVisualMsg(text)
    setTimeout(() => setVisualMsg(''), 6000)
  }, [])

  // Speak solo para confirmaciones finales, nunca durante escucha
  const announce = useCallback((text) => {
    speak(text)
  }, [speak])

  useEffect(() => {
    let timeoutId
    const getPos = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          p => {
            const pos = [p.coords.latitude, p.coords.longitude]
            setReporterPos(pos)
            setMapCenter(pos)
            setGpsLoading(false)
          },
          () => {
            setReporterPos([-42.8, -71.5])
            setGpsLoading(false)
          },
          { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
        )
        timeoutId = setTimeout(() => {
          if (gpsLoading) {
            setReporterPos([-42.8, -71.5])
            setGpsLoading(false)
          }
        }, 9000)
      } else {
        setReporterPos([-42.8, -71.5])
        setGpsLoading(false)
      }
    }
    getPos()
    showMsg('Seleccioná qué estás viendo. Tocá incendio o accidente.', 'info')
    speak('Seleccioná qué estás viendo. Tocá incendio o accidente.')
    return () => { if (timeoutId) clearTimeout(timeoutId) }
  }, [])

  useEffect(() => {
    if (listening) return
    if (step === 1) {
      speak('Indicá si estás en el lugar del incidente o si lo ves desde otro lugar.')
    } else if (step === 2) {
      speak('Completá los detalles. Si no podés escribir, podés dictar la descripción o grabar un audio.')
    } else if (step === 3) {
      speak('Revisá el reporte y presioná enviar reporte.')
    }
  }, [step])

  useEffect(() => {
    if (transcript && step === 2) {
      const base = dictationBase.current
      setDescription(base ? `${base} ${transcript}` : transcript)
    }
  }, [transcript, step])

  useEffect(() => {
    if (recording) {
      setRecordingTime(0)
      recordingInterval.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
        recordingInterval.current = null
      }
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current)
    }
  }, [recording])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const startAudioRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunks.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setRecording(false)
      }
      mr.start()
      mediaRecorder.current = mr
      setRecording(true)
      showMsg('Grabando audio. Tocá detener cuando termines.', 'info')
    } catch {
      alert('No se pudo acceder al micrófono. Verificá los permisos.')
    }
  }

  const stopAudioRec = () => {
    mediaRecorder.current?.stop()
    mediaRecorder.current?.stream.getTracks().forEach(t => t.stop())
    showMsg('Audio guardado.', 'success')
    announce('Audio guardado.')
  }

  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setPhoto(dataUrl)
      stream.getTracks().forEach(t => t.stop())
      showMsg('Foto capturada.', 'success')
    } catch {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      input.onchange = e => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = ev => { setPhoto(ev.target.result); showMsg('Foto cargada.', 'success') }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    }
  }

  const toggleAnswer = (key) => {
    setAnswers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const runAI = () => {
    const result = analyzeUrgency(description, !!photo, !!audioBlob, isEmergency)
    setAiResult(result)
    showMsg(`Análisis completado. Prioridad ${result.level}. ${result.reason}`, result.level === 'ALTA' ? 'danger' : 'info')
    announce(`Análisis completado. Prioridad ${result.level}.`)
  }

  const submit = () => {
    const report = {
      id: 'rep-' + Date.now(),
      type,
      createdAt: Date.now(),
      status: isOnline ? 'sent' : 'pending',
      reporterName: user?.name || 'Anónimo',
      reporterPhone: user?.phone || 'No registrado',
      reporterLat: reporterPos?.[0] || mapCenter[0],
      reporterLng: reporterPos?.[1] || mapCenter[1],
      incidentLat: atLocation ? reporterPos?.[0] : (incidentPos?.[0] || reporterPos?.[0]),
      incidentLng: atLocation ? reporterPos?.[1] : (incidentPos?.[1] || reporterPos?.[1]),
      description,
      answers,
      photo,
      audio: audioUrl,
      priority: aiResult?.level || 'NORMAL',
      aiReason: aiResult?.reason || '',
      viewed: false,
      confirmaciones: []
    }
    setReports(prev => [report, ...prev])
    setSubmitted(true)
    if (isOnline) {
      showMsg(`Reporte enviado. Si estás en peligro, llamá al ${emergencyNumber} (${emergencyService}).`, 'success')
      announce(`Reporte enviado. Si estás en peligro, llamá al ${emergencyNumber}.`)
    } else {
      showMsg(`Reporte guardado. Se enviará automáticamente cuando tengas señal. Cuando tengas señal de teléfono, podés llamar al ${emergencyNumber} (${emergencyService}).`, 'warning')
      announce(`Reporte guardado. Se enviará cuando recuperes señal.`)
    }
  }

  if (submitted) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{isOnline ? '✅' : '💾'}</div>
          <h2 style={{ marginBottom: '0.5rem' }}>
            {isOnline ? 'Reporte enviado' : 'Reporte guardado'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {isOnline
              ? 'El reporte ya fue enviado a los bomberos.'
              : 'El reporte quedó guardado en tu celular.'}
          </p>

          {!isOnline && (
            <div className="visual-banner warning" style={{ marginBottom: '1rem' }}>
              📡 Sin internet. El reporte se enviará automáticamente cuando recuperes señal.
            </div>
          )}

          <div className="visual-banner info" style={{ marginBottom: '1.5rem' }}>
            📞 Si estás en peligro, llamá al <b>{emergencyNumber}</b> ({emergencyService})
          </div>

          <button className="btn-primary" style={{ background: '#FF3B30' }} onClick={onClose}>Volver al mapa</button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {visualMsg && (
          <div className={`visual-banner ${
            visualMsg.includes('peligro') ? 'danger' :
            visualMsg.includes('completado') || visualMsg.includes('guardado') || visualMsg.includes('enviado') ? 'success' :
            visualMsg.includes('señal') || visualMsg.includes('Sin internet') ? 'warning' : 'info'
          }`}>
            {visualMsg}
          </div>
        )}

        {gpsLoading && (
          <div className="visual-banner info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }} />
            Buscando tu ubicación por GPS...
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>
            {step === 0 && '¿Qué estás viendo?'}
            {step === 1 && '¿Dónde estás?'}
            {step === 2 && 'Detalles del reporte'}
            {step === 3 && 'Revisar y enviar'}
          </h2>
          <button className="btn-secondary" style={{ minHeight: '40px', width: '40px', padding: 0 }} onClick={onClose}>✕</button>
        </div>

        {step === 0 && (
          <div>
            <div className="visual-banner info">
              📍 Tu ubicación se toma automáticamente por GPS
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button style={{ flex: 1, minHeight: '80px', fontSize: '1.25rem', background: '#FF3B30', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => { setType('fire'); showMsg('Incendio seleccionado. Indicá dónde estás.', 'info'); setStep(1) }}>
                🔥 Incendio
              </button>
              <button className="btn-accident" style={{ flex: 1, minHeight: '80px', fontSize: '1.25rem' }}
                onClick={() => { setType('accident'); showMsg('Accidente seleccionado. Indicá dónde estás.', 'info'); setStep(1) }}>
                💥 Accidente
              </button>
            </div>

            {supportsSpeech && (
              <button className="btn-secondary" style={{ width: '100%', minHeight: '64px', marginBottom: '1rem' }}
                onClick={() => {
                  startListening()
                  showMsg('Hablá ahora. Decime qué estás viendo.', 'info')
                }}>
                {listening ? '🔴 Escuchando...' : '🎤 Reportar hablando'}
              </button>
            )}
            {listening && (
              <div className="listening-indicator" role="status" aria-live="polite">
                <div className="voice-bars" aria-hidden="true"><i/><i/><i/><i/><i/></div>
                <span>Escuchando... hablá ahora</span>
              </div>
            )}
            {transcript && (
              <div className="card" style={{ marginTop: '1rem' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{transcript}"</p>
                <button className="btn-primary" style={{ marginTop: '0.75rem', background: '#FF3B30' }}
                  onClick={() => {
                    const t = transcript.toLowerCase()
                    if (t.includes('incendio') || t.includes('fuego') || t.includes('quema') || t.includes('llama')) {
                      setType('fire')
                    } else if (t.includes('accidente') || t.includes('choque') || t.includes('volc') || t.includes('derrape')) {
                      setType('accident')
                    }
                    setStep(1)
                  }}>
                  Continuar con este texto
                </button>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="visual-banner success">
              ✅ Tu ubicación GPS ya fue guardada
            </div>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Indicá si estás en el lugar del incidente o si lo viste desde otro lado.
            </p>
            <div className="radio-group" style={{ marginBottom: '1.5rem' }}>
              <div className={`radio-option ${atLocation === true ? 'selected' : ''}`}
                onClick={() => { setAtLocation(true); setIncidentPos(null); showMsg('Perfecto. Continuá con los detalles.', 'success') }}>
                <input type="radio" checked={atLocation === true} readOnly />
                <span>Estoy en el lugar del incidente</span>
              </div>
              <div className={`radio-option ${atLocation === false ? 'selected' : ''}`}
                onClick={() => { setAtLocation(false); showMsg('Marcá en el mapa dónde viste el incidente.', 'info') }}>
                <input type="radio" checked={atLocation === false} readOnly />
                <span>Lo veo desde lejos / pasé por ahí</span>
              </div>
            </div>

            {atLocation === false && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="visual-banner warning">
                  👆 Tocá en el mapa para marcar la ubicación del incidente
                </div>
                <div style={{ height: '320px', borderRadius: 'var(--border-radius)', overflow: 'hidden', border: '2px solid var(--accent-warning)', background: '#1a1a2e' }}>
                  <ModalMap 
                    center={mapCenter} 
                    reporterPos={reporterPos}
                    onPick={(lat, lng) => {
                      setIncidentPos([lat, lng])
                      showMsg('Ubicación marcada. Continuá.', 'success')
                    }}
                  />
                </div>
                {incidentPos && (
                  <div className="visual-banner success" style={{ marginTop: '0.5rem' }}>
                    ✅ Incidente marcado: {incidentPos[0].toFixed(4)}, {incidentPos[1].toFixed(4)}
                  </div>
                )}
              </div>
            )}

            <button className="btn-primary" style={{ background: '#FF3B30' }} disabled={atLocation === null || (atLocation === false && !incidentPos)}
              onClick={() => { showMsg('Ahora completá los detalles.', 'info'); setStep(2) }}>
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="scroll-container" style={{ padding: 0, maxHeight: '55vh', overflowY: 'auto' }}>
            {type === 'fire' && (
              <>
                <div className="toggle-row" onClick={() => toggleAnswer('genteCerca')}>
                  <span>¿Hay gente cerca?</span>
                  <div className={`toggle-switch ${answers.genteCerca ? 'on' : ''}`} />
                </div>
                <div className="toggle-row" onClick={() => toggleAnswer('viviendasRiesgo')}>
                  <span>¿Hay viviendas en riesgo?</span>
                  <div className={`toggle-switch ${answers.viviendasRiesgo ? 'on' : ''}`} />
                </div>
                <div className="toggle-row" onClick={() => toggleAnswer('humoVisible')}>
                  <span>¿Hay humo visible?</span>
                  <div className={`toggle-switch ${answers.humoVisible ? 'on' : ''}`} />
                </div>
              </>
            )}
            {type === 'accident' && (
              <>
                <div className="toggle-row" onClick={() => toggleAnswer('heridos')}>
                  <span>¿Hay heridos?</span>
                  <div className={`toggle-switch ${answers.heridos ? 'on' : ''}`} />
                </div>
                <div className="toggle-row" onClick={() => toggleAnswer('ambulancia')}>
                  <span>¿Necesita ambulancia?</span>
                  <div className={`toggle-switch ${answers.ambulancia ? 'on' : ''}`} />
                </div>
                <div className="toggle-row" onClick={() => toggleAnswer('vehiculoCalzada')}>
                  <span>¿El vehículo está en la calzada?</span>
                  <div className={`toggle-switch ${answers.vehiculoCalzada ? 'on' : ''}`} />
                </div>
              </>
            )}

            <label style={{ marginTop: '1rem' }}>Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describí lo que ves..."
            />

            {supportsSpeech && (
              <button
                className={listening ? 'btn-danger' : 'btn-secondary'}
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={() => {
                  if (listening) {
                    stopListening()
                    showMsg('Dictado finalizado.', 'success')
                  } else {
                    dictationBase.current = description.trim()
                    startListening()
                    showMsg('Describí lo que ves. Te escucho.', 'info')
                  }
                }}>
                {listening ? '⏹ Terminar dictado' : '🎤 Dictar descripción'}
              </button>
            )}
            {listening && (
              <div className="listening-indicator" role="status" aria-live="polite">
                <div className="voice-bars" aria-hidden="true"><i/><i/><i/><i/><i/></div>
                <span>Escuchando tu descripción...</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={takePhoto}>
                📷 {photo ? 'Cambiar foto' : 'Agregar foto'}
              </button>
              <button className={recording ? 'btn-danger' : 'btn-secondary'} style={{ flex: 1 }}
                onClick={recording ? stopAudioRec : startAudioRec}>
                {recording ? '⏹ Detener' : '🎙 Grabar audio'}
              </button>
            </div>

            {recording && (
              <div className="recording-indicator">
                <div className="recording-dot" />
                <span style={{ fontWeight: 600 }}>Grabando audio</span>
                <span className="recording-timer">{formatTime(recordingTime)}</span>
              </div>
            )}

            {photo && (
              <div style={{ marginTop: '1rem', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
                <img src={photo} alt="Captura" style={{ width: '100%', display: 'block' }} />
              </div>
            )}
            {audioUrl && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Audio grabado:</p>
                <audio controls src={audioUrl} style={{ width: '100%' }} />
              </div>
            )}

            <div className="toggle-row" style={{ marginTop: '1.5rem', background: isEmergency ? 'rgba(255,59,48,0.15)' : undefined }}
              onClick={() => setIsEmergency(!isEmergency)}>
              <span style={{ fontWeight: 700, color: isEmergency ? '#FF3B30' : undefined }}>
                🚨 Esto es una emergencia urgente
              </span>
              <div className={`toggle-switch ${isEmergency ? 'on' : ''}`} />
            </div>

            <button className="btn-primary" style={{ marginTop: '1.5rem', background: '#FF3B30' }}
              onClick={() => { runAI(); setStep(3) }}>
              Revisar reporte
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="card" style={{ borderLeft: `4px solid ${type==='fire'?'#FF3B30':'#3b82f6'}` }}>
              <p style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                {type === 'fire' ? '🔥 Incendio' : '💥 Accidente'}
              </p>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{description || 'Sin descripción'}</p>
            </div>

            {aiResult && (
              <div className="card" style={{
                background: aiResult.level==='ALTA' ? 'rgba(255,59,48,0.15)' : aiResult.level==='MEDIA' ? 'rgba(234,179,8,0.15)' : undefined
              }}>
                <p style={{ fontWeight: 700 }}>
                  Prioridad IA: {aiResult.level}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {aiResult.reason}
                </p>
              </div>
            )}

            <div className="card">
              <p style={{ fontSize: '0.9rem' }}><b>Tu ubicación:</b> {reporterPos?.[0].toFixed(4)}, {reporterPos?.[1].toFixed(4)}</p>
              {!atLocation && incidentPos && (
                <p style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  <b>Incidente:</b> {incidentPos[0].toFixed(4)}, {incidentPos[1].toFixed(4)}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                Volver
              </button>
              <button className="btn-primary" style={{ flex: 2, background: '#FF3B30' }} onClick={submit}>
                {isOnline ? 'Enviar reporte' : 'Guardar reporte'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
