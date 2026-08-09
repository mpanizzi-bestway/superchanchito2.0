'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const COMPOSICION = { 1: 'individual', 2: 'doble', 3: 'triple', 4: 'cuádruple', 5: 'quíntuple' }

function composicion(adl) {
  return COMPOSICION[adl] || `${adl} adultos`
}

function resumenPax(pax) {
  const partes = [`${pax.adl} ADL`]
  if (pax.chd > 0) partes.push(`${pax.chd} CHD`)
  if (pax.inf > 0) partes.push(`${pax.inf} INF`)
  return partes.join(' + ')
}

function crearHabitacionHotelVacia() {
  return {
    tipoHabitacion: '',
    adl: { costo: '', venta: '', utilidad: '' },
    chd: { costo: '', venta: '', utilidad: '' },
    inf: { costo: '', venta: '', utilidad: '' },
  }
}

function crearHotelVacio(cantidadHabitaciones, expandido = true) {
  return {
    modo: 'unico',
    nombre: '',
    regimen: 'Solo Alojamiento',
    noRefPrepago: false,
    operador: '',
    comision: 17,
    expandido,
    habitaciones: Array.from({ length: cantidadHabitaciones }, crearHabitacionHotelVacia),
  }
}

function crearHotelSimpleVacio() {
  return { nombre: '', regimen: 'Solo Alojamiento', noRefPrepago: false, operador: '', comision: 17 }
}

function crearHabitacionDobleVacia() {
  return {
    tipoHabitacion1: '',
    tipoHabitacion2: '',
    adl: { costo1: '', costo2: '', venta: '', utilidad: '' },
    chd: { costo1: '', costo2: '', venta: '', utilidad: '' },
    inf: { costo1: '', costo2: '', venta: '', utilidad: '' },
  }
}

function crearOpcionHotelDoble(cantidadHabitaciones, expandido = true) {
  return {
    modo: 'doble',
    hotel1: crearHotelSimpleVacio(),
    hotel2: crearHotelSimpleVacio(),
    expandido,
    habitaciones: Array.from({ length: cantidadHabitaciones }, crearHabitacionDobleVacia),
  }
}

function redondearVentaSugerida(neto) {
  if (!neto) return 0
  return Math.ceil((neto / 0.9) / 5) * 5
}

export default function NuevaCotizacion() {
  const router = useRouter()
  const [destinos, setDestinos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // ----- Sección 1: Cliente -----
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [origenConsulta, setOrigenConsulta] = useState('Redes Sociales')
  const [seguimiento, setSeguimiento] = useState(false)

  // ----- Sección 2: Datos del viaje -----
  const [tipoDestino, setTipoDestino] = useState('unico')
  const [fechaInicioViaje, setFechaInicioViaje] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [diasDestino, setDiasDestino] = useState('7')
  const [destino1Id, setDestino1Id] = useState('')
  const [diasDestino1, setDiasDestino1] = useState('4')
  const [destino2Id, setDestino2Id] = useState('')
  const [diasDestino2, setDiasDestino2] = useState('3')

  // ----- Agregar nuevo destino -----
  const [mostrarNuevoDestino, setMostrarNuevoDestino] = useState(false)
  const [nuevoDestinoCiudad, setNuevoDestinoCiudad] = useState('')
  const [nuevoDestinoPais, setNuevoDestinoPais] = useState('')
  const [guardandoDestino, setGuardandoDestino] = useState(false)

  // ----- Sección 3: Habitaciones y Pasajeros -----
  const [cantidadHabitaciones, setCantidadHabitaciones] = useState(1)
  const [habitaciones, setHabitaciones] = useState([{ adl: 2, chd: 0, inf: 0 }])

  // ----- Sección 5: Costos Fijos -----
  const [costosFijos, setCostosFijos] = useState({
    boleto: { checked: true, adl: '', chd: '', inf: '' },
    traslados: { checked: true, adl: 40, chd: 20, inf: 0 },
    traslados_interhoteles: { checked: true, adl: '', chd: '', inf: '' },
    seguro: { checked: true, adl: 40, chd: 20, inf: 20 },
    tour1: { checked: false, nombre: '', adl: '', chd: '', inf: '' },
    tour2: { checked: false, nombre: '', adl: '', chd: '', inf: '' },
  })
  const [noIncluye, setNoIncluye] = useState('')

  // ----- Sección 6: Opciones de Hoteles -----
  const [hotelesOpciones, setHotelesOpciones] = useState([crearHotelVacio(1)])

  useEffect(() => {
    cargarDestinos()
  }, [])

  useEffect(() => {
    setHotelesOpciones(prev => prev.map(hotel => {
      const crearVacia = hotel.modo === 'doble' ? crearHabitacionDobleVacia : crearHabitacionHotelVacia
      const habs = [...hotel.habitaciones]
      while (habs.length < cantidadHabitaciones) habs.push(crearVacia())
      while (habs.length > cantidadHabitaciones) habs.pop()
      return { ...hotel, habitaciones: habs }
    }))
  }, [cantidadHabitaciones])

  useEffect(() => {
    setHotelesOpciones([
      tipoDestino === 'doble'
        ? crearOpcionHotelDoble(cantidadHabitaciones, true)
        : crearHotelVacio(cantidadHabitaciones, true)
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoDestino])

  async function cargarDestinos() {
    const { data } = await supabase.from('destinos').select('id, ciudad, pais').order('ciudad')
    if (data) setDestinos(data)
  }

  async function handleAgregarDestino(e) {
    e.preventDefault()
    setGuardandoDestino(true)
    const { error } = await supabase
      .from('destinos')
      .insert({ ciudad: nuevoDestinoCiudad, pais: nuevoDestinoPais })
    setGuardandoDestino(false)
    if (error) { setError(error.message); return }
    setNuevoDestinoCiudad('')
    setNuevoDestinoPais('')
    setMostrarNuevoDestino(false)
    await cargarDestinos()
  }

  // ---- Habitaciones ----
  function handleCantidadHabitaciones(n) {
    setCantidadHabitaciones(n)
    setHabitaciones(prev => {
      const nuevo = [...prev]
      while (nuevo.length < n) nuevo.push({ adl: 2, chd: 0, inf: 0 })
      while (nuevo.length > n) nuevo.pop()
      return nuevo
    })
  }

  function actualizarHabitacion(index, campo, valor) {
    setHabitaciones(prev => prev.map((h, i) => i === index ? { ...h, [campo]: valor } : h))
  }

  const mostrarColumnaChd = habitaciones.some(h => h.chd > 0)
  const mostrarColumnaInf = habitaciones.some(h => h.inf > 0)

  // ---- Costos fijos ----
  function actualizarCosto(item, campo, valor) {
    setCostosFijos(prev => ({ ...prev, [item]: { ...prev[item], [campo]: valor } }))
  }

  function netoCostosFijosPorTipo(tipo) {
    let total = 0
    Object.entries(costosFijos).forEach(([key, item]) => {
      if (key === 'traslados_interhoteles' && tipoDestino !== 'doble') return
      if (item.checked) total += Number(item[tipo]) || 0
    })
    return total
  }

  // ---- Hoteles: Destino Único ----
  function calcularNeto(habIndex, tipo, costoHotel, comision = 17) {
    const cantidadPax = habitaciones[habIndex]?.[tipo] || 0
    if (!cantidadPax) return 0
    const factorNeto = 1 - (Number(comision) / 100)
    const netoHotel = (Number(costoHotel) * factorNeto) / cantidadPax
    return netoCostosFijosPorTipo(tipo) + netoHotel
  }

  function actualizarHotelCampo(hotelIndex, campo, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => i === hotelIndex ? { ...h, [campo]: valor } : h))
  }

  function agregarOpcionHotel() {
    if (hotelesOpciones.length >= 4) return
    const nueva = tipoDestino === 'doble'
      ? crearOpcionHotelDoble(cantidadHabitaciones, true)
      : crearHotelVacio(cantidadHabitaciones, true)
    setHotelesOpciones(prev => [...prev, nueva])
  }

  function quitarOpcionHotel(hotelIndex) {
    setHotelesOpciones(prev => prev.filter((_, i) => i !== hotelIndex))
  }

  function toggleExpandido(hotelIndex) {
    setHotelesOpciones(prev => prev.map((h, i) => i === hotelIndex ? { ...h, expandido: !h.expandido } : h))
  }

  function actualizarHabitacionHotel(hotelIndex, habIndex, campo, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => j === habIndex ? { ...hb, [campo]: valor } : hb)
      return { ...h, habitaciones: habs }
    }))
  }

  function actualizarCostoPasajero(hotelIndex, habIndex, tipo, valor) {
    const comision = hotelesOpciones[hotelIndex].comision
    const neto = calcularNeto(habIndex, tipo, valor, comision)
    const ventaSugerida = redondearVentaSugerida(neto)
    const utilidad = ventaSugerida - neto

    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => {
        if (j !== habIndex) return hb
        return { ...hb, [tipo]: { costo: valor, venta: ventaSugerida, utilidad } }
      })
      return { ...h, habitaciones: habs }
    }))
  }

  function actualizarVentaManual(hotelIndex, habIndex, tipo, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => {
        if (j !== habIndex) return hb
        const neto = calcularNeto(habIndex, tipo, hb[tipo].costo, h.comision)
        const venta = Number(valor) || 0
        return { ...hb, [tipo]: { ...hb[tipo], venta, utilidad: venta - neto } }
      })
      return { ...h, habitaciones: habs }
    }))
  }

  function actualizarUtilidadManual(hotelIndex, habIndex, tipo, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => {
        if (j !== habIndex) return hb
        const neto = calcularNeto(habIndex, tipo, hb[tipo].costo, h.comision)
        const utilidad = Number(valor) || 0
        return { ...hb, [tipo]: { ...hb[tipo], venta: neto + utilidad, utilidad } }
      })
      return { ...h, habitaciones: habs }
    }))
  }

  function actualizarComision(hotelIndex, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => {
        const nuevoHab = { ...hb }
        ;['adl', 'chd', 'inf'].forEach(tipo => {
          if (hb[tipo].costo !== '') {
            const neto = calcularNeto(j, tipo, hb[tipo].costo, valor)
            const venta = redondearVentaSugerida(neto)
            nuevoHab[tipo] = { costo: hb[tipo].costo, venta, utilidad: venta - neto }
          }
        })
        return nuevoHab
      })
      return { ...h, comision: valor, habitaciones: habs }
    }))
  }

  // ---- Hoteles: Doble Destino ----
  function calcularNetoDoble(habIndex, tipo, costo1, comision1, costo2, comision2) {
    const cantidadPax = habitaciones[habIndex]?.[tipo] || 0
    if (!cantidadPax) return 0
    const factor1 = 1 - (Number(comision1) / 100)
    const factor2 = 1 - (Number(comision2) / 100)
    const netoHotel = ((Number(costo1) * factor1) + (Number(costo2) * factor2)) / cantidadPax
    return netoCostosFijosPorTipo(tipo) + netoHotel
  }

  function actualizarHotelSimpleCampo(hotelIndex, cual, campo, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      return { ...h, [cual]: { ...h[cual], [campo]: valor } }
    }))
  }

  function actualizarHabitacionDobleCampo(hotelIndex, habIndex, campo, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => j === habIndex ? { ...hb, [campo]: valor } : hb)
      return { ...h, habitaciones: habs }
    }))
  }

  function actualizarCostoPasajeroDoble(hotelIndex, habIndex, tipo, cual, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => {
        if (j !== habIndex) return hb
        const actual = { ...hb[tipo], [cual]: valor }
        const neto = calcularNetoDoble(
          habIndex, tipo,
          actual.costo1, h.hotel1.comision,
          actual.costo2, h.hotel2.comision
        )
        const venta = redondearVentaSugerida(neto)
        const utilidad = venta - neto
        return { ...hb, [tipo]: { ...actual, venta, utilidad } }
      })
      return { ...h, habitaciones: habs }
    }))
  }

  function actualizarVentaManualDoble(hotelIndex, habIndex, tipo, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => {
        if (j !== habIndex) return hb
        const neto = calcularNetoDoble(habIndex, tipo, hb[tipo].costo1, h.hotel1.comision, hb[tipo].costo2, h.hotel2.comision)
        const venta = Number(valor) || 0
        return { ...hb, [tipo]: { ...hb[tipo], venta, utilidad: venta - neto } }
      })
      return { ...h, habitaciones: habs }
    }))
  }

  function actualizarUtilidadManualDoble(hotelIndex, habIndex, tipo, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const habs = h.habitaciones.map((hb, j) => {
        if (j !== habIndex) return hb
        const neto = calcularNetoDoble(habIndex, tipo, hb[tipo].costo1, h.hotel1.comision, hb[tipo].costo2, h.hotel2.comision)
        const utilidad = Number(valor) || 0
        return { ...hb, [tipo]: { ...hb[tipo], venta: neto + utilidad, utilidad } }
      })
      return { ...h, habitaciones: habs }
    }))
  }

  function actualizarComisionDoble(hotelIndex, cual, valor) {
    setHotelesOpciones(prev => prev.map((h, i) => {
      if (i !== hotelIndex) return h
      const nuevoHotel1 = cual === 'hotel1' ? { ...h.hotel1, comision: valor } : h.hotel1
      const nuevoHotel2 = cual === 'hotel2' ? { ...h.hotel2, comision: valor } : h.hotel2
      const habs = h.habitaciones.map((hb, j) => {
        const nuevoHab = { ...hb }
        ;['adl', 'chd', 'inf'].forEach(tipo => {
          if (hb[tipo].costo1 !== '' || hb[tipo].costo2 !== '') {
            const neto = calcularNetoDoble(j, tipo, hb[tipo].costo1, nuevoHotel1.comision, hb[tipo].costo2, nuevoHotel2.comision)
            const venta = redondearVentaSugerida(neto)
            nuevoHab[tipo] = { ...hb[tipo], venta, utilidad: venta - neto }
          }
        })
        return nuevoHab
      })
      return { ...h, hotel1: nuevoHotel1, hotel2: nuevoHotel2, habitaciones: habs }
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    setError('')

    let fechaSeguimiento = null
    if (seguimiento) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() + 2)
      fecha.setHours(10, 10, 0, 0)
      fechaSeguimiento = fecha.toISOString()
    }

    const { data: cliente, error: errorCliente } = await supabase
      .from('clientes')
      .insert({
        nombre, apellido, telefono, email,
        origen_consulta: origenConsulta,
        seguimiento,
        fecha_seguimiento: fechaSeguimiento,
      })
      .select()
      .single()

    if (errorCliente) { setCargando(false); setError(errorCliente.message); return }

    const habitacionesGuardar = habitaciones.map(h => ({ ...h, composicion: composicion(h.adl) }))

    const costosFijosGuardar = { ...costosFijos }
    if (tipoDestino === 'unico') delete costosFijosGuardar.traslados_interhoteles

    const datosCotizacion = {
      cliente_id: cliente.id,
      cliente_nombre: `${nombre} ${apellido}`,
      tipo_destino: tipoDestino,
      fecha_inicio_viaje: fechaInicioViaje,
      cantidad_habitaciones: cantidadHabitaciones,
      habitaciones: habitacionesGuardar,
      costos_fijos: costosFijosGuardar,
      hoteles: hotelesOpciones,
      no_incluye: noIncluye,
    }

    if (tipoDestino === 'unico') {
      datosCotizacion.destino_id = destinoId
      datosCotizacion.dias_destino = diasDestino ? Number(diasDestino) : null
    } else {
      datosCotizacion.destino1_id = destino1Id
      datosCotizacion.dias_destino1 = diasDestino1 ? Number(diasDestino1) : null
      datosCotizacion.destino2_id = destino2Id
      datosCotizacion.dias_destino2 = diasDestino2 ? Number(diasDestino2) : null
    }

    const { data: cotizacion, error: errorCotizacion } = await supabase
      .from('cotizaciones')
      .insert(datosCotizacion)
      .select()
      .single()

    setCargando(false)
    if (errorCotizacion) { setError(errorCotizacion.message); return }

    router.push(`/cotizacion/${cotizacion.id}`)
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px' }}>
      <h1>Nueva Cotización</h1>
      <form onSubmit={handleSubmit}>

        <h2>Datos del Cliente</h2>
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

        <hr style={{ margin: '1.5rem 0' }} />

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

        <div>
          <label>Fecha de inicio del viaje</label><br />
          <input type="date" value={fechaInicioViaje} onChange={e => setFechaInicioViaje(e.target.value)} required />
        </div>

        {tipoDestino === 'unico' ? (
          <>
            <div>
              <label>Destino</label><br />
              <select value={destinoId} onChange={e => setDestinoId(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => <option key={d.id} value={d.id}>{d.ciudad}</option>)}
              </select>
            </div>
            <div>
              <label>Días en destino</label><br />
              <input type="number" min="1" value={diasDestino} onChange={e => setDiasDestino(e.target.value)} required />
            </div>
          </>
        ) : (
          <>
            <div>
              <label>1er Destino</label><br />
              <select value={destino1Id} onChange={e => setDestino1Id(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => <option key={d.id} value={d.id}>{d.ciudad}</option>)}
              </select>
            </div>
            <div>
              <label>Días en 1er Destino</label><br />
              <input type="number" min="1" value={diasDestino1} onChange={e => setDiasDestino1(e.target.value)} required />
            </div>
            <div>
              <label>2do Destino</label><br />
              <select value={destino2Id} onChange={e => setDestino2Id(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => <option key={d.id} value={d.id}>{d.ciudad}</option>)}
              </select>
            </div>
            <div>
              <label>Días en 2do Destino</label><br />
              <input type="number" min="1" value={diasDestino2} onChange={e => setDiasDestino2(e.target.value)} required />
            </div>
          </>
        )}

        <div style={{ marginTop: '1rem' }}>
          <button type="button" onClick={() => setMostrarNuevoDestino(!mostrarNuevoDestino)}>
            {mostrarNuevoDestino ? '▲ Agregar destino' : '▼ Agregar destino'}
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

        <hr style={{ margin: '1.5rem 0' }} />

        <h2>Habitaciones y Pasajeros</h2>
        <div>
          <label>Cantidad de habitaciones</label><br />
          <select value={cantidadHabitaciones} onChange={e => handleCantidadHabitaciones(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>

        <table style={{ marginTop: '1rem', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.4rem' }}>Habitación</th>
              <th style={{ textAlign: 'left', padding: '0.4rem' }}>Adultos</th>
              {mostrarColumnaChd && <th style={{ textAlign: 'left', padding: '0.4rem' }}>Niños (2–11)</th>}
              {mostrarColumnaInf && <th style={{ textAlign: 'left', padding: '0.4rem' }}>Infantes (0–1,99)</th>}
              <th style={{ textAlign: 'left', padding: '0.4rem' }}>Composición</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map((h, i) => (
              <tr key={i}>
                <td style={{ padding: '0.4rem' }}>Habitación {i + 1}</td>
                <td style={{ padding: '0.4rem' }}>
                  <input
                    type="number" min="1" max="5" style={{ width: '60px' }}
                    value={h.adl}
                    onChange={e => actualizarHabitacion(i, 'adl', Number(e.target.value) || 1)}
                  />
                </td>
                {mostrarColumnaChd && (
                  <td style={{ padding: '0.4rem' }}>
                    {h.chd > 0 ? (
                      <>
                        <input
                          type="number" min="0" style={{ width: '60px' }}
                          value={h.chd}
                          onChange={e => actualizarHabitacion(i, 'chd', Number(e.target.value) || 0)}
                        />
                        {' '}
                        <button type="button" onClick={() => actualizarHabitacion(i, 'chd', 0)} title="Quitar">✕</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => actualizarHabitacion(i, 'chd', 1)}>+ Niño</button>
                    )}
                  </td>
                )}
                {mostrarColumnaInf && (
                  <td style={{ padding: '0.4rem' }}>
                    {h.inf > 0 ? (
                      <>
                        <input
                          type="number" min="0" style={{ width: '60px' }}
                          value={h.inf}
                          onChange={e => actualizarHabitacion(i, 'inf', Number(e.target.value) || 0)}
                        />
                        {' '}
                        <button type="button" onClick={() => actualizarHabitacion(i, 'inf', 0)} title="Quitar">✕</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => actualizarHabitacion(i, 'inf', 1)}>+ Infante</button>
                    )}
                  </td>
                )}
                <td style={{ padding: '0.4rem', color: '#555' }}>{composicion(h.adl)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!mostrarColumnaChd && (
          <button type="button" style={{ marginTop: '0.5rem', marginRight: '0.5rem' }}
            onClick={() => actualizarHabitacion(0, 'chd', 1)}>
            + Agregar niños a alguna habitación
          </button>
        )}
        {!mostrarColumnaInf && (
          <button type="button" style={{ marginTop: '0.5rem' }}
            onClick={() => actualizarHabitacion(0, 'inf', 1)}>
            + Agregar infantes a alguna habitación
          </button>
        )}

        <hr style={{ margin: '1.5rem 0' }} />

        <h2>Costos Fijos del Viaje (netos, por pasajero)</h2>

        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.4rem' }}></th>
              <th style={{ textAlign: 'left', padding: '0.4rem' }}>Concepto</th>
              <th style={{ textAlign: 'left', padding: '0.4rem' }}>ADL</th>
              <th style={{ textAlign: 'left', padding: '0.4rem' }}>CHD</th>
              <th style={{ textAlign: 'left', padding: '0.4rem' }}>INF</th>
            </tr>
          </thead>
          <tbody>
            <FilaCosto label="✈️ Boleto aéreo" item="boleto" costos={costosFijos} actualizar={actualizarCosto} />
            <FilaCosto label="🚌 Traslados (A/P–HTL–A/P)" item="traslados" costos={costosFijos} actualizar={actualizarCosto} />
            {tipoDestino === 'doble' && (
              <FilaCosto label="🚌 Traslados (Interhoteles)" item="traslados_interhoteles" costos={costosFijos} actualizar={actualizarCosto} />
            )}
            <FilaCosto label="🛡️ Seguro médico y de viaje" item="seguro" costos={costosFijos} actualizar={actualizarCosto} />
            <FilaCostoTour label="Tour 1" item="tour1" placeholder="Ej: Tour panorámico" costos={costosFijos} actualizar={actualizarCosto} />
            <FilaCostoTour label="Tour 2" item="tour2" placeholder="Ej: Excursión especial" costos={costosFijos} actualizar={actualizarCosto} />
          </tbody>
        </table>

        <hr style={{ margin: '1.5rem 0' }} />

        <h2>Opciones de Hoteles</h2>

        {hotelesOpciones.map((hotel, hIndex) => (
          <div key={hIndex} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ cursor: 'pointer' }} onClick={() => toggleExpandido(hIndex)}>
                {hotel.expandido ? '▼' : '▶'} Opción {hIndex + 1}
                {hotel.modo === 'unico' && hotel.nombre && <span style={{ fontWeight: 'normal', color: '#555' }}> — {hotel.nombre}</span>}
              </h3>
              {hIndex > 0 && (
                <button type="button" onClick={() => quitarOpcionHotel(hIndex)} style={{ fontSize: '0.8rem' }}>
                  Quitar opción
                </button>
              )}
            </div>

            {hotel.expandido && (
              <>
                {hotel.modo === 'doble' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <BloqueHotelSimple
                        titulo="Hotel — 1er destino"
                        datos={hotel.hotel1}
                        onCampo={(campo, valor) => actualizarHotelSimpleCampo(hIndex, 'hotel1', campo, valor)}
                        onComision={valor => actualizarComisionDoble(hIndex, 'hotel1', valor)}
                      />
                      <BloqueHotelSimple
                        titulo="Hotel — 2do destino"
                        datos={hotel.hotel2}
                        onCampo={(campo, valor) => actualizarHotelSimpleCampo(hIndex, 'hotel2', campo, valor)}
                        onComision={valor => actualizarComisionDoble(hIndex, 'hotel2', valor)}
                      />
                    </div>

                    {hotel.habitaciones.map((hab, habIndex) => (
                      <div key={habIndex} style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' }}>
                        <h4>
                          Habitación {habIndex + 1}{' '}
                          <span style={{ fontWeight: 'normal', color: '#555', fontSize: '0.9rem' }}>
                            ({resumenPax(habitaciones[habIndex])})
                          </span>
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label>Tipo de habitación (1er destino)</label><br />
                            <input
                              value={hab.tipoHabitacion1}
                              onChange={e => actualizarHabitacionDobleCampo(hIndex, habIndex, 'tipoHabitacion1', e.target.value)}
                              placeholder="Ej: Doble Standard"
                            />
                            <table style={{ marginTop: '0.5rem', borderCollapse: 'collapse', width: '100%' }}>
                              <thead>
                                <tr>
                                  <th></th>
                                  <th style={{ textAlign: 'left', padding: '0.3rem' }}>ADL</th>
                                  {mostrarColumnaChd && <th style={{ textAlign: 'left', padding: '0.3rem' }}>CHD</th>}
                                  {mostrarColumnaInf && <th style={{ textAlign: 'left', padding: '0.3rem' }}>INF</th>}
                                </tr>
                              </thead>
                              <tbody>
                                <FilaHotelCostoDoble
                                  label="Costo comm. hotel"
                                  hab={hab} hIndex={hIndex} habIndex={habIndex} campo="costo1"
                                  habitacionesPax={habitaciones[habIndex]}
                                  mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                                  onCosto={actualizarCostoPasajeroDoble}
                                />
                              </tbody>
                            </table>
                          </div>

                          <div>
                            <label>Tipo de habitación (2do destino)</label><br />
                            <input
                              value={hab.tipoHabitacion2}
                              onChange={e => actualizarHabitacionDobleCampo(hIndex, habIndex, 'tipoHabitacion2', e.target.value)}
                              placeholder="Ej: Doble Standard"
                            />
                            <table style={{ marginTop: '0.5rem', borderCollapse: 'collapse', width: '100%' }}>
                              <thead>
                                <tr>
                                  <th></th>
                                  <th style={{ textAlign: 'left', padding: '0.3rem' }}>ADL</th>
                                  {mostrarColumnaChd && <th style={{ textAlign: 'left', padding: '0.3rem' }}>CHD</th>}
                                  {mostrarColumnaInf && <th style={{ textAlign: 'left', padding: '0.3rem' }}>INF</th>}
                                </tr>
                              </thead>
                              <tbody>
                                <FilaHotelCostoDoble
                                  label="Costo comm. hotel"
                                  hab={hab} hIndex={hIndex} habIndex={habIndex} campo="costo2"
                                  habitacionesPax={habitaciones[habIndex]}
                                  mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                                  onCosto={actualizarCostoPasajeroDoble}
                                />
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <table style={{ marginTop: '0.75rem', borderCollapse: 'collapse', width: '100%' }}>
                          <thead>
                            <tr>
                              <th></th>
                              <th style={{ textAlign: 'left', padding: '0.4rem' }}>ADL</th>
                              {mostrarColumnaChd && <th style={{ textAlign: 'left', padding: '0.4rem' }}>CHD</th>}
                              {mostrarColumnaInf && <th style={{ textAlign: 'left', padding: '0.4rem' }}>INF</th>}
                            </tr>
                          </thead>
                          <tbody>
                            <FilaHotelCalculada
                              label="Neto por pasajero"
                              hab={hab} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                              calcular={(tipo) => calcularNetoDoble(habIndex, tipo, hab[tipo].costo1, hotel.hotel1.comision, hab[tipo].costo2, hotel.hotel2.comision)}
                            />
                            <FilaHotelEditable
                              label="Precio de venta sugerido"
                              hab={hab} hIndex={hIndex} habIndex={habIndex} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                              campo="venta" onEditar={actualizarVentaManualDoble}
                            />
                            <FilaHotelEditable
                              label="Utilidad (USD)"
                              hab={hab} hIndex={hIndex} habIndex={habIndex} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                              campo="utilidad" onEditar={actualizarUtilidadManualDoble}
                            />
                            <FilaHotelPorcentaje
                              hab={hab} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                            />
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div>
                        <label>Nombre del hotel</label><br />
                        <input
                          value={hotel.nombre}
                          onChange={e => actualizarHotelCampo(hIndex, 'nombre', e.target.value)}
                          placeholder="Ej: Hotel Fasano"
                        />
                      </div>
                      <div>
                        <label>Régimen</label><br />
                        <select
                          value={hotel.regimen}
                          onChange={e => actualizarHotelCampo(hIndex, 'regimen', e.target.value)}
                        >
                          <option>Solo Alojamiento</option>
                          <option>Desayuno Incluido</option>
                          <option>Media Pensión</option>
                          <option>Pensión Completa</option>
                          <option>Todo Incluido</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem' }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={hotel.noRefPrepago}
                          onChange={e => actualizarHotelCampo(hIndex, 'noRefPrepago', e.target.checked)}
                        />
                        {' '}NO REF/PREPAGO
                      </label>
                      <div>
                        <label>Operador (opcional)</label><br />
                        <input
                          style={{ width: '180px' }}
                          value={hotel.operador}
                          onChange={e => actualizarHotelCampo(hIndex, 'operador', e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Comm. %</label><br />
                        <input
                          type="number" style={{ width: '70px' }}
                          value={hotel.comision}
                          onChange={e => actualizarComision(hIndex, e.target.value)}
                        />
                      </div>
                    </div>
                    {hotel.noRefPrepago && (
                      <p style={{ fontSize: '0.85rem', color: '#a00', marginTop: '0.5rem' }}>
                        Se agregará: "Promoción 100% pre paga y en gastos totales (sin devolución)"
                      </p>
                    )}

                    {hotel.habitaciones.map((hab, habIndex) => (
                      <div key={habIndex} style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' }}>
                        <h4>
                          Habitación {habIndex + 1}{' '}
                          <span style={{ fontWeight: 'normal', color: '#555', fontSize: '0.9rem' }}>
                            ({resumenPax(habitaciones[habIndex])})
                          </span>
                        </h4>

                        <div>
                          <label>Tipo de habitación</label><br />
                          <input
                            value={hab.tipoHabitacion}
                            onChange={e => actualizarHabitacionHotel(hIndex, habIndex, 'tipoHabitacion', e.target.value)}
                            placeholder="Ej: Doble Standard"
                          />
                        </div>

                        <table style={{ marginTop: '0.75rem', borderCollapse: 'collapse', width: '100%' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '0.4rem' }}></th>
                              <th style={{ textAlign: 'left', padding: '0.4rem' }}>ADL</th>
                              {mostrarColumnaChd && <th style={{ textAlign: 'left', padding: '0.4rem' }}>CHD</th>}
                              {mostrarColumnaInf && <th style={{ textAlign: 'left', padding: '0.4rem' }}>INF</th>}
                            </tr>
                          </thead>
                          <tbody>
                            <FilaHotelCosto
                              label="Costo comm. hotel (estadía total)"
                              hotel={hotel} hIndex={hIndex} habIndex={habIndex} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                              onCosto={actualizarCostoPasajero}
                            />
                            <FilaHotelCalculada
                              label="Neto por pasajero"
                              hab={hab} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                              calcular={(tipo) => calcularNeto(habIndex, tipo, hab[tipo].costo, hotel.comision)}
                            />
                            <FilaHotelEditable
                              label="Precio de venta sugerido"
                              hab={hab} hIndex={hIndex} habIndex={habIndex} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                              campo="venta" onEditar={actualizarVentaManual}
                            />
                            <FilaHotelEditable
                              label="Utilidad (USD)"
                              hab={hab} hIndex={hIndex} habIndex={habIndex} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                              campo="utilidad" onEditar={actualizarUtilidadManual}
                            />
                            <FilaHotelPorcentaje
                              hab={hab} habitacionesPax={habitaciones[habIndex]}
                              mostrarChd={mostrarColumnaChd} mostrarInf={mostrarColumnaInf}
                            />
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        ))}

        {hotelesOpciones.length < 4 && (
          <button type="button" onClick={agregarOpcionHotel} style={{ marginBottom: '1rem' }}>
            + Agregar otra opción de hotel ({hotelesOpciones.length}/4)
          </button>
        )}

        <hr style={{ margin: '1.5rem 0' }} />

        <div style={{ marginTop: '1rem' }}>
          <label>No incluye (texto adicional para la cotización)</label><br />
          <input
            style={{ width: '100%' }}
            value={noIncluye}
            onChange={e => setNoIncluye(e.target.value)}
            placeholder="Ej: Visas, Traslados o paseos opcionales, gastos personales, otros"
          />
          <p style={{ fontSize: '0.8rem', color: '#555' }}>
            Este texto se agrega al pie de la sección «No incluye» en la cotización al cliente.
          </p>
        </div>

        <hr style={{ margin: '1.5rem 0' }} />

        <button type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar cotización'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  )
}

function FilaCosto({ label, item, costos, actualizar }) {
  const c = costos[item]
  return (
    <tr>
      <td style={{ padding: '0.4rem' }}>
        <input type="checkbox" checked={c.checked} onChange={e => actualizar(item, 'checked', e.target.checked)} />
      </td>
      <td style={{ padding: '0.4rem' }}>{label}</td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.adl}
          onChange={e => actualizar(item, 'adl', e.target.value)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.chd}
          onChange={e => actualizar(item, 'chd', e.target.value)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.inf}
          onChange={e => actualizar(item, 'inf', e.target.value)} />
      </td>
    </tr>
  )
}

function FilaCostoTour({ label, item, placeholder, costos, actualizar }) {
  const c = costos[item]
  return (
    <tr>
      <td style={{ padding: '0.4rem' }}>
        <input type="checkbox" checked={c.checked} onChange={e => actualizar(item, 'checked', e.target.checked)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        {label}<br />
        <input
          style={{ width: '160px', fontSize: '0.85rem' }}
          value={c.nombre}
          placeholder={placeholder}
          onChange={e => actualizar(item, 'nombre', e.target.value)}
        />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.adl}
          onChange={e => actualizar(item, 'adl', e.target.value)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.chd}
          onChange={e => actualizar(item, 'chd', e.target.value)} />
      </td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '70px' }} value={c.inf}
          onChange={e => actualizar(item, 'inf', e.target.value)} />
      </td>
    </tr>
  )
}

function FilaHotelCosto({ label, hotel, hIndex, habIndex, habitacionesPax, mostrarChd, mostrarInf, onCosto }) {
  const hab = hotel.habitaciones[habIndex]
  return (
    <tr>
      <td style={{ padding: '0.4rem' }}>{label}</td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '80px' }} value={hab.adl.costo}
          onChange={e => onCosto(hIndex, habIndex, 'adl', e.target.value)} />
      </td>
      {mostrarChd && (
        <td style={{ padding: '0.4rem' }}>
          {habitacionesPax?.chd > 0 ? (
            <input type="number" style={{ width: '80px' }} value={hab.chd.costo}
              onChange={e => onCosto(hIndex, habIndex, 'chd', e.target.value)} />
          ) : '—'}
        </td>
      )}
      {mostrarInf && (
        <td style={{ padding: '0.4rem' }}>
          {habitacionesPax?.inf > 0 ? (
            <input type="number" style={{ width: '80px' }} value={hab.inf.costo}
              onChange={e => onCosto(hIndex, habIndex, 'inf', e.target.value)} />
          ) : '—'}
        </td>
      )}
    </tr>
  )
}

function FilaHotelCalculada({ label, hab, habitacionesPax, mostrarChd, mostrarInf, calcular }) {
  return (
    <tr>
      <td style={{ padding: '0.4rem', color: '#555' }}>{label}</td>
      <td style={{ padding: '0.4rem' }}>${calcular('adl').toFixed(2)}</td>
      {mostrarChd && <td style={{ padding: '0.4rem' }}>{habitacionesPax?.chd > 0 ? `$${calcular('chd').toFixed(2)}` : '—'}</td>}
      {mostrarInf && <td style={{ padding: '0.4rem' }}>{habitacionesPax?.inf > 0 ? `$${calcular('inf').toFixed(2)}` : '—'}</td>}
    </tr>
  )
}

function FilaHotelEditable({ label, hab, hIndex, habIndex, habitacionesPax, mostrarChd, mostrarInf, campo, onEditar }) {
  return (
    <tr>
      <td style={{ padding: '0.4rem', color: '#555' }}>{label}</td>
      <td style={{ padding: '0.4rem' }}>
        <input type="number" style={{ width: '80px' }} value={hab.adl[campo]}
          onChange={e => onEditar(hIndex, habIndex, 'adl', e.target.value)} />
      </td>
      {mostrarChd && (
        <td style={{ padding: '0.4rem' }}>
          {habitacionesPax?.chd > 0 ? (
            <input type="number" style={{ width: '80px' }} value={hab.chd[campo]}
              onChange={e => onEditar(hIndex, habIndex, 'chd', e.target.value)} />
          ) : '—'}
        </td>
      )}
      {mostrarInf && (
        <td style={{ padding: '0.4rem' }}>
          {habitacionesPax?.inf > 0 ? (
            <input type="number" style={{ width: '80px' }} value={hab.inf[campo]}
              onChange={e => onEditar(hIndex, habIndex, 'inf', e.target.value)} />
          ) : '—'}
        </td>
      )}
    </tr>
  )
}

function FilaHotelPorcentaje({ hab, habitacionesPax, mostrarChd, mostrarInf }) {
  function pct(tipo) {
    const v = Number(hab[tipo].venta)
    const u = Number(hab[tipo].utilidad)
    if (!v) return '—'
    return `${((u / v) * 100).toFixed(1)}%`
  }
  return (
    <tr>
      <td style={{ padding: '0.4rem', color: '#555' }}>% Utilidad</td>
      <td style={{ padding: '0.4rem' }}>{pct('adl')}</td>
      {mostrarChd && <td style={{ padding: '0.4rem' }}>{habitacionesPax?.chd > 0 ? pct('chd') : '—'}</td>}
      {mostrarInf && <td style={{ padding: '0.4rem' }}>{habitacionesPax?.inf > 0 ? pct('inf') : '—'}</td>}
    </tr>
  )
}

function BloqueHotelSimple({ titulo, datos, onCampo, onComision }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '0.75rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{titulo}</p>
      <div>
        <label>Nombre del hotel</label><br />
        <input value={datos.nombre} onChange={e => onCampo('nombre', e.target.value)} placeholder="Ej: Hotel Fasano" />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <label>Régimen</label><br />
        <select value={datos.regimen} onChange={e => onCampo('regimen', e.target.value)}>
          <option>Solo Alojamiento</option>
          <option>Desayuno Incluido</option>
          <option>Media Pensión</option>
          <option>Pensión Completa</option>
          <option>Todo Incluido</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
        <label>
          <input type="checkbox" checked={datos.noRefPrepago} onChange={e => onCampo('noRefPrepago', e.target.checked)} />
          {' '}NO REF/PREPAGO
        </label>
        <div>
          <label>Operador</label><br />
          <input style={{ width: '140px' }} value={datos.operador} onChange={e => onCampo('operador', e.target.value)} />
        </div>
        <div>
          <label>Comm. %</label><br />
          <input type="number" style={{ width: '60px' }} value={datos.comision} onChange={e => onComision(e.target.value)} />
        </div>
      </div>
      {datos.noRefPrepago && (
        <p style={{ fontSize: '0.8rem', color: '#a00', marginTop: '0.4rem' }}>
          Promoción 100% pre paga y en gastos totales (sin devolución)
        </p>
      )}
    </div>
  )
}

function FilaHotelCostoDoble({ label, hab, hIndex, habIndex, campo, habitacionesPax, mostrarChd, mostrarInf, onCosto }) {
  return (
    <tr>
      <td style={{ padding: '0.3rem' }}>{label}</td>
      <td style={{ padding: '0.3rem' }}>
        <input type="number" style={{ width: '70px' }} value={hab.adl[campo]}
          onChange={e => onCosto(hIndex, habIndex, 'adl', campo, e.target.value)} />
      </td>
      {mostrarChd && (
        <td style={{ padding: '0.3rem' }}>
          {habitacionesPax?.chd > 0 ? (
            <input type="number" style={{ width: '70px' }} value={hab.chd[campo]}
              onChange={e => onCosto(hIndex, habIndex, 'chd', campo, e.target.value)} />
          ) : '—'}
        </td>
      )}
      {mostrarInf && (
        <td style={{ padding: '0.3rem' }}>
          {habitacionesPax?.inf > 0 ? (
            <input type="number" style={{ width: '70px' }} value={hab.inf[campo]}
              onChange={e => onCosto(hIndex, habIndex, 'inf', campo, e.target.value)} />
          ) : '—'}
        </td>
      )}
    </tr>
  )
}