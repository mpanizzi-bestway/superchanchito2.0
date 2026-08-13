import { HistorialHotelesDestino } from './HistorialHotelesDestino'

export function PanelHistorialHoteles({ tipoDestino, destinoId, destino1Id, destino2Id, destinos }) {
  function nombreDestino(id) {
    return destinos.find(d => d.id === id)?.ciudad || ''
  }

  if (tipoDestino === 'unico') {
    if (!destinoId) return null
    return (
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', marginTop: 0 }}>Hoteles más usados en {nombreDestino(destinoId)}</h3>
        <HistorialHotelesDestino destinoId={destinoId} />
      </div>
    )
  }

  if (!destino1Id && !destino2Id) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {destino1Id && (
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginTop: 0 }}>Hoteles más usados en {nombreDestino(destino1Id)}</h3>
          <HistorialHotelesDestino destinoId={destino1Id} />
        </div>
      )}
      {destino2Id && (
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginTop: 0 }}>Hoteles más usados en {nombreDestino(destino2Id)}</h3>
          <HistorialHotelesDestino destinoId={destino2Id} />
        </div>
      )}
    </div>
  )
}