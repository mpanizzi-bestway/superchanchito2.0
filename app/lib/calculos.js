export const COMPOSICION = { 1: 'individual', 2: 'doble', 3: 'triple', 4: 'cuádruple', 5: 'quíntuple' }

export function composicion(adl) {
  return COMPOSICION[adl] || `${adl} adultos`
}

export function resumenPax(pax) {
  const partes = [`${pax.adl} ADL`]
  if (pax.chd > 0) partes.push(`${pax.chd} CHD`)
  if (pax.inf > 0) partes.push(`${pax.inf} INF`)
  return partes.join(' + ')
}

export function normalizarNombre(nombre) {
  return nombre
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

export function crearHabitacionHotelVacia() {
  return {
    tipoHabitacion: '',
    adl: { costo: '', neto: '', venta: '', utilidad: '' },
    chd: { costo: '', neto: '', venta: '', utilidad: '' },
    inf: { costo: '', neto: '', venta: '', utilidad: '' },
  }
}

export function crearHotelVacio(cantidadHabitaciones, expandido = true) {
  return {
    modo: 'unico',
    nombre: '',
    regimen: 'Solo Alojamiento',
    noRefPrepago: false,
    operador: '',
    comision: 17,
    comentario: '',
    link: '',
    lat: null,
    lng: null,
    fotoUrl: null,
    fotoConsultada: false,
    direccion: null,
    expandido,
    habitaciones: Array.from({ length: cantidadHabitaciones }, crearHabitacionHotelVacia),
  }
}

export function crearHotelSimpleVacio() {
  return { nombre: '', regimen: 'Solo Alojamiento', noRefPrepago: false, operador: '', comision: 17, comentario: '', link: '', lat: null, lng: null, fotoUrl: null, fotoConsultada: false, direccion: null }
}

export function crearHabitacionDobleVacia() {
  return {
    tipoHabitacion1: '',
    tipoHabitacion2: '',
    adl: { costo1: '', costo2: '', neto: '', venta: '', utilidad: '' },
    chd: { costo1: '', costo2: '', neto: '', venta: '', utilidad: '' },
    inf: { costo1: '', costo2: '', neto: '', venta: '', utilidad: '' },
  }
}

export function crearOpcionHotelDoble(cantidadHabitaciones, expandido = true) {
  return {
    modo: 'doble',
    hotel1: crearHotelSimpleVacio(),
    hotel2: crearHotelSimpleVacio(),
    expandido,
    habitaciones: Array.from({ length: cantidadHabitaciones }, crearHabitacionDobleVacia),
  }
}

export function redondearVentaSugerida(neto) {
  if (!neto) return 0
  return Math.ceil((neto / 0.9) / 5) * 5
}