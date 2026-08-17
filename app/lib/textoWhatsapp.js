import { cityName } from './amadeus-parser'
import { FAMILIAS_TARIFARIAS } from './familiasTarifarias'

const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MESES_ABR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const NUM_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣']

function mesDeFecha(fecha) {
  if (!fecha) return ''
  return MESES_LARGOS[new Date(fecha + 'T00:00:00').getMonth()]
}

function diaMesTexto(fechaDDMM) {
  if (!fechaDDMM) return ''
  const [dia, mesNum] = fechaDDMM.split('/')
  return `${dia}${MESES_ABR[parseInt(mesNum, 10) - 1] || ''}.`
}

function horaAmPm(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const periodo = h < 12 ? 'am' : 'pm'
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}${periodo}`
}

function formatearFechaCorta(fecha) {
  if (!fecha) return ''
  const meses = ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.']
  const partes = String(fecha).split('-')
  if (partes.length === 3) {
    const año = partes[0]
    const mes = parseInt(partes[1], 10)
    const dia = parseInt(partes[2], 10)
    return `${dia} de ${meses[mes - 1]} ${año}`
  }
  return fecha
}

// ---- Encabezado personalizado ----
function formatearEncabezado(cotizacion) {
  const cliente = cotizacion.cliente
  const agente = cotizacion.agente
  const destinoTxt = cotizacion.tipo_destino === 'unico'
    ? cotizacion.destino?.ciudad
    : `${cotizacion.destino1?.ciudad} y ${cotizacion.destino2?.ciudad}`
  const mes = mesDeFecha(cotizacion.fecha_inicio_viaje)
  const origenTexto = cliente?.origen_consulta === 'Redes Sociales' ? 'tu consulta en redes' : 'tu consulta'

  return [
    `Hola ${cliente?.nombre}, ¿cómo estás? 😊`,
    `Te escribe ${agente?.nombre}, de *Bestway Viajes* ✈️`,
    '',
    `Gracias por ${origenTexto}, sobre *${destinoTxt}* en *${mes}*!.`,
    '',
    `Te comparto la cotización solicitada. Esta tarifa es promocional y está sujeta a disponibilidad, por lo que cuanto antes podamos avanzar, mayores serán las posibilidades de asegurar estos precios y los lugares disponibles. 😉`,
  ].join('\n')
}

// ---- Resumen del viaje + clima ----
function formatearResumenViaje(cotizacion) {
  const lineas = [`*Cotización de viaje* ✈️`]

  if (cotizacion.tipo_destino === 'unico') {
    lineas.push(`📍 Destino: *${cotizacion.destino?.ciudad}*, ${cotizacion.destino?.pais}`)
    lineas.push(`📅 Salida: ${formatearFechaCorta(cotizacion.fecha_inicio_viaje)} | Duración: ${cotizacion.dias_destino} Noches`)
  } else {
    lineas.push(`📍 Destinos: *${cotizacion.destino1?.ciudad}*, ${cotizacion.destino1?.pais} (${cotizacion.dias_destino1} Noches) + *${cotizacion.destino2?.ciudad}*, ${cotizacion.destino2?.pais} (${cotizacion.dias_destino2} Noches)`)
    lineas.push(`📅 Salida: ${formatearFechaCorta(cotizacion.fecha_inicio_viaje)}`)
  }

  if (cotizacion.clima_texto) {
    lineas.push('', `🌤️ ${cotizacion.clima_texto}`)
  }

  return lineas.join('\n')
}

// ---- Itinerario aéreo en formato ida/regreso ----
function formatearItinerario(segmentos) {
  if (!segmentos || segmentos.length === 0) return ''

  const origenInicial = segmentos[0].origen
  let ida = []
  let vuelta = []
  let enVuelta = false
  segmentos.forEach((s, i) => {
    if (i > 0 && !enVuelta && s.origen === origenInicial) enVuelta = true
    enVuelta ? vuelta.push(s) : ida.push(s)
  })
  if (!enVuelta) ida = segmentos

  function renderTramo(segs) {
    return segs.map(s =>
      `${diaMesTexto(s.fechaSalida)}  ${cityName(s.origen)} -> ${cityName(s.destino)}   ${horaAmPm(s.horaSalida)}  | ${horaAmPm(s.horaLlegada)}${s.llegadaSiguiente ? ` (${diaMesTexto(s.fechaLlegada)})` : ''}`
    ).join('\n')
  }

  let texto = `*Itinerario aéreo previsto*\n🛫 Ida\n${renderTramo(ida)}`
  if (vuelta.length > 0) {
    texto += `\n🛬 Regreso\n${renderTramo(vuelta)}`
  }
  return texto
}

// ---- Qué incluye el precio ----
function formatearIncluye(cotizacion) {
  const cf = cotizacion.costos_fijos || {}
  const lineas = []
  const destinoTxt = cotizacion.tipo_destino === 'unico'
    ? cotizacion.destino?.ciudad
    : `${cotizacion.destino1?.ciudad} y ${cotizacion.destino2?.ciudad}`

  if (cf.boleto?.checked) lineas.push(`✈️ Boleto aéreo a *${destinoTxt}* según itinerario.`)
  const familia = FAMILIAS_TARIFARIAS[cotizacion.familia_tarifaria]
  if (familia) lineas.push(`${familia.emoji} ${familia.incluye}`)
  if (cf.traslados?.checked) lineas.push(`🚐 Traslados regulares incluidos: aeropuerto - hotel - aeropuerto`)
  if (cotizacion.tipo_destino === 'doble' && cf.traslados_interhoteles?.checked) {
    lineas.push(`🚐 Traslados regulares entre hoteles.`)
  }

  if (cotizacion.tipo_destino === 'unico') {
    lineas.push(`🛏️ Estadía: ${cotizacion.dias_destino} noches de alojamiento en *${cotizacion.destino?.ciudad}* en hotel y régimen a elección 👇`)
  } else {
    lineas.push(`🛏️ Estadía: ${cotizacion.dias_destino1} noches de alojamiento en *${cotizacion.destino1?.ciudad}*.`)
    lineas.push(`🛏️ Estadía: ${cotizacion.dias_destino2} noches de alojamiento en *${cotizacion.destino2?.ciudad}*.`)
  }

  if (cf.seguro?.checked) lineas.push(`💊 Seguro médico para tu viaje.`)
  if (cf.tour1?.checked && cf.tour1?.nombre) lineas.push(`📸 ${cf.tour1.nombre}`)
  if (cf.tour2?.checked && cf.tour2?.nombre) lineas.push(`📸 ${cf.tour2.nombre}`)

  return `*El precio incluye:*\n${lineas.join('\n')}`
}

function formatearNoIncluye(cotizacion) {
  const noIncluyeAuto = FAMILIAS_TARIFARIAS[cotizacion.familia_tarifaria]?.noIncluye
  const partes = [noIncluyeAuto, cotizacion.no_incluye].filter(Boolean)
  if (partes.length === 0) return ''
  return `❌ *No incluye:* ${partes.join(' · ')}`
}

// ---- Habitaciones (composición) ----
function formatearHabitaciones(habitaciones) {
  if (!habitaciones || habitaciones.length === 0) return ''
  return habitaciones.map((h, i) => `Hab. ${i + 1} Base ${h.composicion}. Precios por persona.`).join('\n')
}

// ---- Una sola opción de hotel (texto) ----
function formatearOpcionUnica(cotizacion, hotel, hi) {
  const habitaciones = cotizacion.habitaciones || []
  const numero = NUM_EMOJIS[hi] || `${hi + 1}.`
  let bloque = `*Opción* ${numero}\n`

  if (hotel.modo === 'doble') {
    const estrellas1 = hotel.hotel1.estrellas ? ` ${'★'.repeat(hotel.hotel1.estrellas)}` : ''
    const estrellas2 = hotel.hotel2.estrellas ? ` ${'★'.repeat(hotel.hotel2.estrellas)}` : ''
    bloque += `🏨 *${hotel.hotel1.nombre}*${estrellas1} (🍽️ ${hotel.hotel1.regimen}) - ${cotizacion.dias_destino1} noches\n`
    bloque += `🏨 *${hotel.hotel2.nombre}*${estrellas2} (🍽️ ${hotel.hotel2.regimen}) - ${cotizacion.dias_destino2} noches\n`
  } else {
    const estrellas = hotel.estrellas ? ` ${'★'.repeat(hotel.estrellas)}` : ''
    bloque += `🏨 *${hotel.nombre}*${estrellas} (🍽️ ${hotel.regimen})\n`
  }

  hotel.habitaciones.forEach((hab, habIndex) => {
    const pax = habitaciones[habIndex]
    const tipoHab = hotel.modo === 'doble'
      ? [hab.tipoHabitacion1, hab.tipoHabitacion2].filter(Boolean).join(' / ')
      : hab.tipoHabitacion
    if (tipoHab) bloque += ` • ${tipoHab}\n`

    let linea = ` 👉 desde *U$S ${hab.adl.venta}* por adulto.`
    if (pax?.chd > 0) linea += ` | *U$S ${hab.chd.venta}* por niño.`
    if (pax?.inf > 0) linea += ` | *U$S ${hab.inf.venta}* por infante.`
    linea += ` (Hab.${habIndex + 1})`
    bloque += linea + '\n'
  })

  const comentario = hotel.modo === 'doble'
    ? [hotel.hotel1.comentario, hotel.hotel2.comentario].filter(Boolean).join(' ')
    : hotel.comentario
  if (comentario) bloque += `> ${comentario}\n`
  // ⚠️ Fase D: acá va la frase comparativa entre hoteles generada por IA

  const noRef = hotel.modo === 'doble'
    ? (hotel.hotel1.noRefPrepago || hotel.hotel2.noRefPrepago)
    : hotel.noRefPrepago
  if (noRef) bloque += `⚠️ Promoción 100% pre paga y en gastos totales (sin devolución)\n`

  return bloque.trim()
}

function formatearOpciones(cotizacion) {
  const hoteles = cotizacion.hoteles || []
  return hoteles.map((hotel, hi) => formatearOpcionUnica(cotizacion, hotel, hi)).join('\n\n')
}

// Devuelve cada opción con su(s) foto(s), para la vista previa con imagen
export function obtenerOpcionesConFoto(cotizacion) {
  const hoteles = cotizacion.hoteles || []
  return hoteles.map((hotel, hi) => {
    const fotos = []
    if (hotel.modo === 'doble') {
      if (hotel.hotel1.fotoUrl) fotos.push({ url: hotel.hotel1.fotoUrl, label: hotel.hotel1.nombre })
      if (hotel.hotel2.fotoUrl) fotos.push({ url: hotel.hotel2.fotoUrl, label: hotel.hotel2.nombre })
    } else if (hotel.fotoUrl) {
      fotos.push({ url: hotel.fotoUrl, label: hotel.nombre })
    }
    return { fotos, texto: formatearOpcionUnica(cotizacion, hotel, hi) }
  })
}

// ---- Links de los hoteles cotizados ----
function formatearLinks(cotizacion) {
  const hoteles = cotizacion.hoteles || []
  const lineas = []

  hoteles.forEach((hotel, hi) => {
    const numero = NUM_EMOJIS[hi] || `${hi + 1}.`
    if (hotel.modo === 'doble') {
      const links = [hotel.hotel1.link, hotel.hotel2.link].filter(Boolean)
      if (links.length > 0) lineas.push(`${numero} ${links.join(' | ')}`)
    } else if (hotel.link) {
      lineas.push(`${numero} ${hotel.link}`)
    }
  })

  if (lineas.length === 0) return ''
  return `🔗 Te comparto los links de los hoteles para que puedan ver mejor las instalaciones y el entorno de cada uno.\n${lineas.join('\n')}`
}

// ---- Cierre / llamado a la acción ----
function formatearCierre(agente) {
  return [
    `📌 *Importante*: estas tarifas son promocionales, lo que significa precios más bajos pero con cupos muy limitados y sujetos a disponibilidad al momento de la reserva, no se mantienen por mucho tiempo.`,
    '',
    `📲 *¿AVANZAMOS?* Si te gusta la propuesta, podemos verificar la disponibilidad de vuelos y del hotel que prefieran y, si todo está disponible, avanzar con las reservas`,
    '',
    `Y si esta propuesta no es exactamente lo que están buscando, *no hay problema*.`,
    '',
    `Podemos ajustar el presupuesto, cambiar las fechas, buscar otro destino o incluso evaluar otro estilo de viaje. Trabajamos con múltiples operadores y diferentes formatos de viaje, así que la idea es encontrar la opción que mejor se adapte a lo que ustedes tienen pensado.`,
    '',
    `Si querés, contame qué tienen en mente y lo vemos. ✈️🌍`,
    '',
    ` *${agente?.nombre}*`,
    ` 📲 WhatsApp ${agente?.whatsapp} | ✉️ ${agente?.email}`,
  ].join('\n')
}

// ---- Texto completo, para copiar / mandar por WhatsApp ----
export function generarTextoWhatsapp(cotizacion) {
  const secciones = []
  secciones.push(formatearEncabezado(cotizacion))
  secciones.push(formatearResumenViaje(cotizacion))
  if (cotizacion.itinerario && cotizacion.itinerario.length > 0) {
    secciones.push(formatearItinerario(cotizacion.itinerario))
  }
  secciones.push(formatearIncluye(cotizacion))
  const noIncluye = formatearNoIncluye(cotizacion)
  if (noIncluye) secciones.push(noIncluye)
  if (cotizacion.habitaciones?.length > 0) {
    secciones.push(formatearHabitaciones(cotizacion.habitaciones))
  }
  secciones.push(formatearOpciones(cotizacion))
  const links = formatearLinks(cotizacion)
  if (links) secciones.push(links)
  secciones.push(formatearCierre(cotizacion.agente))
  return secciones.filter(Boolean).join('\n\n')
}

// ---- Secciones separadas, para la vista previa con colores + fotos ----
export function generarSeccionesWhatsapp(cotizacion) {
  const antesOpciones = []
  antesOpciones.push(formatearResumenViaje(cotizacion))
  if (cotizacion.itinerario && cotizacion.itinerario.length > 0) {
    antesOpciones.push(formatearItinerario(cotizacion.itinerario))
  }
  antesOpciones.push(formatearIncluye(cotizacion))
  const noIncluye = formatearNoIncluye(cotizacion)
  if (noIncluye) antesOpciones.push(noIncluye)
  if (cotizacion.habitaciones?.length > 0) {
    antesOpciones.push(formatearHabitaciones(cotizacion.habitaciones))
  }

  return {
    encabezado: formatearEncabezado(cotizacion),
    antesOpciones: antesOpciones.filter(Boolean).join('\n\n'),
    opciones: obtenerOpcionesConFoto(cotizacion),
    despuesOpciones: formatearLinks(cotizacion),
    cierre: formatearCierre(cotizacion.agente),
  }
}