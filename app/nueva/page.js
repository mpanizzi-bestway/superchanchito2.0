'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

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
  const [diasDestino, setDiasDestino] = useState('')
  const [destino1Id, setDestino1Id] = useState('')
  const [diasDestino1, setDiasDestino1] = useState('')
  const [destino2Id, setDestino2Id] = useState('')
  const [diasDestino2, setDiasDestino2] = useState('')

  // ----- Agregar nuevo destino -----
  const [mostrarNuevoDestino, setMostrarNuevoDestino] = useState(false)
  const [nuevoDestinoCiudad, setNuevoDestinoCiudad] = useState('')
  const [nuevoDestinoPais, setNuevoDestinoPais] = useState('')
  const [guardandoDestino, setGuardandoDestino] = useState(false)

  useEffect(() => {
    cargarDestinos()
  }, [])

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

    if (error) {
      setError(error.message)
      return
    }

    setNuevoDestinoCiudad('')
    setNuevoDestinoPais('')
    setMostrarNuevoDestino(false)
    await cargarDestinos()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)
    setError('')

    // Calcula fecha de seguimiento: hoy + 2 días, 10:10 am
    let fechaSeguimiento = null
    if (seguimiento) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() + 2)
      fecha.setHours(10, 10, 0, 0)
      fechaSeguimiento = fecha.toISOString()
    }

    // 1. Crear el cliente
    const { data: cliente, error: errorCliente } = await supabase
      .from('clientes')
      .insert({
        nombre,
        apellido,
        telefono,
        email,
        origen_consulta: origenConsulta,
        seguimiento,
        fecha_seguimiento: fechaSeguimiento,
      })
      .select()
      .single()

    if (errorCliente) {
      setCargando(false)
      setError(errorCliente.message)
      return
    }

    // 2. Crear la cotización asociada
    const datosCotizacion = {
      cliente_id: cliente.id,
      cliente_nombre: `${nombre} ${apellido}`,
      tipo_destino: tipoDestino,
      fecha_inicio_viaje: fechaInicioViaje,
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

    if (errorCotizacion) {
      setError(errorCotizacion.message)
      return
    }

    router.push(`/cotizacion/${cotizacion.id}`)
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '600px' }}>
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
          <input
            type="tel"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            placeholder="+598 099 123 456"
          />
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
            <input
              type="checkbox"
              checked={seguimiento}
              onChange={e => setSeguimiento(e.target.checked)}
            />
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
            <input
              type="radio"
              name="tipoDestino"
              checked={tipoDestino === 'unico'}
              onChange={() => setTipoDestino('unico')}
            />
            {' '}Destino Único
          </label>
          {' '}
          <label>
            <input
              type="radio"
              name="tipoDestino"
              checked={tipoDestino === 'doble'}
              onChange={() => setTipoDestino('doble')}
            />
            {' '}Doble Destino
          </label>
        </div>

        <div>
          <label>Fecha de inicio del viaje</label><br />
          <input
            type="date"
            value={fechaInicioViaje}
            onChange={e => setFechaInicioViaje(e.target.value)}
            required
          />
        </div>

        {tipoDestino === 'unico' ? (
          <>
            <div>
              <label>Destino</label><br />
              <select value={destinoId} onChange={e => setDestinoId(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => (
                  <option key={d.id} value={d.id}>{d.ciudad}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Días en destino</label><br />
              <input
                type="number"
                min="1"
                value={diasDestino}
                onChange={e => setDiasDestino(e.target.value)}
                required
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label>1er Destino</label><br />
              <select value={destino1Id} onChange={e => setDestino1Id(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => (
                  <option key={d.id} value={d.id}>{d.ciudad}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Días en 1er Destino</label><br />
              <input
                type="number"
                min="1"
                value={diasDestino1}
                onChange={e => setDiasDestino1(e.target.value)}
                required
              />
            </div>
            <div>
              <label>2do Destino</label><br />
              <select value={destino2Id} onChange={e => setDestino2Id(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {destinos.map(d => (
                  <option key={d.id} value={d.id}>{d.ciudad}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Días en 2do Destino</label><br />
              <input
                type="number"
                min="1"
                value={diasDestino2}
                onChange={e => setDiasDestino2(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div style={{ marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => setMostrarNuevoDestino(!mostrarNuevoDestino)}
          >
            {mostrarNuevoDestino ? '▲ Agregar destino' : '▼ Agregar destino'}
          </button>

          {mostrarNuevoDestino && (
            <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '0.5rem' }}>
              <div>
                <label>Nombre del nuevo destino (ciudad)</label><br />
                <input
                  value={nuevoDestinoCiudad}
                  onChange={e => setNuevoDestinoCiudad(e.target.value)}
                />
              </div>
              <div>
                <label>País</label><br />
                <input
                  value={nuevoDestinoPais}
                  onChange={e => setNuevoDestinoPais(e.target.value)}
                />
              </div>
              <button type="button" onClick={handleAgregarDestino} disabled={guardandoDestino}>
                {guardandoDestino ? 'Guardando...' : 'Guardar destino'}
              </button>
            </div>
          )}
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