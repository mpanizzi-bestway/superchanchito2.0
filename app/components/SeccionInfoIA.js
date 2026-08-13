'use client'

import { useState } from 'react'

export function SeccionInfoIA({ climaTexto, setClimaTexto, paseosIA, setPaseosIA, generandoIA }) {
  const [editando, setEditando] = useState(false)

  const hayContenido = climaTexto || paseosIA.some(g => g.items?.length > 0)

  function actualizarPaseo(gi, ii, campo, valor) {
    setPaseosIA(prev => prev.map((g, i) =>
      i !== gi ? g : { ...g, items: g.items.map((p, j) => j !== ii ? p : { ...p, [campo]: valor }) }
    ))
  }

  return (
    <>
      <h2>Información generada por IA</h2>

      {generandoIA && (
        <p style={{ fontSize: '0.85rem', color: '#555' }}>Generando información con IA...</p>
      )}

      {!generandoIA && !hayContenido && (
        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          Se genera automáticamente a los pocos segundos de elegir destino y fecha. También podés forzarlo con "Actualizar datos IA" junto al destino.
        </p>
      )}

      {hayContenido && (
        <>
          <button type="button" onClick={() => setEditando(!editando)} style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            {editando ? '✓ Listo' : '✎ Editar manualmente'}
          </button>

          {climaTexto !== null && (
            editando ? (
              <textarea
                value={climaTexto}
                onChange={e => setClimaTexto(e.target.value)}
                rows={2}
                style={{ width: '100%' }}
              />
            ) : (
              <p>🌤️ {climaTexto}</p>
            )
          )}

          {paseosIA.map((grupo, gi) => (
            grupo.items?.length > 0 && (
              <div key={gi} style={{ marginTop: '0.75rem' }}>
                <p style={{ fontWeight: 'bold' }}>Paseos en {grupo.ciudad}</p>
                {grupo.items.map((p, ii) => (
                  <div key={ii} style={{ marginBottom: '0.5rem' }}>
                    {editando ? (
                      <>
                        <input
                          value={p.nombre}
                          onChange={e => actualizarPaseo(gi, ii, 'nombre', e.target.value)}
                          style={{ fontWeight: 'bold', marginRight: '0.5rem' }}
                        />
                        <input
                          value={p.costo}
                          onChange={e => actualizarPaseo(gi, ii, 'costo', e.target.value)}
                          style={{ width: '120px' }}
                        />
                        <br />
                        <textarea
                          value={p.descripcion}
                          onChange={e => actualizarPaseo(gi, ii, 'descripcion', e.target.value)}
                          rows={2}
                          style={{ width: '100%', marginTop: '0.25rem' }}
                        />
                      </>
                    ) : (
                      <>
                        <p style={{ marginBottom: '0.1rem' }}><strong>{p.nombre}</strong> — {p.costo}</p>
                        <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>{p.descripcion}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )
          ))}
        </>
      )}
    </>
  )
}