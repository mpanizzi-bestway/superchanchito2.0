'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const COMPOSICION = { 1: 'individual', 2: 'doble', 3: 'triple', 4: 'cuádruple', 5: 'quíntuple' }

function composicion(adl) {
  return COMPOSICION[adl] || `${adl} adultos`
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
      while (nuevo.length < n) nuevo.push({ adl: 1, chd: 0, inf: 0 })
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
    <main style={{ padding: '2rem', maxWidth: '650px' }}>
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

        {/* Botones para revelar las columnas CHD/INF cuando ninguna habitación las tiene aún */}
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
              <FilaCosto label="🚌 Traslados interhoteles" item="traslados_interhoteles" costos={costosFijos} actualizar={actualizarCosto} />
            )}
            <FilaCosto label="🛡️ Seguro médico y de viaje" item="seguro" costos={costosFijos} actualizar={actualizarCosto} />
            <FilaCostoTour label="Tour 1" item="tour1" placeholder="Ej: Tour panorámico" costos={costosFijos} actualizar={actualizarCosto} />
            <FilaCostoTour label="Tour 2" item="tour2" placeholder="Ej: Excursión especial" costos={costosFijos} actualizar={actualizarCosto} />
          </tbody>
        </table>

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