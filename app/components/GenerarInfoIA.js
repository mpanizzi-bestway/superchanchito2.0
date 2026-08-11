'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function GenerarInfoIA({ cotizacionId, destinos, fechaInicioViaje, climaGuardado, paseosGuardados }) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [clima, setClima] = useState(climaGuardado || null)
  const [paseos, setPaseos] = useState(paseosGuardados || [])
  const [error, setError] = useState('')

  async function generar() {
    setCargando(true)
    setError('')

    const mesIndex = fechaInicioViaje ? new Date(fechaInicioViaje + 'T00:00:00').getMonth() : null
    const mes = mesIndex !== null ? MESES[mesIndex] : ''

    try {
      const [resClima, ...resPaseosArr] = await Promise.all([
        fetch('/api/clima', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinos, mes }),
        }).then(r => r.json()).catch(() => ({ texto: null })),
        ...destinos.map(d =>
          fetch('/api/paseos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ciudad: d.ciudad, pais: d.pais }),
          }).then(r => r.json()).catch(() => ({ paseos: [] }))
        ),
      ])

      const nuevoClima = resClima?.texto || null
      const nuevosPaseos = destinos.map((d, i) => ({
        ciudad: d.ciudad,
        items: resPaseosArr[i]?.paseos || [],
      }))

      setClima(nuevoClima)
      setPaseos(nuevosPaseos)

      await supabase
        .from('cotizaciones')
        .update({ clima_texto: nuevoClima, paseos: nuevosPaseos })
        .eq('id', cotizacionId)

      router.refresh()
    } catch {
      setError('Hubo un problema generando la información. Podés reintentar.')
    }

    setCargando(false)
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <button type="button" onClick={generar} disabled={cargando}>
        {cargando ? 'Generando...' : (clima || paseos.some(p => p.items?.length > 0)) ? 'Regenerar información con IA' : 'Generar información con IA'}
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}

      {clima && <p style={{ marginTop: '0.75rem' }}>🌤️ {clima}</p>}

      {paseos.map((grupo, i) => (
        grupo.items?.length > 0 && (
          <div key={i} style={{ marginTop: '0.75rem' }}>
            <p style={{ fontWeight: 'bold' }}>Paseos en {grupo.ciudad}</p>
            {grupo.items.map((p, j) => (
              <div key={j} style={{ marginBottom: '0.5rem' }}>
                <p style={{ marginBottom: '0.1rem' }}><strong>{p.nombre}</strong> — {p.costo}</p>
                <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>{p.descripcion}</p>
              </div>
            ))}
          </div>
        )
      ))}
    </div>
  )
}