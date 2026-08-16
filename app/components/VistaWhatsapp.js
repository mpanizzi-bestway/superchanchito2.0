'use client'

import { useState } from 'react'

export function VistaWhatsapp({ texto }) {
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
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={copiar}>{copiado ? '✓ Copiado' : '📋 Copiar texto'}</button>
        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer">
          <button type="button">Abrir en WhatsApp</button>
        </a>
      </div>
      <pre style={{
        whiteSpace: 'pre-wrap', fontFamily: 'inherit',
        background: '#f5f5f5', color: '#111',
        padding: '1rem', borderRadius: '8px', border: '1px solid #ddd',
      }}>
        {texto}
      </pre>
    </div>
  )
}