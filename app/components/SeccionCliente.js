export function SeccionCliente({
  nombre, setNombre,
  apellido, setApellido,
  telefono, setTelefono,
  email, setEmail,
  origenConsulta, setOrigenConsulta,
  seguimiento, setSeguimiento,
}) {
  return (
    <>
      <h2>Datos del Cliente</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label>Nombre</label><br />
          <input style={{ width: '100%' }} value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div>
          <label>Apellido</label><br />
          <input style={{ width: '100%' }} value={apellido} onChange={e => setApellido(e.target.value)} required />
        </div>

        <div>
          <label>Teléfono</label><br />
          <input style={{ width: '100%' }} type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+598 099 123 456" />
        </div>
        <div>
          <label>Email</label><br />
          <input style={{ width: '100%' }} type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div>
          <label>Origen de la consulta</label><br />
          <select style={{ width: '100%' }} value={origenConsulta} onChange={e => setOrigenConsulta(e.target.value)}>
            <option>Redes Sociales</option>
            <option>Ex Cliente</option>
            <option>Referido</option>
            <option>Calle</option>
            <option>Teléfono</option>
            <option>Otros</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label>
            <input type="checkbox" checked={seguimiento} onChange={e => setSeguimiento(e.target.checked)} />
            {' '}Marcar para seguimiento
          </label>
        </div>
      </div>

      {seguimiento && (
        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          Se agendará seguimiento para dentro de 2 días a las 10:10 am.
        </p>
      )}
    </>
  )
}