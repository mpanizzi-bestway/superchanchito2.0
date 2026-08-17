'use client'

import { useState } from 'react'

export function VistaWhatsapp({ secciones, texto }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // no bloquea
    }
  }

  return (
    <div style={{ color: '#111', background: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#111' }}>Texto para WhatsApp</h1>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Los colores son solo para revisar acá — WhatsApp no soporta color de texto ni imágenes incrustadas en el mensaje; la foto se comparte aparte como archivo si hace falta.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={copiar}>{copiado ? '✓ Copiado' : '📋 Copiar texto completo'}</button>
        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer">
          <button type="button">Abrir en WhatsApp</button>
        </a>
      </div>

      <pre style={bloqueEstilo('#e7f3ff')}>{secciones.encabezado}</pre>
      <pre style={bloqueEstilo('#f5f5f5')}>{secciones.antesOpciones}</pre>

      {secciones.opciones.map((opcion, i) => (
        <div key={i} style={bloqueEstilo('#f5f5f5')}>
          {opcion.fotos.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {opcion.fotos.map((foto, j) => (
                <img
                  key={j}
                  src={foto.url}
                  alt={foto.label || 'Hotel'}
                  style={{ width: '120px', height: '120px', objectFit: 'cover', border: '1px solid #ccc' }}
                />
              ))}
            </div>
          )}
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#111', margin: 0 }}>{opcion.texto}</pre>
        </div>
      ))}

      {secciones.despuesOpciones && <pre style={bloqueEstilo('#f5f5f5')}>{secciones.despuesOpciones}</pre>}
      <pre style={bloqueEstilo('#e7f3ff')}>{secciones.cierre}</pre>
    </div>
  )
}

function bloqueEstilo(fondo) {
  return {
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    background: fondo,
    color: '#111',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginBottom: '0.75rem',
  }
}