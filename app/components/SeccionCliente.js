export function SeccionCliente({
  nombre, setNombre,
  apellido, setApellido,
  telefono, setTelefono,
  email, setEmail,
  origenConsulta, setOrigenConsulta,
  seguimiento, setSeguimiento,
  agentes, agenteId, setAgenteId,
}) {
  return (
    <>
      <h2>Datos del Cliente</h2>
      <div>
        <label>Agente</label><br />
        <select value={agenteId} onChange={e => setAgenteId(e.target.value)} required>
          <option value="">Seleccionar...</option>
          {agentes.map(a => (
            <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Nombre</label><br />
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div>
        <label>Apellido</label><br />
        <input value={apellido} onChange={e => setApellido(e.target.value)} required />
      </div>
      <div>
        <label>Teléfono</label><br />
        <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+598 099 123 456" />
      </div>
      <div>
        <label>Email</label><br />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Origen de la consulta</label><br />
        <select value={origenConsulta} onChange={e => setOrigenConsulta(e.target.value)}>
          <option>Redes Sociales</option>
          <option>Ex Cliente</option>
          <option>Referido</option>
          <option>Calle</option>
          <option>Teléfono</option>
          <option>Otros</option>
        </select>
      </div>
      <div>
        <label>
          <input type="checkbox" checked={seguimiento} onChange={e => setSeguimiento(e.target.checked)} />
          {' '}Marcar para seguimiento
        </label>
        {seguimiento && (
          <p style={{ fontSize: '0.85rem', color: '#555' }}>
            Se agendará seguimiento para dentro de 2 días a las 10:10 am.
          </p>
        )}
      </div>
    </>
  )
}