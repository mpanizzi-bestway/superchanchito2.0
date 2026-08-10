export function SeccionViaje({
  tipoDestino, setTipoDestino,
  fechaInicioViaje, setFechaInicioViaje,
  destinoId, setDestinoId,
  diasDestino, setDiasDestino,
  destino1Id, setDestino1Id,
  diasDestino1, setDiasDestino1,
  destino2Id, setDestino2Id,
  diasDestino2, setDiasDestino2,
  destinos,
  mostrarNuevoDestino, setMostrarNuevoDestino,
  nuevoDestinoCiudad, setNuevoDestinoCiudad,
  nuevoDestinoPais, setNuevoDestinoPais,
  guardandoDestino,
  handleAgregarDestino,
}) {
  return (
    <>
      <h2>Datos del Viaje</h2>
      <div>
        <label>
          <input type="radio" name="tipoDestino" checked={tipoDestino === 'unico'} onChange={() => setTipoDestino('unico')} />
          {' '}Destino Único
        </label>{' '}
        <label>
          <input type="radio" name="tipoDestino" checked={tipoDestino === 'doble'} onChange={() => setTipoDestino('doble')} />
          {' '}Doble Destino
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        {tipoDestino === 'unico' ? (
          <>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Destino</label><br />
              <select style={{ width: '100%' }} value={destinoId} onChange={e => setDestinoId(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => <option key={d.id} value={d.id}>{d.ciudad}</option>)}
              </select>
            </div>

            <div>
              <label>Fecha de inicio del viaje</label><br />
              <input style={{ width: '100%' }} type="date" value={fechaInicioViaje} onChange={e => setFechaInicioViaje(e.target.value)} required />
            </div>
            <div>
              <label>Días en destino</label><br />
              <input style={{ width: '100%' }} type="number" min="1" value={diasDestino} onChange={e => setDiasDestino(e.target.value)} required />
            </div>
          </>
        ) : (
          <>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Fecha de inicio del viaje</label><br />
              <input style={{ width: '100%' }} type="date" value={fechaInicioViaje} onChange={e => setFechaInicioViaje(e.target.value)} required />
            </div>

            <div>
              <label>1er Destino</label><br />
              <select style={{ width: '100%' }} value={destino1Id} onChange={e => setDestino1Id(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => <option key={d.id} value={d.id}>{d.ciudad}</option>)}
              </select>
            </div>
            <div>
              <label>Días en 1er Destino</label><br />
              <input style={{ width: '100%' }} type="number" min="1" value={diasDestino1} onChange={e => setDiasDestino1(e.target.value)} required />
            </div>

            <div>
              <label>2do Destino</label><br />
              <select style={{ width: '100%' }} value={destino2Id} onChange={e => setDestino2Id(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => <option key={d.id} value={d.id}>{d.ciudad}</option>)}
              </select>
            </div>
            <div>
              <label>Días en 2do Destino</label><br />
              <input style={{ width: '100%' }} type="number" min="1" value={diasDestino2} onChange={e => setDiasDestino2(e.target.value)} required />
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button type="button" onClick={() => setMostrarNuevoDestino(!mostrarNuevoDestino)}>
          {mostrarNuevoDestino ? '▲ Agregar destino al listado' : '▼ Agregar destino al listado'}
        </button>
        {mostrarNuevoDestino && (
          <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '0.5rem' }}>
            <div>
              <label>Nombre del nuevo destino (ciudad)</label><br />
              <input value={nuevoDestinoCiudad} onChange={e => setNuevoDestinoCiudad(e.target.value)} />
            </div>
            <div>
              <label>País</label><br />
              <input value={nuevoDestinoPais} onChange={e => setNuevoDestinoPais(e.target.value)} />
            </div>
            <button type="button" onClick={handleAgregarDestino} disabled={guardandoDestino}>
              {guardandoDestino ? 'Guardando...' : 'Guardar destino'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}