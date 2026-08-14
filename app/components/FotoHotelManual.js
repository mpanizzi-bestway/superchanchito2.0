'use client'

import { useState } from 'react'

export function FotoHotelManual({ fotoConsultada, hayNombre, onGuardarUrl }) {
  const [urlInput, setUrlInput] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function handleGuardar() {
    if (!urlInput.trim()) return
    setGuardando(true)
    await onGuardarUrl(urlInput.trim())
    setGuardando(false)
    setUrlInput('')
  }

  if (!hayNombre) return null

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {fotoConsultada === false && (
        <p style={{ fontSize: '0.8rem', color: '#555' }}>Buscando imagen guardada...</p>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="Pegar URL de imagen"
          style={{ flex: 1, fontSize: '0.8rem' }}
        />
        <button type="button" onClick={handleGuardar} disabled={guardando || !urlInput.trim()} style={{ fontSize: '0.8rem' }}>
          {guardando ? 'Guardando...' : 'Guardar imagen'}
        </button>
      </div>
    </div>
  )
}