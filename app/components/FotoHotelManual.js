'use client'

import { useState, useEffect } from 'react'

export function FotoHotelManual({ fotoUrl, estrellas, link, fotoConsultada, hayNombre, onGuardar }) {
  const [urlInput, setUrlInput] = useState('')
  const [estrellasInput, setEstrellasInput] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    setUrlInput(fotoUrl || '')
    setEstrellasInput(estrellas ? String(estrellas) : '')
    setLinkInput(link || '')
  }, [fotoUrl, estrellas, link])

  async function handleGuardar() {
    setGuardando(true)
    await onGuardar({
      url: urlInput.trim(),
      estrellas: estrellasInput ? Number(estrellasInput) : null,
      link: linkInput.trim(),
    })
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  if (!hayNombre) return null

  return (
    <div style={{ marginTop: '0.5rem', border: '1px dashed #ccc', padding: '0.5rem' }}>
      {fotoConsultada === false && (
        <p style={{ fontSize: '0.8rem', color: '#555', margin: '0 0 0.4rem' }}>Buscando datos guardados...</p>
      )}
      {link && (
        <p style={{ fontSize: '0.8rem', margin: '0 0 0.4rem' }}>
          🔗 <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="URL de imagen"
          style={{ flex: '1 1 200px', fontSize: '0.8rem', color: '#111', background: '#fff', border: '1px solid #ccc', padding: '0.2rem' }}
        />
        <select
          value={estrellasInput}
          onChange={e => setEstrellasInput(e.target.value)}
          style={{ fontSize: '0.8rem', color: '#111', background: '#fff', border: '1px solid #ccc', padding: '0.2rem' }}
        >
          <option value="">★ Estrellas</option>
          <option value="1">★</option>
          <option value="2">★★</option>
          <option value="3">★★★</option>
          <option value="4">★★★★</option>
          <option value="5">★★★★★</option>
        </select>
      </div>
      <input
        value={linkInput}
        onChange={e => setLinkInput(e.target.value)}
        placeholder="Link del sitio del hotel"
        style={{ width: '100%', fontSize: '0.8rem', marginTop: '0.4rem', color: '#111', background: '#fff', border: '1px solid #ccc', padding: '0.2rem' }}
      />
      <button type="button" onClick={handleGuardar} disabled={guardando} style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
        {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar datos del hotel'}
      </button>
    </div>
  )
}