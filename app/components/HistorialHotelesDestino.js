'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function HistorialHotelesDestino({ destinoId }) {
  const [hoteles, setHoteles] = useState(null) // null = todavía no se consultó
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    setHoteles(null)
    if (!destinoId) return

    setCargando(true)
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('hoteles_historial')
        .select('nombre_hotel, costo_por_noche')
        .eq('destino_id', destinoId)

      if (error || !data) {
        setHoteles([])
        setCargando(false)
        return
      }

      const agrupado = {}
      data.forEach(row => {
        const key = row.nombre_hotel.trim().toLowerCase()
        if (!agrupado[key]) agrupado[key] = { nombre: row.nombre_hotel.trim(), suma: 0, veces: 0 }
        agrupado[key].suma += Number(row.costo_por_noche) || 0
        agrupado[key].veces += 1
      })

      const lista = Object.values(agrupado)
        .map(h => ({ nombre: h.nombre, veces: h.veces, promedio: h.suma / h.veces }))
        .sort((a, b) => b.veces - a.veces)
        .slice(0, 15)

      setHoteles(lista)
      setCargando(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [destinoId])

  if (cargando) return <p style={{ fontSize: '0.8rem', color: '#555' }}>Consultando historial...</p>
  if (hoteles === null) return null
  if (hoteles.length === 0) return <p style={{ fontSize: '0.8rem', color: '#555' }}>Sin registros previos para este destino todavía.</p>

  return (
    <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '0.85rem' }}>
      {hoteles.map((h, i) => (
        <li key={i} style={{ marginBottom: '0.3rem' }}>
          {h.nombre} — ${h.promedio.toFixed(0)}/noche <span style={{ color: '#888' }}>({h.veces}x)</span>
        </li>
      ))}
    </ul>
  )
}