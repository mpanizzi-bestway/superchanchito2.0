import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default async function ListaCotizaciones() {
  const { data: cotizaciones, error } = await supabase
    .from('cotizaciones')
    .select(`
      id,
      created_at,
      tipo_destino,
      fecha_inicio_viaje,
      estado,
      cliente:cliente_id ( nombre, apellido ),
      destino:destino_id ( ciudad ),
      destino1:destino1_id ( ciudad ),
      destino2:destino2_id ( ciudad )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <main style={{ padding: '2rem' }}><p>Error al cargar: {error.message}</p></main>
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Cotizaciones</h1>
        <Link href="/nueva"><button>+ Nueva cotización</button></Link>
      </div>

      {cotizaciones.length === 0 ? (
        <p>Todavía no hay cotizaciones cargadas.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Fecha</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Cliente</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Destino</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Salida</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {cotizaciones.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>
                  {new Date(c.created_at).toLocaleDateString('es-UY')}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {c.cliente?.nombre} {c.cliente?.apellido}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {c.tipo_destino === 'unico'
                    ? c.destino?.ciudad || '—'
                    : `${c.destino1?.ciudad || '—'} + ${c.destino2?.ciudad || '—'}`}
                </td>
                <td style={{ padding: '0.5rem' }}>{c.fecha_inicio_viaje || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{c.estado}</td>
                <td style={{ padding: '0.5rem' }}>
                  <Link href={`/cotizacion/${c.id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}