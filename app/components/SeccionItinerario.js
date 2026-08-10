'use client'

import { useMemo } from 'react'
import { parsearAmadeus, airlineName, cityName } from '../lib/amadeus-parser'

export function SeccionItinerario({ itinerarioTexto, setItinerarioTexto }) {
  const segmentos = useMemo(() => parsearAmadeus(itinerarioTexto), [itinerarioTexto])

  return (
    <>
      <h2>Itinerario Aéreo</h2>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>
        Pegá el itinerario tal como lo copiás desde la pantalla de vuelos de Amadeus. Opcional — se puede dejar en blanco y cargar más adelante.
      </p>
      <textarea
        value={itinerarioTexto}
        onChange={e => setItinerarioTexto(e.target.value)}
        rows={6}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
        placeholder={'Ej:\n1  LA 1234 Y 15SEP 2 MVDGRU HK1  0730 1050  15SEP E LA/ABC123\n2  LA 5678 Y 15SEP 2 GRUEZE HK1  1230 1420  15SEP E LA/ABC123'}
      />

      {itinerarioTexto.trim() !== '' && (
        segmentos.length === 0 ? (
          <p style={{ color: '#a00', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            No se reconoció ningún vuelo en el texto pegado — revisá el formato. La cotización se puede guardar igual, sin itinerario.
          </p>
        ) : (
          <div style={{ marginTop: '0.75rem' }}>
            {segmentos.map(s => (
              <div
                key={s.segmento}
                style={{
                  display: 'flex', gap: '1rem', flexWrap: 'wrap',
                  padding: '0.5rem', borderBottom: '1px solid #eee', fontSize: '0.9rem',
                }}
              >
                <span style={{ minWidth: '160px' }}>{airlineName(s.aerolineaCod)} {s.aerolineaCod}{s.numeroVuelo}</span>
                <span>{s.origen} ({cityName(s.origen)}) {s.horaSalida}</span>
                <span>→</span>
                <span>{s.destino} ({cityName(s.destino)}) {s.horaLlegada}{s.llegadaSiguiente ? ' +1' : ''}</span>
                <span style={{ color: '#555' }}>{s.fechaSalida}</span>
              </div>
            ))}
          </div>
        )
      )}
    </>
  )
}