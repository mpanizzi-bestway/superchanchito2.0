export function FilaCosto({ label, item, costos, actualizar }) {
  const c = costos[item]
  return (
    <tr>
      <td style={{ padding: '0.4rem' }}>
        <input type="checkbox" checked={c.checked} onChange={e => actualizar(item, 'checked', e.target.checked)} />
      </td>
      <td style={{ padding: '0.4rem' }}>{label}</td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.adl}
          onChange={e => actualizar(item, 'adl', e.target.value)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.chd}
          onChange={e => actualizar(item, 'chd', e.target.value)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.inf}
          onChange={e => actualizar(item, 'inf', e.target.value)} />
      </td>
    </tr>
  )
}

export function FilaCostoTour({ label, item, placeholder, costos, actualizar }) {
  const c = costos[item]
  return (
    <tr>
      <td style={{ padding: '0.4rem' }}>
        <input type="checkbox" checked={c.checked} onChange={e => actualizar(item, 'checked', e.target.checked)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        {label}<br />
        <input
          style={{ width: '160px', fontSize: '0.85rem' }}
          value={c.nombre}
          placeholder={placeholder}
          onChange={e => actualizar(item, 'nombre', e.target.value)}
        />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.adl}
          onChange={e => actualizar(item, 'adl', e.target.value)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.chd}
          onChange={e => actualizar(item, 'chd', e.target.value)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.inf}
          onChange={e => actualizar(item, 'inf', e.target.value)} />
      </td>
    </tr>
  )
}