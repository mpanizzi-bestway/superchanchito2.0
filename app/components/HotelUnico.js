export function FilaHotelCosto({ label, hotel, hIndex, habIndex, habitacionesPax, mostrarChd, mostrarInf, onCosto }) {
  const hab = hotel.habitaciones[habIndex]
  return (
    <tr>
      <td style={{ padding: '0.4rem' }}>{label}</td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '80px' }} value={hab.adl.costo}
          onChange={e => onCosto(hIndex, habIndex, 'adl', e.target.value)} />
      </td>
      {mostrarChd && (
        <td style={{ padding: '0.4rem' }}>
          {habitacionesPax?.chd > 0 ? (
            <input type="number" style={{ width: '80px' }} value={hab.chd.costo}
              onChange={e => onCosto(hIndex, habIndex, 'chd', e.target.value)} />
          ) : '—'}
        </td>
      )}
      {mostrarInf && (
        <td style={{ padding: '0.4rem' }}>
          {habitacionesPax?.inf > 0 ? (
            <input type="number" style={{ width: '80px' }} value={hab.inf.costo}
              onChange={e => onCosto(hIndex, habIndex, 'inf', e.target.value)} />
          ) : '—'}
        </td>
      )}
    </tr>
  )
}