export function generarTextoWhatsapp(cotizacion) {
  const lineas = []
  lineas.push(`*Cotización de viaje* ✈️`)
  lineas.push(`Preparado para: ${cotizacion.cliente?.nombre} ${cotizacion.cliente?.apellido}`)
  lineas.push('')

  if (cotizacion.tipo_destino === 'unico') {
    lineas.push(`📍 Destino: ${cotizacion.destino?.ciudad}, ${cotizacion.destino?.pais}`)
    lineas.push(`Duración: ${cotizacion.dias_destino} días`)
  } else {
    lineas.push(`📍 Destinos: ${cotizacion.destino1?.ciudad} (${cotizacion.dias_destino1} días) + ${cotizacion.destino2?.ciudad} (${cotizacion.dias_destino2} días)`)
  }
  lineas.push(`📅 Salida: ${cotizacion.fecha_inicio_viaje}`)
  lineas.push('')

  if (cotizacion.clima_texto) {
    lineas.push(`🌤️ ${cotizacion.clima_texto}`)
    lineas.push('')
  }

  const habitaciones = cotizacion.habitaciones || []
  const hoteles = cotizacion.hoteles || []

  hoteles.forEach((hotel, hi) => {
    lineas.push(`*Opción ${hi + 1}*`)
    if (hotel.modo === 'doble') {
      lineas.push(`🏨 ${hotel.hotel1.nombre} (${hotel.hotel1.regimen})`)
      lineas.push(`🏨 ${hotel.hotel2.nombre} (${hotel.hotel2.regimen})`)
    } else {
      lineas.push(`🏨 ${hotel.nombre} (${hotel.regimen})`)
    }
    hotel.habitaciones.forEach((hab, habIndex) => {
      const pax = habitaciones[habIndex]
      let linea = `Hab. ${habIndex + 1} (${pax?.composicion}): Adultos $${hab.adl.venta}`
      if (pax?.chd > 0) linea += ` · Niños $${hab.chd.venta}`
      if (pax?.inf > 0) linea += ` · Infantes $${hab.inf.venta}`
      lineas.push(linea)
    })
    lineas.push('')
  })

  if (cotizacion.no_incluye) {
    lineas.push(`❌ No incluye: ${cotizacion.no_incluye}`)
    lineas.push('')
  }

  if (cotizacion.agente) {
    lineas.push(`Consultas: ${cotizacion.agente.nombre} ${cotizacion.agente.apellido} · ${cotizacion.agente.whatsapp}`)
  }

  return lineas.join('\n')
}