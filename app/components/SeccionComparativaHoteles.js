'use client'

export function SeccionComparativaHoteles({ hotelesOpciones, comparativaHoteles, setComparativaHoteles, generandoComparativa, onGenerar }) {
  if (hotelesOpciones.length < 2) return null

  function actualizarFrase(i, valor) {
    setComparativaHoteles(prev => {
      const nuevo = [...prev]
      nuevo[i] = valor
      return nuevo
    })
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ fontSize: '1rem' }}>Comparativa entre hoteles (para el mensaje de WhatsApp)</h3>
      <button type="button" onClick={onGenerar} disabled={generandoComparativa} style={{ fontSize: '0.8rem' }}>
        {generandoComparativa ? 'Generando...' : (comparativaHoteles.length > 0 ? '✨ Regenerar comparativa' : '✨ Generar comparativa con IA')}
      </button>

      {comparativaHoteles.length > 0 && hotelesOpciones.map((hotel, i) => (
        <div key={i} style={{ marginTop: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#555' }}>Opción {i + 1}</label><br />
          <textarea
            value={comparativaHoteles[i] || ''}
            onChange={e => actualizarFrase(i, e.target.value)}
            rows={2}
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
        </div>
      ))}
    </div>
  )
}