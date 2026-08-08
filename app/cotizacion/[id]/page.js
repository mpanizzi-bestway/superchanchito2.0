import { supabase } from '../../lib/supabase'

export default async function VerCotizacion({ params }) {
  const { id } = await params

  const { data: cotizacion, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      cliente:cliente_id ( nombre, apellido, telefono, email, origen_consulta, seguimiento, fecha_seguimiento, estado_cliente ),
      destino:destino_id ( ciudad, pais ),
      destino1:destino1_id ( ciudad, pais ),
      destino2:destino2_id ( ciudad, pais )
    `)
    .eq('id', id)
    .single()

  if (error || !cotizacion) {
    return <main style={{ padding: '2rem' }}><p>No se encontró la cotización.</p></main>
  }

  const cliente = cotizacion.cliente

  return (
    <main style={{ padding: '2rem', maxWidth: '500px' }}>
      <h1>Cotización</h1>

      <h2>Cliente</h2>
      <p><strong>Nombre:</strong> {cliente?.nombre} {cliente?.apellido}</p>
      <p><strong>Teléfono:</strong> {cliente?.telefono || '—'}</p>
      <p><strong>Email:</strong> {cliente?.email || '—'}</p>
      <p><strong>Origen de la consulta:</strong> {cliente?.origen_consulta || '—'}</p>
      <p><strong>Seguimiento:</strong> {cliente?.seguimiento ? 'Sí' : 'No'}</p>
      {cliente?.seguimiento && (
        <p><strong>Fecha de seguimiento:</strong> {new Date(cliente.fecha_seguimiento).toLocaleString('es-UY')}</p>
      )}
      <p><strong>Estado del cliente:</strong> {cliente?.estado_cliente}</p>

      <hr style={{ margin: '1.5rem 0' }} />

      <h2>Viaje</h2>
      <p><strong>Tipo:</strong> {cotizacion.tipo_destino === 'unico' ? 'Destino Único' : 'Doble Destino'}</p>
      <p><strong>Fecha de inicio:</strong> {cotizacion.fecha_inicio_viaje || '—'}</p>

      {cotizacion.tipo_destino === 'unico' ? (
        <>
          <p><strong>Destino:</strong> {cotizacion.destino?.ciudad}, {cotizacion.destino?.pais}</p>
          <p><strong>Días en destino:</strong> {cotizacion.dias_destino}</p>
        </>
      ) : (
        <>
          <p><strong>1er Destino:</strong> {cotizacion.destino1?.ciudad}, {cotizacion.destino1?.pais} ({cotizacion.dias_destino1} días)</p>
          <p><strong>2do Destino:</strong> {cotizacion.destino2?.ciudad}, {cotizacion.destino2?.pais} ({cotizacion.dias_destino2} días)</p>
        </>
      )}

      <p><strong>Fecha de finalización (calculada):</strong> {cotizacion.fecha_finalizacion || '—'}</p>

      <hr style={{ margin: '1.5rem 0' }} />

      <p><strong>Total:</strong> {cotizacion.total ? `$${cotizacion.total}` : '—'}</p>
      <p><strong>Estado:</strong> {cotizacion.estado}</p>
    </main>
  )
}