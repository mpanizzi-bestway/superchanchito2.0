import { composicion } from '../lib/calculos'

export function SeccionHabitaciones({
  cantidadHabitaciones, handleCantidadHabitaciones,
  habitaciones, actualizarHabitacion,
  mostrarColumnaChd, mostrarColumnaInf,
}) {
  return (
    <>
      <h2>Habitaciones y Pasajeros</h2>
      <div>
        <label>Cantidad de habitaciones</label><br />
        <select value={cantidadHabitaciones} onChange={e => handleCantidadHabitaciones(Number(e.target.value))}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>

      <table style={{ marginTop: '1rem', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.4rem' }}>Habitación</th>
            <th style={{ textAlign: 'left', padding: '0.4rem' }}>Adultos</th>
            {mostrarColumnaChd && <th style={{ textAlign: 'left', padding: '0.4rem' }}>Niños (2–11)</th>}
            {mostrarColumnaInf && <th style={{ textAlign: 'left', padding: '0.4rem' }}>Infantes (0–1,99)</th>}
            <th style={{ textAlign: 'left', padding: '0.4rem' }}>Composición</th>
          </tr>
        </thead>
        <tbody>
          {habitaciones.map((h, i) => (
            <tr key={i}>
              <td style={{ padding: '0.4rem' }}>Habitación {i + 1}</td>
              <td style={{ padding: '0.4rem' }}>
                <input
                  type="number" min="1" max="5" style={{ width: '60px' }}
                  value={h.adl}
                  onChange={e => actualizarHabitacion(i, 'adl', Number(e.target.value) || 1)}
                />
              </td>
              {mostrarColumnaChd && (
                <td style={{ padding: '0.4rem' }}>
                  {h.chd > 0 ? (
                    <>
                      <input
                        type="number" min="0" style={{ width: '60px' }}
                        value={h.chd}
                        onChange={e => actualizarHabitacion(i, 'chd', Number(e.target.value) || 0)}
                      />
                      {' '}
                      <button type="button" onClick={() => actualizarHabitacion(i, 'chd', 0)} title="Quitar">✕</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => actualizarHabitacion(i, 'chd', 1)}>+ Niño</button>
                  )}
                </td>
              )}
              {mostrarColumnaInf && (
                <td style={{ padding: '0.4rem' }}>
                  {h.inf > 0 ? (
                    <>
                      <input
                        type="number" min="0" style={{ width: '60px' }}
                        value={h.inf}
                        onChange={e => actualizarHabitacion(i, 'inf', Number(e.target.value) || 0)}
                      />
                      {' '}
                      <button type="button" onClick={() => actualizarHabitacion(i, 'inf', 0)} title="Quitar">✕</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => actualizarHabitacion(i, 'inf', 1)}>+ Infante</button>
                  )}
                </td>
              )}
              <td style={{ padding: '0.4rem', color: '#555' }}>{composicion(h.adl)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!mostrarColumnaChd && (
        <button type="button" style={{ marginTop: '0.5rem', marginRight: '0.5rem' }}
          onClick={() => actualizarHabitacion(0, 'chd', 1)}>
          + Agregar niños a alguna habitación
        </button>
      )}
      {!mostrarColumnaInf && (
        <button type="button" style={{ marginTop: '0.5rem' }}
          onClick={() => actualizarHabitacion(0, 'inf', 1)}>
          + Agregar infantes a alguna habitación
        </button>
      )}
    </>
  )
}