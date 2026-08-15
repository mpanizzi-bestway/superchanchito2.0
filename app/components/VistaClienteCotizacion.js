import { FotoYMapaHotel } from './FotoYMapaHotel'

export function VistaClienteCotizacion({ cotizacion }) {
  const habitaciones = cotizacion.habitaciones || []
  const hoteles = cotizacion.hoteles || []

  return (
    <div>
      <h1>Cotización de viaje</h1>
      <p>Preparado para: <strong>{cotizacion.cliente?.nombre} {cotizacion.cliente?.apellido}</strong></p>

      <h2>Viaje</h2>
      {cotizacion.tipo_destino === 'unico' ? (
        <p>{cotizacion.destino?.ciudad}, {cotizacion.destino?.pais} — {cotizacion.dias_destino} días</p>
      ) : (
        <>
          <p>{cotizacion.destino1?.ciudad}, {cotizacion.destino1?.pais} — {cotizacion.dias_destino1} días</p>
          <p>{cotizacion.destino2?.ciudad}, {cotizacion.destino2?.pais} — {cotizacion.dias_destino2} días</p>
        </>
      )}
      <p>Fecha de salida: {cotizacion.fecha_inicio_viaje}</p>

      {cotizacion.clima_texto && <p>🌤️ {cotizacion.clima_texto}</p>}

      {cotizacion.itinerario_imagen_url && (
        <img src={cotizacion.itinerario_imagen_url} alt="Itinerario" style={{ maxWidth: '100%', marginTop: '0.5rem' }} />
      )}
      {cotizacion.itinerario && cotizacion.itinerario.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <h3>Vuelos</h3>
          {cotizacion.itinerario.map(s => (
            <p key={s.segmento} style={{ margin: '0.2rem 0' }}>
              {s.aerolineaCod}{s.numeroVuelo} — {s.origen} {s.horaSalida} → {s.destino} {s.horaLlegada}
              {s.llegadaSiguiente ? ' +1' : ''} · {s.fechaSalida}
            </p>
          ))}
        </div>
      )}

      <h2>Habitaciones</h2>
      {habitaciones.map((h, i) => (
        <p key={i}>
          Habitación {i + 1} ({h.composicion}): {h.adl} adultos
          {h.chd > 0 && `, ${h.chd} niños`}
          {h.inf > 0 && `, ${h.inf} infantes`}
        </p>
      ))}

      <h2>Opciones de alojamiento</h2>
      {hoteles.map((hotel, hi) => (
        <div key={hi} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          {hotel.modo === 'doble' ? (
            <>
              <h3>Opción {hi + 1}</h3>
              <p><strong>{hotel.hotel1.nombre}</strong> ({hotel.hotel1.regimen})</p>
              {hotel.hotel1.comentario && <p style={{ fontStyle: 'italic', color: '#555' }}>{hotel.hotel1.comentario}</p>}
              <FotoYMapaHotel lat={hotel.hotel1.lat} lng={hotel.hotel1.lng} fotoUrl={hotel.hotel1.fotoUrl} direccion={hotel.hotel1.direccion} />
              <p style={{ marginTop: '0.75rem' }}><strong>{hotel.hotel2.nombre}</strong> ({hotel.hotel2.regimen})</p>
              {hotel.hotel2.comentario && <p style={{ fontStyle: 'italic', color: '#555' }}>{hotel.hotel2.comentario}</p>}
              <FotoYMapaHotel lat={hotel.hotel2.lat} lng={hotel.hotel2.lng} fotoUrl={hotel.hotel2.fotoUrl} direccion={hotel.hotel2.direccion} />
              {(hotel.hotel1.noRefPrepago || hotel.hotel2.noRefPrepago) && (
                <p style={{ color: '#a00', marginTop: '0.5rem' }}>Tarifa no reembolsable / prepaga</p>
              )}
            </>
          ) : (
            <>
              <h3>Opción {hi + 1}: {hotel.nombre}</h3>
              <p>{hotel.regimen}</p>
              {hotel.comentario && <p style={{ fontStyle: 'italic', color: '#555' }}>{hotel.comentario}</p>}
              <FotoYMapaHotel lat={hotel.lat} lng={hotel.lng} fotoUrl={hotel.fotoUrl} direccion={hotel.direccion} />
              {hotel.noRefPrepago && <p style={{ color: '#a00', marginTop: '0.5rem' }}>Tarifa no reembolsable / prepaga</p>}
            </>
          )}

          {hotel.habitaciones.map((hab, habIndex) => {
            const pax = habitaciones[habIndex]
            return (
              <div key={habIndex} style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' }}>
                <p><strong>Habitación {habIndex + 1}</strong> ({pax?.composicion})</p>
                <p>
                  Adultos: <strong>${hab.adl.venta}</strong>
                  {pax?.chd > 0 && ` · Niños: $${hab.chd.venta}`}
                  {pax?.inf > 0 && ` · Infantes: $${hab.inf.venta}`}
                </p>
              </div>
            )
          })}
        </div>
      ))}

      {cotizacion.paseos && cotizacion.paseos.some(g => g.items?.length > 0) && (
        <>
          <h2>Paseos recomendados</h2>
          {cotizacion.paseos.map((g, i) => (
            g.items?.length > 0 && (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontWeight: 'bold' }}>{g.ciudad}</p>
                {g.items.map((p, j) => (
                  <p key={j} style={{ margin: '0.2rem 0' }}><strong>{p.nombre}</strong> ({p.costo}) — {p.descripcion}</p>
                ))}
              </div>
            )
          ))}
        </>
      )}

      {cotizacion.no_incluye && (
        <p style={{ marginTop: '0.75rem' }}><strong>No incluye:</strong> {cotizacion.no_incluye}</p>
      )}

      {cotizacion.agente && (
        <p style={{ marginTop: '1.5rem', color: '#555', fontSize: '0.9rem' }}>
          Consultas: {cotizacion.agente.nombre} {cotizacion.agente.apellido} · {cotizacion.agente.whatsapp} · {cotizacion.agente.email}
        </p>
      )}
    </div>
  )
}