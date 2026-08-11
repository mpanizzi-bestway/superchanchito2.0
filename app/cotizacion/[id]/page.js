import { supabase } from '../../lib/supabase'
import { airlineName, cityName } from '../../lib/amadeus-parser'

const LABELS_COSTOS = {
  boleto: '✈️ Boleto aéreo',
  traslados: '🚌 Traslados (A/P–HTL–A/P)',
  traslados_interhoteles: '🚌 Traslados (Interhoteles)',
  seguro: '🛡️ Seguro médico y de viaje',
}

function formatoUsd(valor) {
  const n = Number(valor)
  return isNaN(n) ? '0.00' : n.toFixed(2)
}

export default async function VerCotizacion({ params }) {
  const { id } = await params

  const { data: cotizacion, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      cliente:cliente_id ( nombre, apellido, telefono, email, origen_consulta, seguimiento, fecha_seguimiento, estado_cliente ),
      agente:agente_id ( nombre, apellido, cargo, whatsapp, email, interno ),
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
  const habitaciones = cotizacion.habitaciones || []
  const costosFijos = cotizacion.costos_fijos || {}
  const hoteles = cotizacion.hoteles || []

  return (
    <main style={{ padding: '2rem', maxWidth: '700px' }}>
      <h1>Cotización</h1>

      {cotizacion.agente && (
        <p style={{ color: '#555', fontSize: '0.9rem' }}>
          Cotización armada por: <strong>{cotizacion.agente.nombre} {cotizacion.agente.apellido}</strong>
          {cotizacion.agente.cargo && ` — ${cotizacion.agente.cargo}`}
          {cotizacion.agente.interno && ` · Int. ${cotizacion.agente.interno}`}
        </p>
      )}

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

      {cotizacion.itinerario && cotizacion.itinerario.length > 0 && (
        <>
          <hr style={{ margin: '1.5rem 0' }} />
          <h2>Itinerario Aéreo</h2>
          {cotizacion.itinerario.map(s => (
            <p key={s.segmento} style={{ marginBottom: '0.3rem' }}>
              <strong>{airlineName(s.aerolineaCod)} {s.aerolineaCod}{s.numeroVuelo}</strong>
              {' — '}{s.origen} ({cityName(s.origen)}) {s.horaSalida} → {s.destino} ({cityName(s.destino)}) {s.horaLlegada}
              {s.llegadaSiguiente ? ' +1' : ''} · {s.fechaSalida}
            </p>
          ))}
        </>
      )}

      <hr style={{ margin: '1.5rem 0' }} />

      <h2>Habitaciones y Pasajeros</h2>
      {habitaciones.map((h, i) => (
        <p key={i}>
          <strong>Habitación {i + 1}</strong> ({h.composicion}): {h.adl} ADL
          {h.chd > 0 && `, ${h.chd} CHD`}
          {h.inf > 0 && `, ${h.inf} INF`}
        </p>
      ))}

      <hr style={{ margin: '1.5rem 0' }} />

      <h2>Costos Fijos (netos, por pasajero)</h2>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.3rem' }}>Concepto</th>
            <th style={{ textAlign: 'left', padding: '0.3rem' }}>ADL</th>
            <th style={{ textAlign: 'left', padding: '0.3rem' }}>CHD</th>
            <th style={{ textAlign: 'left', padding: '0.3rem' }}>INF</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(costosFijos).map(([key, item]) => {
            if (!item.checked) return null
            const label = LABELS_COSTOS[key] || item.nombre || key
            return (
              <tr key={key}>
                <td style={{ padding: '0.3rem' }}>{label}</td>
                <td style={{ padding: '0.3rem' }}>${item.adl || 0}</td>
                <td style={{ padding: '0.3rem' }}>${item.chd || 0}</td>
                <td style={{ padding: '0.3rem' }}>${item.inf || 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {cotizacion.no_incluye && (
        <p style={{ marginTop: '0.75rem' }}><strong>No incluye:</strong> {cotizacion.no_incluye}</p>
      )}

      <hr style={{ margin: '1.5rem 0' }} />

      <h2>Opciones de Hotel</h2>
      {hoteles.map((hotel, hIndex) => (
        hotel.modo === 'doble'
          ? <OpcionHotelDoble key={hIndex} hotel={hotel} hIndex={hIndex} habitaciones={habitaciones} />
          : <OpcionHotelUnico key={hIndex} hotel={hotel} hIndex={hIndex} habitaciones={habitaciones} />
      ))}
    </main>
  )
}

function OpcionHotelUnico({ hotel, hIndex, habitaciones }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <h3>Opción {hIndex + 1}: {hotel.nombre || '(sin nombre)'}</h3>
      <p><strong>Régimen:</strong> {hotel.regimen} · <strong>Comisión:</strong> {hotel.comision}%</p>
      {hotel.operador && <p><strong>Operador:</strong> {hotel.operador}</p>}
      {hotel.noRefPrepago && (
        <p style={{ color: '#a00' }}>Promoción 100% pre paga y en gastos totales (sin devolución)</p>
      )}

      {hotel.habitaciones.map((hab, habIndex) => {
        const pax = habitaciones[habIndex]
        return (
          <div key={habIndex} style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' }}>
            <p>
              <strong>Habitación {habIndex + 1}</strong>
              {hab.tipoHabitacion && ` — ${hab.tipoHabitacion}`}
              {pax && ` (${pax.composicion})`}
            </p>
            <TablaResultadoHabitacion hab={hab} pax={pax} />
          </div>
        )
      })}
    </div>
  )
}

function OpcionHotelDoble({ hotel, hIndex, habitaciones }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <h3>Opción {hIndex + 1}</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <BloqueHotelResultado titulo="Hotel — 1er destino" datos={hotel.hotel1} />
        <BloqueHotelResultado titulo="Hotel — 2do destino" datos={hotel.hotel2} />
      </div>

      {hotel.habitaciones.map((hab, habIndex) => {
        const pax = habitaciones[habIndex]
        return (
          <div key={habIndex} style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' }}>
            <p>
              <strong>Habitación {habIndex + 1}</strong>
              {pax && ` (${pax.composicion})`}
            </p>
            {(hab.tipoHabitacion1 || hab.tipoHabitacion2) && (
              <p style={{ fontSize: '0.85rem', color: '#555' }}>
                {hab.tipoHabitacion1 && `1er destino: ${hab.tipoHabitacion1}`}
                {hab.tipoHabitacion1 && hab.tipoHabitacion2 && ' · '}
                {hab.tipoHabitacion2 && `2do destino: ${hab.tipoHabitacion2}`}
              </p>
            )}
            <TablaResultadoHabitacion hab={hab} pax={pax} />
          </div>
        )
      })}
    </div>
  )
}

function BloqueHotelResultado({ titulo, datos }) {
  return (
    <div style={{ border: '1px solid #eee', padding: '0.6rem' }}>
      <p style={{ fontWeight: 'bold' }}>{titulo}</p>
      <p>{datos.nombre || '(sin nombre)'}</p>
      <p style={{ fontSize: '0.85rem', color: '#555' }}>{datos.regimen} · Comisión {datos.comision}%</p>
      {datos.operador && <p style={{ fontSize: '0.85rem' }}>Operador: {datos.operador}</p>}
      {datos.noRefPrepago && (
        <p style={{ fontSize: '0.8rem', color: '#a00' }}>Promoción 100% pre paga (sin devolución)</p>
      )}
    </div>
  )
}

function TablaResultadoHabitacion({ hab, pax }) {
  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '0.3rem' }}></th>
          <th style={{ textAlign: 'left', padding: '0.3rem' }}>ADL</th>
          {pax?.chd > 0 && <th style={{ textAlign: 'left', padding: '0.3rem' }}>CHD</th>}
          {pax?.inf > 0 && <th style={{ textAlign: 'left', padding: '0.3rem' }}>INF</th>}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: '0.3rem', color: '#555' }}>Neto</td>
          <td style={{ padding: '0.3rem' }}>${formatoUsd(hab.adl.neto)}</td>
          {pax?.chd > 0 && <td style={{ padding: '0.3rem' }}>${formatoUsd(hab.chd.neto)}</td>}
          {pax?.inf > 0 && <td style={{ padding: '0.3rem' }}>${formatoUsd(hab.inf.neto)}</td>}
        </tr>
        <tr>
          <td style={{ padding: '0.3rem' }}><strong>Precio de venta</strong></td>
          <td style={{ padding: '0.3rem' }}><strong>${hab.adl.venta || 0}</strong></td>
          {pax?.chd > 0 && <td style={{ padding: '0.3rem' }}><strong>${hab.chd.venta || 0}</strong></td>}
          {pax?.inf > 0 && <td style={{ padding: '0.3rem' }}><strong>${hab.inf.venta || 0}</strong></td>}
        </tr>
        <tr>
          <td style={{ padding: '0.3rem', color: '#555' }}>Utilidad</td>
          <td style={{ padding: '0.3rem' }}>${formatoUsd(hab.adl.utilidad)}</td>
          {pax?.chd > 0 && <td style={{ padding: '0.3rem' }}>${formatoUsd(hab.chd.utilidad)}</td>}
          {pax?.inf > 0 && <td style={{ padding: '0.3rem' }}>${formatoUsd(hab.inf.utilidad)}</td>}
        </tr>
      </tbody>
    </table>
  )
}