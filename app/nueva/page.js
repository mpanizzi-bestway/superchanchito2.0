'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { SeccionInfoIA } from '../components/SeccionInfoIA'
import { PanelHistorialHoteles } from '../components/PanelHistorialHoteles'
import { FotoYMapaHotel } from '../components/FotoYMapaHotel'
import { FotoHotelManual } from '../components/FotoHotelManual'
import { getCookie, setCookie } from '../lib/cookies'

import {
  composicion, resumenPax,
  crearHabitacionHotelVacia, crearHotelVacio,
  crearHotelSimpleVacio, crearHabitacionDobleVacia, crearOpcionHotelDoble,
  redondearVentaSugerida, normalizarNombre,
} from '../lib/calculos'

import { SeccionCliente } from '../components/SeccionCliente'
import { SeccionViaje } from '../components/SeccionViaje'
import { SeccionHabitaciones } from '../components/SeccionHabitaciones'
import { SeccionItinerario } from '../components/SeccionItinerario'
import { SeccionCostosFijos } from '../components/SeccionCostosFijos'
import { SeccionHoteles } from '../components/SeccionHoteles'
import { SeccionComparativaHoteles } from '../components/SeccionComparativaHoteles'
import { parsearAmadeus } from '../lib/amadeus-parser'

function NuevaCotizacionInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [destinos, setDestinos] = useState([])
  const [agentes, setAgentes] = useState([])
  const [agenteId, setAgenteId] = useState('')
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

  // ----- Sección 4: Itinerario Aéreo -----
  const [itinerarioTexto, setItinerarioTexto] = useState('')
  const [itinerarioImagenUrl, setItinerarioImagenUrl] = useState(null)
  const [familiaTarifaria, setFamiliaTarifaria] = useState('')
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  // ----- Información IA (Módulo 9) -----
  const [climaTexto, setClimaTexto] = useState(null)
  const [paseosIA, setPaseosIA] = useState([])
  const [generandoIA, setGenerandoIA] = useState(false)
  const [generandoComentario, setGenerandoComentario] = useState({})
  const [generandoLugar, setGenerandoLugar] = useState({})
  const [comparativaHoteles, setComparativaHoteles] = useState([])
  const [generandoComparativa, setGenerandoComparativa] = useState(false)
  const debounceIA = useRef(null)
  const debounceHotel = useRef({})

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
    cargarAgentes()
  }, [])

  useEffect(() => {
    const dupNombre = searchParams.get('dup_nombre')
    if (dupNombre) {
      setNombre(dupNombre)
      setApellido(searchParams.get('dup_apellido') || '')
      setTelefono(searchParams.get('dup_telefono') || '')
      setEmail(searchParams.get('dup_email') || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (agenteId) setCookie('agente_id', agenteId)
  }, [agenteId])

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
    function handleBeforeUnload(e) {
      if (nombre.trim() || apellido.trim()) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [nombre, apellido])  
  
  useEffect(() => {
    if (debounceIA.current) clearTimeout(debounceIA.current)
    const destinosIA = destinosParaIA()
    if (destinosIA.length === 0 || !fechaInicioViaje) return
    if (tipoDestino === 'doble' && destinosIA.length < 2) return

    debounceIA.current = setTimeout(() => {
      generarInfoIA()
    }, 5000)

    return () => clearTimeout(debounceIA.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinoId, destino1Id, destino2Id, fechaInicioViaje, tipoDestino])

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

  async function cargarAgentes() {
    const { data } = await supabase.from('agentes').select('id, nombre, apellido').order('nombre')
    if (data) {
      setAgentes(data)
      const cookieAgente = getCookie('agente_id')
      if (cookieAgente && data.some(a => a.id === cookieAgente)) {
        setAgenteId(cookieAgente)
      } else {
        const martin = data.find(a => a.nombre === 'Martín')
        if (martin) setAgenteId(martin.id)
      }
    }
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

  async function subirImagenItinerario(file) {
    setSubiendoImagen(true)
    try {
      const extension = file.type.split('/')[1] || 'png'
      const nombreArchivo = `itinerario-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
      const { error } = await supabase.storage.from('itinerarios').upload(nombreArchivo, file)
      if (error) {
        console.error('Error subiendo imagen:', error)
        setSubiendoImagen(false)
        return
      }
      const { data } = supabase.storage.from('itinerarios').getPublicUrl(nombreArchivo)
      setItinerarioImagenUrl(data.publicUrl)
    } catch (e) {
      console.error('Excepción subiendo imagen:', e)
    }
    setSubiendoImagen(false)
  }

  function quitarImagenItinerario() {
    setItinerarioImagenUrl(null)
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

  function promedioCostosAdl(habitacionesHotel, campo) {
    const valores = habitacionesHotel.map(h => Number(h.adl[campo])).filter(n => n > 0)
    if (valores.length === 0) return null
    return valores.reduce((a, b) => a + b, 0) / valores.length
  }

  // ---- IA: resolver ciudad/país de los destinos seleccionados ----
  function destinosParaIA() {
    if (tipoDestino === 'unico') {
      const d = destinos.find(x => x.id === destinoId)
      return d ? [{ ciudad: d.ciudad, pais: d.pais }] : []
    }
    const d1 = destinos.find(x => x.id === destino1Id)
    const d2 = destinos.find(x => x.id === destino2Id)
    return [d1, d2].filter(Boolean).map(d => ({ ciudad: d.ciudad, pais: d.pais }))
  }

  async function generarInfoIA() {
    const destinosIA = destinosParaIA()
    if (destinosIA.length === 0 || !fechaInicioViaje) return
    if (tipoDestino === 'doble' && destinosIA.length < 2) return

    setGenerandoIA(true)

    const MESES_IA = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const mesIndex = new Date(fechaInicioViaje + 'T00:00:00').getMonth()
    const mes = MESES_IA[mesIndex]

    try {
      const [resClima, ...resPaseosArr] = await Promise.all([
        fetch('/api/clima', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinos: destinosIA, mes }),
        }).then(r => r.json()).catch(() => ({ texto: null })),
        ...destinosIA.map(d =>
          fetch('/api/paseos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ciudad: d.ciudad, pais: d.pais, cantidad: destinosIA.length > 1 ? 2 : 4 }),
          }).then(r => r.json()).catch(() => ({ paseos: [] }))
        ),
      ])
      setClimaTexto(resClima?.texto || null)
      setPaseosIA(destinosIA.map((d, i) => ({ ciudad: d.ciudad, items: resPaseosArr[i]?.paseos || [] })))
    } catch {
      // se ignora: no bloqueamos el formulario por un fallo de IA
    }

    setGenerandoIA(false)
  }

  // ---- IA: comentario de hotel ----
  async function generarComentarioHotel(hotelIndex, nombreHotel) {
    const hotel = hotelesOpciones[hotelIndex]
    const nombre = nombreHotel ?? hotel.nombre
    if (!nombre?.trim()) return
    const d = destinosParaIA()[0]
    if (!d) return

    const key = `${hotelIndex}-unico`
    setGenerandoComentario(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/hotel-comentario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, ciudad: d.ciudad, pais: d.pais }),
      }).then(r => r.json()).catch(() => ({ comentario: null }))
      actualizarHotelCampo(hotelIndex, 'comentario', res.comentario || '')
    } catch {
      // no bloquea
    }
    setGenerandoComentario(prev => ({ ...prev, [key]: false }))
  }

  async function generarComentarioHotelDoble(hotelIndex, cual, nombreHotel) {
    const hotel = hotelesOpciones[hotelIndex]
    const datosHotel = hotel[cual]
    const nombre = nombreHotel ?? datosHotel.nombre
    if (!nombre?.trim()) return
    const destinosIA = destinosParaIA()
    const d = cual === 'hotel1' ? destinosIA[0] : destinosIA[1]
    if (!d) return

    const key = `${hotelIndex}-${cual}`
    setGenerandoComentario(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/hotel-comentario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, ciudad: d.ciudad, pais: d.pais }),
      }).then(r => r.json()).catch(() => ({ comentario: null }))
      actualizarHotelSimpleCampo(hotelIndex, cual, 'comentario', res.comentario || '')
    } catch {
      // no bloquea
    }
    setGenerandoComentario(prev => ({ ...prev, [key]: false }))
  }

  async function generarComparativaHoteles() {
    const d = destinosParaIA()[0]
    if (!d || hotelesOpciones.length < 2) return

    const resumen = hotelesOpciones.map(hotel => {
      if (hotel.modo === 'doble') {
        return {
          nombre: `${hotel.hotel1.nombre || 'Hotel'} + ${hotel.hotel2.nombre || 'Hotel'}`,
          regimen: `${hotel.hotel1.regimen} / ${hotel.hotel2.regimen}`,
          precio: hotel.habitaciones[0]?.adl?.venta || 0,
        }
      }
      return { nombre: hotel.nombre || 'Hotel', regimen: hotel.regimen, precio: hotel.habitaciones[0]?.adl?.venta || 0 }
    })

    setGenerandoComparativa(true)
    try {
      const res = await fetch('/api/hoteles-comparativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciudad: d.ciudad, pais: d.pais, hoteles: resumen }),
      }).then(r => r.json()).catch(() => ({ frases: [] }))
      setComparativaHoteles(res.frases && res.frases.length === hotelesOpciones.length ? res.frases : [])
    } catch {
      // no bloquea
    }
    setGenerandoComparativa(false)
  }

  async function generarLugarHotel(hotelIndex, nombreHotel) {
    if (!nombreHotel?.trim()) return
    const d = destinosParaIA()[0]
    if (!d) return
    const key = `${hotelIndex}-unico-lugar`
    setGenerandoLugar(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/hotel-lugar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreHotel, ciudad: d.ciudad, pais: d.pais }),
      }).then(r => r.json()).catch(() => ({ encontrado: false }))
      if (res.encontrado) {
        setHotelesOpciones(prev => prev.map((h, i) => i !== hotelIndex ? h : {
          ...h, lat: res.lat, lng: res.lng, direccion: res.direccion,
        }))
      }
    } catch {
      // no bloquea
    }
    setGenerandoLugar(prev => ({ ...prev, [key]: false }))
  }

  async function generarLugarHotelDoble(hotelIndex, cual, nombreHotel) {
    if (!nombreHotel?.trim()) return
    const destinosIA = destinosParaIA()
    const d = cual === 'hotel1' ? destinosIA[0] : destinosIA[1]
    if (!d) return
    const key = `${hotelIndex}-${cual}-lugar`
    setGenerandoLugar(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/hotel-lugar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreHotel, ciudad: d.ciudad, pais: d.pais }),
      }).then(r => r.json()).catch(() => ({ encontrado: false }))
      if (res.encontrado) {
        setHotelesOpciones(prev => prev.map((h, i) => i !== hotelIndex ? h : {
          ...h, [cual]: { ...h[cual], lat: res.lat, lng: res.lng, direccion: res.direccion },
        }))
      }
    } catch {
      // no bloquea
    }
    setGenerandoLugar(prev => ({ ...prev, [key]: false }))
  }

  // ---- Fotos de hotel: lee las tres columnas (url_foto, estrellas, link) ----
  async function buscarFotoHotel(hotelIndex, nombreHotel) {
    if (!nombreHotel?.trim()) return
    const d = destinosParaIA()[0]
    if (!d) return
    let resultado = null
    try {
      const { data, error } = await supabase.rpc('buscar_hotel_foto', {
        p_nombre: normalizarNombre(nombreHotel),
        p_ciudad: d.ciudad,
      })
      if (error) console.error('Error buscando foto:', error)
      resultado = data?.[0] || null
    } catch (e) {
      console.error('Excepción buscando foto:', e)
    }
    setHotelesOpciones(prev => prev.map((h, i) => i !== hotelIndex ? h : {
      ...h,
      fotoUrl: resultado?.url_foto || null,
      estrellas: resultado?.estrellas || null,
      link: resultado?.link || h.link,
      fotoConsultada: true,
    }))
  }

  async function buscarFotoHotelDoble(hotelIndex, cual, nombreHotel) {
    if (!nombreHotel?.trim()) return
    const destinosIA = destinosParaIA()
    const d = cual === 'hotel1' ? destinosIA[0] : destinosIA[1]
    if (!d) return
    let resultado = null
    try {
      const { data, error } = await supabase.rpc('buscar_hotel_foto', {
        p_nombre: normalizarNombre(nombreHotel),
        p_ciudad: d.ciudad,
      })
      if (error) console.error('Error buscando foto:', error)
      resultado = data?.[0] || null
    } catch (e) {
      console.error('Excepción buscando foto:', e)
    }
    setHotelesOpciones(prev => prev.map((h, i) => i !== hotelIndex ? h : {
      ...h,
      [cual]: {
        ...h[cual],
        fotoUrl: resultado?.url_foto || null,
        estrellas: resultado?.estrellas || null,
        link: resultado?.link || h[cual].link,
      },
    }))
  }

  // ---- Fotos de hotel manual: guarda url_foto + estrellas + link juntos ----
  async function guardarFotoHotelManual(hotelIndex, { url, estrellas, link }) {
    const hotel = hotelesOpciones[hotelIndex]
    const d = destinosParaIA()[0]
    if (!hotel.nombre?.trim() || !d) return
    try {
      await supabase.from('hoteles_fotos').upsert({
        nombre_hotel: hotel.nombre.trim(),
        nombre_normalizado: normalizarNombre(hotel.nombre),
        ciudad: d.ciudad,
        pais: d.pais,
        url_foto: url || null,
        estrellas: estrellas || null,
        link: link || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'nombre_normalizado,ciudad' })
      setHotelesOpciones(prev => prev.map((h, i) => i !== hotelIndex ? h : {
        ...h, fotoUrl: url || null, estrellas: estrellas || null, link: link || '', fotoConsultada: true,
      }))
    } catch {
      // no bloquea
    }
  }

  async function guardarFotoHotelManualDoble(hotelIndex, cual, { url, estrellas, link }) {
    const hotel = hotelesOpciones[hotelIndex]
    const datosHotel = hotel[cual]
    const destinosIA = destinosParaIA()
    const d = cual === 'hotel1' ? destinosIA[0] : destinosIA[1]
    if (!datosHotel.nombre?.trim() || !d) return
    try {
      await supabase.from('hoteles_fotos').upsert({
        nombre_hotel: datosHotel.nombre.trim(),
        nombre_normalizado: normalizarNombre(datosHotel.nombre),
        ciudad: d.ciudad,
        pais: d.pais,
        url_foto: url || null,
        estrellas: estrellas || null,
        link: link || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'nombre_normalizado,ciudad' })
      setHotelesOpciones(prev => prev.map((h, i) => i !== hotelIndex ? h : {
        ...h, [cual]: { ...h[cual], fotoUrl: url || null, estrellas: estrellas || null, link: link || '', fotoConsultada: true },
      }))
    } catch {
      // no bloquea
    }
  }

  function programarBusquedaHotel(hotelIndex, nombreHotel) {
    const key = `${hotelIndex}-unico`
    if (debounceHotel.current[key]) clearTimeout(debounceHotel.current[key])
    debounceHotel.current[key] = setTimeout(() => {
      generarLugarHotel(hotelIndex, nombreHotel)
      buscarFotoHotel(hotelIndex, nombreHotel)
      generarComentarioHotel(hotelIndex, nombreHotel)
    }, 3000)
  }

  function programarBusquedaHotelDoble(hotelIndex, cual, nombreHotel) {
    const key = `${hotelIndex}-${cual}`
    if (debounceHotel.current[key]) clearTimeout(debounceHotel.current[key])
    debounceHotel.current[key] = setTimeout(() => {
      generarLugarHotelDoble(hotelIndex, cual, nombreHotel)
      buscarFotoHotelDoble(hotelIndex, cual, nombreHotel)
      generarComentarioHotelDoble(hotelIndex, cual, nombreHotel)
    }, 3000)
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

    const segmentosItinerario = parsearAmadeus(itinerarioTexto)

    const datosCotizacion = {
      cliente_id: cliente.id,
      agente_id: agenteId,
      cliente_nombre: `${nombre} ${apellido}`,
      tipo_destino: tipoDestino,
      fecha_inicio_viaje: fechaInicioViaje,
      cantidad_habitaciones: cantidadHabitaciones,
      habitaciones: habitacionesGuardar,
      costos_fijos: costosFijosGuardar,
      hoteles: hotelesOpciones,
      no_incluye: noIncluye,
      itinerario: segmentosItinerario.length > 0 ? segmentosItinerario : null,
      itinerario_imagen_url: itinerarioImagenUrl,
      familia_tarifaria: familiaTarifaria,
      clima_texto: climaTexto,
      paseos: paseosIA,
      comparativa_hoteles: comparativaHoteles,
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

    if (errorCotizacion) { setCargando(false); setError(errorCotizacion.message); return }

    // ---- Guardar historial de hoteles para futuras referencias ----
    try {
      const registros = []
      hotelesOpciones.forEach(hotel => {
        if (hotel.modo === 'doble') {
          const dias1 = Number(diasDestino1)
          const dias2 = Number(diasDestino2)
          const costoTotal1 = promedioCostosAdl(hotel.habitaciones, 'costo1')
          const costoTotal2 = promedioCostosAdl(hotel.habitaciones, 'costo2')
          if (hotel.hotel1.nombre?.trim() && costoTotal1 && dias1 > 0) {
            registros.push({ destino_id: destino1Id, nombre_hotel: hotel.hotel1.nombre.trim(), costo_por_noche: costoTotal1 / dias1, dias: dias1 })
          }
          if (hotel.hotel2.nombre?.trim() && costoTotal2 && dias2 > 0) {
            registros.push({ destino_id: destino2Id, nombre_hotel: hotel.hotel2.nombre.trim(), costo_por_noche: costoTotal2 / dias2, dias: dias2 })
          }
        } else {
          const dias = Number(diasDestino)
          const costoTotal = promedioCostosAdl(hotel.habitaciones, 'costo')
          if (hotel.nombre?.trim() && costoTotal && dias > 0) {
            registros.push({ destino_id: destinoId, nombre_hotel: hotel.nombre.trim(), costo_por_noche: costoTotal / dias, dias })
          }
        }
      })
      if (registros.length > 0) {
        await supabase.from('hoteles_historial').insert(registros)
      }
    } catch {
      // no bloquea el guardado de la cotización si esto falla
    }

    setCargando(false)
    router.push(`/cotizacion/${cotizacion.id}`)
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px' }}>
      <h1>Nueva Cotización</h1>
      <form onSubmit={handleSubmit}>

        <SeccionCliente
          nombre={nombre} setNombre={setNombre}
          apellido={apellido} setApellido={setApellido}
          telefono={telefono} setTelefono={setTelefono}
          email={email} setEmail={setEmail}
          origenConsulta={origenConsulta} setOrigenConsulta={setOrigenConsulta}
          seguimiento={seguimiento} setSeguimiento={setSeguimiento}
          agentes={agentes} agenteId={agenteId} setAgenteId={setAgenteId}
        />

        <hr style={{ margin: '1.5rem 0' }} />

        <SeccionViaje
          tipoDestino={tipoDestino} setTipoDestino={setTipoDestino}
          fechaInicioViaje={fechaInicioViaje} setFechaInicioViaje={setFechaInicioViaje}
          destinoId={destinoId} setDestinoId={setDestinoId}
          diasDestino={diasDestino} setDiasDestino={setDiasDestino}
          destino1Id={destino1Id} setDestino1Id={setDestino1Id}
          diasDestino1={diasDestino1} setDiasDestino1={setDiasDestino1}
          destino2Id={destino2Id} setDestino2Id={setDestino2Id}
          diasDestino2={diasDestino2} setDiasDestino2={setDiasDestino2}
          destinos={destinos}
          mostrarNuevoDestino={mostrarNuevoDestino} setMostrarNuevoDestino={setMostrarNuevoDestino}
          nuevoDestinoCiudad={nuevoDestinoCiudad} setNuevoDestinoCiudad={setNuevoDestinoCiudad}
          nuevoDestinoPais={nuevoDestinoPais} setNuevoDestinoPais={setNuevoDestinoPais}
          guardandoDestino={guardandoDestino}
          handleAgregarDestino={handleAgregarDestino}
          onActualizarIA={generarInfoIA} generandoIA={generandoIA}
        />

        <hr style={{ margin: '1.5rem 0' }} />

        <SeccionHabitaciones
          cantidadHabitaciones={cantidadHabitaciones} handleCantidadHabitaciones={handleCantidadHabitaciones}
          habitaciones={habitaciones} actualizarHabitacion={actualizarHabitacion}
          mostrarColumnaChd={mostrarColumnaChd} mostrarColumnaInf={mostrarColumnaInf}
        />

        <hr style={{ margin: '1.5rem 0' }} />

        <SeccionItinerario
          itinerarioTexto={itinerarioTexto} setItinerarioTexto={setItinerarioTexto}
          itinerarioImagenUrl={itinerarioImagenUrl} subiendoImagen={subiendoImagen}
          onImagenSeleccionada={subirImagenItinerario} onQuitarImagen={quitarImagenItinerario}
          familiaTarifaria={familiaTarifaria} setFamiliaTarifaria={setFamiliaTarifaria}
        />

        <hr style={{ margin: '1.5rem 0' }} />

        <SeccionCostosFijos
          costosFijos={costosFijos} actualizarCosto={actualizarCosto} tipoDestino={tipoDestino}
        />

        <hr style={{ margin: '1.5rem 0' }} />

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <SeccionHoteles
              hotelesOpciones={hotelesOpciones}
              habitaciones={habitaciones}
              mostrarColumnaChd={mostrarColumnaChd} mostrarColumnaInf={mostrarColumnaInf}
              toggleExpandido={toggleExpandido} quitarOpcionHotel={quitarOpcionHotel} agregarOpcionHotel={agregarOpcionHotel}
              actualizarHotelCampo={actualizarHotelCampo} actualizarComision={actualizarComision}
              actualizarHabitacionHotel={actualizarHabitacionHotel}
              actualizarCostoPasajero={actualizarCostoPasajero} calcularNeto={calcularNeto}
              actualizarVentaManual={actualizarVentaManual} actualizarUtilidadManual={actualizarUtilidadManual}
              actualizarHotelSimpleCampo={actualizarHotelSimpleCampo} actualizarComisionDoble={actualizarComisionDoble}
              actualizarHabitacionDobleCampo={actualizarHabitacionDobleCampo}
              actualizarCostoPasajeroDoble={actualizarCostoPasajeroDoble} calcularNetoDoble={calcularNetoDoble}
              actualizarVentaManualDoble={actualizarVentaManualDoble} actualizarUtilidadManualDoble={actualizarUtilidadManualDoble}
              generarComentarioHotel={generarComentarioHotel}
              generarComentarioHotelDoble={generarComentarioHotelDoble}
              generandoComentario={generandoComentario}
              generarLugarHotel={generarLugarHotel}
              generarLugarHotelDoble={generarLugarHotelDoble}
              generandoLugar={generandoLugar}
              programarBusquedaHotel={programarBusquedaHotel}
              programarBusquedaHotelDoble={programarBusquedaHotelDoble}
              guardarFotoHotelManual={guardarFotoHotelManual}
              guardarFotoHotelManualDoble={guardarFotoHotelManualDoble}
            />
          </div>
          <div style={{ flex: '0 1 260px', minWidth: '220px' }}>
            <PanelHistorialHoteles
              tipoDestino={tipoDestino}
              destinoId={destinoId} destino1Id={destino1Id} destino2Id={destino2Id}
              destinos={destinos}
            />
          </div>
        </div>

        <SeccionComparativaHoteles
          hotelesOpciones={hotelesOpciones}
          comparativaHoteles={comparativaHoteles} setComparativaHoteles={setComparativaHoteles}
          generandoComparativa={generandoComparativa}
          onGenerar={generarComparativaHoteles}
        />

        <hr style={{ margin: '1.5rem 0' }} />

        <SeccionInfoIA
          climaTexto={climaTexto} setClimaTexto={setClimaTexto}
          paseosIA={paseosIA} setPaseosIA={setPaseosIA}
          generandoIA={generandoIA}
        />

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
          {cargando ? 'Guardando y consultando IA...' : 'Guardar cotización'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  )
}

export default function NuevaCotizacion() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Cargando...</div>}>
      <NuevaCotizacionInner />
    </Suspense>
  )
}