export function BloqueHotelSimple({ titulo, datos, onCampo, onComision }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '0.75rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{titulo}</p>
      <div>
        <label>Nombre del hotel</label><br />
        <input value={datos.nombre} onChange={e => onCampo('nombre', e.target.value)} placeholder="Ej: Hotel Fasano" />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <label>Régimen</label><br />
        <select value={datos.regimen} onChange={e => onCampo('regimen', e.target.value)}>
          <option>Solo Alojamiento</option>
          <option>Desayuno Incluido</option>
          <option>Media Pensión</option>
          <option>Pensión Completa</option>
          <option>Todo Incluido</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
        <label>
          <input type="checkbox" checked={datos.noRefPrepago} onChange={e => onCampo('noRefPrepago', e.target.checked)} />
          {' '}NO REF/PREPAGO
        </label>
        <div>
          <label>Operador</label><br />
          <input style={{ width: '140px' }} value={datos.operador} onChange={e => onCampo('operador', e.target.value)} />
        </div>
        <div>
          <label>Comm. %</label><br />
          <input type="number" style={{ width: '60px' }} value={datos.comision} onChange={e => onComision(e.target.value)} />
        </div>
      </div>
      {datos.noRefPrepago && (
        <p style={{ fontSize: '0.8rem', color: '#a00', marginTop: '0.4rem' }}>
          Promoción 100% pre paga y en gastos totales (sin devolución)
        </p>
      )}
    </div>
  )
}

export function FilaHotelCostoDoble({ label, hab, hIndex, habIndex, campo, habitacionesPax, mostrarChd, mostrarInf, onCosto }) {
  return (
    <tr>
      <td style={{ padding: '0.3rem' }}>{label}</td>
      <td style={{ padding: '0.3rem' }}>
        <input type="number" style={{ width: '70px' }} value={hab.adl[campo]}
          onChange={e => onCosto(hIndex, habIndex, 'adl', campo, e.target.value)} />
      </td>
      {mostrarChd && (
        <td style={{ padding: '0.3rem' }}>
          {habitacionesPax?.chd > 0 ? (
            <input type="number" style={{ width: '70px' }} value={hab.chd[campo]}
              onChange={e => onCosto(hIndex, habIndex, 'chd', campo, e.target.value)} />
          ) : '—'}
        </td>
      )}
      {mostrarInf && (
        <td style={{ padding: '0.3rem' }}>
          {habitacionesPax?.inf > 0 ? (
            <input type="number" style={{ width: '70px' }} value={hab.inf[campo]}
              onChange={e => onCosto(hIndex, habIndex, 'inf', campo, e.target.value)} />
          ) : '—'}
        </td>
      )}
    </tr>
  )
}