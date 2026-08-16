'use client'

import { useMemo, useRef } from 'react'
import { parsearAmadeus, airlineName, cityName } from '../lib/amadeus-parser'
import { FAMILIAS_TARIFARIAS } from '../lib/familiasTarifarias'

export function SeccionItinerario({
  itinerarioTexto, setItinerarioTexto,
  itinerarioImagenUrl, subiendoImagen,
  onImagenSeleccionada, onQuitarImagen,
  familiaTarifaria, setFamiliaTarifaria,
}) {
  const inputFileRef = useRef(null)
  const segmentos = useMemo(() => parsearAmadeus(itinerarioTexto), [itinerarioTexto])

  function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) onImagenSeleccionada(file)
        return
      }
    }
    // si no es una imagen, se deja el comportamiento normal (pegar texto)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onImagenSeleccionada(file)
    e.target.value = ''
  }

  return (
    <>
      <h2>Itinerario Aéreo</h2>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Pegá el itinerario en formato Amadeus (Ctrl+V), o pegá directamente una captura de pantalla del itinerario en el mismo recuadro. También podés subir una imagen desde tu PC. Todo es opcional.
      </p>

      <textarea
        value={itinerarioTexto}
        onChange={e => setItinerarioTexto(e.target.value)}
        onPaste={handlePaste}
        rows={6}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
        placeholder={'Ej:\n1  LA 1234 Y 15SEP 2 MVDGRU HK1  0730 1050  15SEP E LA/ABC123\n\n(o pegá acá una captura del itinerario con Ctrl+V)'}
      />

      <div style={{ marginTop: '0.5rem' }}>
        <input
          ref={inputFileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => inputFileRef.current?.click()}
          disabled={subiendoImagen}
          style={{ fontSize: '0.8rem' }}
        >
          {subiendoImagen ? 'Subiendo imagen...' : '📎 Subir imagen del itinerario'}
        </button>
      </div>

      {itinerarioImagenUrl && (
        <div style={{ marginTop: '0.75rem' }}>
          <img
            src={itinerarioImagenUrl}
            alt="Itinerario"
            style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid #ccc', display: 'block' }}
          />
          <button type="button" onClick={onQuitarImagen} style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>
            ✕ Quitar imagen
          </button>
        </div>
      )}

      {itinerarioTexto.trim() !== '' && segmentos.length === 0 && (
        <p style={{ color: '#a00', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          No se reconoció ningún vuelo en el texto pegado — revisá el formato. La cotización se puede guardar igual.
        </p>
      )}

      <div style={{ marginTop: '0.75rem' }}>
        <label>Familia tarifaria</label><br />
        <select value={familiaTarifaria} onChange={e => setFamiliaTarifaria(e.target.value)}>
          <option value="">Seleccionar...</option>
          {Object.keys(FAMILIAS_TARIFARIAS).map(nombre => (
            <option key={nombre} value={nombre}>{nombre}</option>
          ))}
        </select>

        {familiaTarifaria && FAMILIAS_TARIFARIAS[familiaTarifaria] && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#555' }}>
            <p style={{ margin: '0.15rem 0' }}>
              {FAMILIAS_TARIFARIAS[familiaTarifaria].emoji} <strong>Incluye:</strong> {FAMILIAS_TARIFARIAS[familiaTarifaria].incluye}
            </p>
            <p style={{ margin: '0.15rem 0', color: '#a00' }}>
              <strong>No incluye:</strong> {FAMILIAS_TARIFARIAS[familiaTarifaria].noIncluye}
            </p>
          </div>
        )}
      </div>
    </>
  )
}