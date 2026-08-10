export function FilaHotelCalculada({ label, hab, habitacionesPax, mostrarChd, mostrarInf, calcular }) {
  return (
    <tr>
      <td style={{ padding: '0.4rem', color: '#555' }}>{label}</td>
      <td style={{ padding: '0.4rem' }}>${calcular('adl').toFixed(2)}</td>
      {mostrarChd && <td style={{ padding: '0.4rem' }}>{habitacionesPax?.chd > 0 ? `$${calcular('chd').toFixed(2)}` : '—'}</td>}
      {mostrarInf && <td style={{ padding: '0.4rem' }}>{habitacionesPax?.inf > 0 ? `$${calcular('inf').toFixed(2)}` : '—'}</td>}
    </tr>
  )
}

export function FilaHotelEditable({ label, hab, hIndex, habIndex, habitacionesPax, mostrarChd, mostrarInf, campo, onEditar }) {
  return (
    <tr>
      <td style={{ padding: '0.4rem', color: '#555' }}>{label}</td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '80px' }} value={hab.adl[campo]}
          onChange={e => onEditar(hIndex, habIndex, 'adl', e.target.value)} />
      </td>
      {mostrarChd && (
        <td style={{ padding: '0.4rem' }}>
          {habitacionesPax?.chd > 0 ? (
            <input type="number" style={{ width: '80px' }} value={hab.chd[campo]}
              onChange={e => onEditar(hIndex, habIndex, 'chd', e.target.value)} />
          ) : '—'}
        </td>
      )}
      {mostrarInf && (
        <td style={{ padding: '0.4rem' }}>
          {habitacionesPax?.inf > 0 ? (
            <input type="number" style={{ width: '80px' }} value={hab.inf[campo]}
              onChange={e => onEditar(hIndex, habIndex, 'inf', e.target.value)} />
          ) : '—'}
        </td>
      )}
    </tr>
  )
}

export function FilaHotelPorcentaje({ hab, habitacionesPax, mostrarChd, mostrarInf }) {
  function pct(tipo) {
    const v = Number(hab[tipo].venta)
    const u = Number(hab[tipo].utilidad)
    if (!v) return '—'
    return `${((u / v) * 100).toFixed(1)}%`
  }
  return (
    <tr>
      <td style={{ padding: '0.4rem', color: '#555' }}>% Utilidad</td>
      <td style={{ padding: '0.4rem' }}>{pct('adl')}</td>
      {mostrarChd && <td style={{ padding: '0.4rem' }}>{habitacionesPax?.chd > 0 ? pct('chd') : '—'}</td>}
      {mostrarInf && <td style={{ padding: '0.4rem' }}>{habitacionesPax?.inf > 0 ? pct('inf') : '—'}</td>}
    </tr>
  )
}