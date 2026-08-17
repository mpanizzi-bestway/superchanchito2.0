import { resumenPax, renderEstrellas } from '../lib/calculos'
import { FilaHotelCalculada, FilaHotelEditable, FilaHotelPorcentaje } from './FilaHotelComun'
import { FilaHotelCosto } from './HotelUnico'
import { BloqueHotelSimple, FilaHotelCostoDoble } from './HotelDoble'
import { FotoYMapaHotel } from './FotoYMapaHotel'
import { FotoHotelManual } from './FotoHotelManual'

export function SeccionHoteles({
  hotelesOpciones,
  habitaciones,
  mostrarColumnaChd, mostrarColumnaInf,
  toggleExpandido, quitarOpcionHotel, agregarOpcionHotel,
  actualizarHotelCampo, actualizarComision, actualizarHabitacionHotel,
  actualizarCostoPasajero, calcularNeto, actualizarVentaManual, actualizarUtilidadManual,
  actualizarHotelSimpleCampo, actualizarComisionDoble, actualizarHabitacionDobleCampo,
  actualizarCostoPasajeroDoble, calcularNetoDoble, actualizarVentaManualDoble, actualizarUtilidadManualDoble,
  generarComentarioHotel, generarComentarioHotelDoble, generandoComentario,
  generarLugarHotel, generarLugarHotelDoble, generandoLugar,
  programarBusquedaHotel, programarBusquedaHotelDoble,
  guardarFotoHotelManual, guardarFotoHotelManualDoble,
}) {

  return (
    <>
      <h2>Opciones de Hoteles</h2>

      {hotelesOpciones.map((hotel, hIndex) => (
        <div key={hIndex} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ cursor: 'pointer' }} onClick={() => toggleExpandido(hIndex)}>
              {hotel.expandido ? '▼' : '▶'} Opción {hIndex + 1}
              {hotel.modo === 'unico' && hotel.nombre && (
                <span style={{ fontWeight: 'normal', color: '#555' }}>
                  {' — '}{hotel.nombre}{hotel.estrellas ? ` ${renderEstrellas(hotel.estrellas)}` : ''}
                </span>
              )}
            </h3>

            {hIndex > 0 && (
              <button
                type="button"
                onClick={() => quitarOpcionHotel(hIndex)}
                style={{ fontSize: '0.8rem' }}
              >
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
                      onGenerarComentario={() => generarComentarioHotelDoble(hIndex, 'hotel1')}
                      generandoComentario={generandoComentario[`${hIndex}-hotel1`]}
                      onNombreChange={valor => programarBusquedaHotelDoble(hIndex, 'hotel1', valor)}
                      onGuardar={datos => guardarFotoHotelManualDoble(hIndex, 'hotel2', datos)}
                    />

                    <BloqueHotelSimple
                      titulo="Hotel — 2do destino"
                      datos={hotel.hotel2}
                      onCampo={(campo, valor) => actualizarHotelSimpleCampo(hIndex, 'hotel2', campo, valor)}
                      onComision={valor => actualizarComisionDoble(hIndex, 'hotel2', valor)}
                      onGenerarComentario={() => generarComentarioHotelDoble(hIndex, 'hotel2')}
                      generandoComentario={generandoComentario[`${hIndex}-hotel2`]}
                      onNombreChange={valor => programarBusquedaHotelDoble(hIndex, 'hotel2', valor)}
                      onGuardarUrl={url => guardarFotoHotelManualDoble(hIndex, 'hotel2', url)}
                    />
                  </div>

                  {hotel.habitaciones.map((hab, habIndex) => (
                    <div
                      key={habIndex}
                      style={{
                        marginTop: '1rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px dashed #ccc'
                      }}
                    >
                      <h4>
                        Habitación {habIndex + 1}{' '}
                        <span
                          style={{
                            fontWeight: 'normal',
                            color: '#555',
                            fontSize: '0.9rem'
                          }}
                        >
                          ({resumenPax(habitaciones[habIndex])})
                        </span>
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label>Tipo de habitación (1er destino)</label><br />
                          <input
                            value={hab.tipoHabitacion1}
                            onChange={e =>
                              actualizarHabitacionDobleCampo(
                                hIndex,
                                habIndex,
                                'tipoHabitacion1',
                                e.target.value
                              )
                            }
                            placeholder="Ej: Doble Standard"
                          />

                          <table
                            style={{
                              marginTop: '0.5rem',
                              borderCollapse: 'collapse',
                              width: '100%'
                            }}
                          >
                            <thead>
                              <tr>
                                <th></th>
                                <th style={{ textAlign: 'left', padding: '0.3rem' }}>ADL</th>
                                {mostrarColumnaChd && (
                                  <th style={{ textAlign: 'left', padding: '0.3rem' }}>CHD</th>
                                )}
                                {mostrarColumnaInf && (
                                  <th style={{ textAlign: 'left', padding: '0.3rem' }}>INF</th>
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              <FilaHotelCostoDoble
                                label="Costo comm. hotel"
                                hab={hab}
                                hIndex={hIndex}
                                habIndex={habIndex}
                                campo="costo1"
                                habitacionesPax={habitaciones[habIndex]}
                                mostrarChd={mostrarColumnaChd}
                                mostrarInf={mostrarColumnaInf}
                                onCosto={actualizarCostoPasajeroDoble}
                              />
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <label>Tipo de habitación (2do destino)</label><br />
                          <input
                            value={hab.tipoHabitacion2}
                            onChange={e =>
                              actualizarHabitacionDobleCampo(
                                hIndex,
                                habIndex,
                                'tipoHabitacion2',
                                e.target.value
                              )
                            }
                            placeholder="Ej: Doble Standard"
                          />

                          <table
                            style={{
                              marginTop: '0.5rem',
                              borderCollapse: 'collapse',
                              width: '100%'
                            }}
                          >
                            <thead>
                              <tr>
                                <th></th>
                                <th style={{ textAlign: 'left', padding: '0.3rem' }}>ADL</th>
                                {mostrarColumnaChd && (
                                  <th style={{ textAlign: 'left', padding: '0.3rem' }}>CHD</th>
                                )}
                                {mostrarColumnaInf && (
                                  <th style={{ textAlign: 'left', padding: '0.3rem' }}>INF</th>
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              <FilaHotelCostoDoble
                                label="Costo comm. hotel"
                                hab={hab}
                                hIndex={hIndex}
                                habIndex={habIndex}
                                campo="costo2"
                                habitacionesPax={habitaciones[habIndex]}
                                mostrarChd={mostrarColumnaChd}
                                mostrarInf={mostrarColumnaInf}
                                onCosto={actualizarCostoPasajeroDoble}
                              />
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <table
                        style={{
                          marginTop: '0.75rem',
                          borderCollapse: 'collapse',
                          width: '100%'
                        }}
                      >
                        <thead>
                          <tr>
                            <th></th>
                            <th style={{ textAlign: 'left', padding: '0.4rem' }}>ADL</th>
                            {mostrarColumnaChd && (
                              <th style={{ textAlign: 'left', padding: '0.4rem' }}>CHD</th>
                            )}
                            {mostrarColumnaInf && (
                              <th style={{ textAlign: 'left', padding: '0.4rem' }}>INF</th>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          <FilaHotelCalculada
                            label="Neto por pasajero"
                            hab={hab}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
                            calcular={(tipo) =>
                              calcularNetoDoble(
                                habIndex,
                                tipo,
                                hab[tipo].costo1,
                                hotel.hotel1.comision,
                                hab[tipo].costo2,
                                hotel.hotel2.comision
                              )
                            }
                          />

                          <FilaHotelEditable
                            label="Precio de venta sugerido"
                            hab={hab}
                            hIndex={hIndex}
                            habIndex={habIndex}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
                            campo="venta"
                            onEditar={actualizarVentaManualDoble}
                          />

                          <FilaHotelEditable
                            label="Utilidad (USD)"
                            hab={hab}
                            hIndex={hIndex}
                            habIndex={habIndex}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
                            campo="utilidad"
                            onEditar={actualizarUtilidadManualDoble}
                          />

                          <FilaHotelPorcentaje
                            hab={hab}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
                          />
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      alignItems: 'flex-end'
                    }}
                  >
                    <div>
                      <label>Nombre del hotel</label><br />
                      <input
                        value={hotel.nombre}
                        onChange={e => {
                          const valor = e.target.value
                          actualizarHotelCampo(hIndex, 'nombre', valor)
                          programarBusquedaHotel(hIndex, valor)
                        }}
                        placeholder="Ej: Hotel Fasano"
                      />
                    </div>

                    <div>
                      <label>Régimen</label><br />
                      <select
                        value={hotel.regimen}
                        onChange={e =>
                          actualizarHotelCampo(hIndex, 'regimen', e.target.value)
                        }
                      >
                        <option>Solo Alojamiento</option>
                        <option>Desayuno Incluido</option>
                        <option>Media Pensión</option>
                        <option>Pensión Completa</option>
                        <option>Todo Incluido</option>
                      </select>
                    </div>

                    <div>
                      <label>Link del hotel (opcional)</label><br />
                      <input
                        value={hotel.link}
                        onChange={e =>
                          actualizarHotelCampo(hIndex, 'link', e.target.value)
                        }
                        placeholder="https://..."
                        style={{ width: '200px' }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => generarComentarioHotel(hIndex)}
                      disabled={
                        !hotel.nombre ||
                        generandoComentario[`${hIndex}-unico`]
                      }
                      style={{
                        fontSize: '0.75rem',
                        color: '#555',
                        background: 'none',
                        border: '1px solid #ccc',
                        padding: '0.3rem 0.6rem'
                      }}
                    >
                      {generandoComentario[`${hIndex}-unico`]
                        ? 'Generando...'
                        : '✨ Comentario IA'}
                    </button>
                  </div>

                  <textarea
                    value={hotel.comentario}
                    onChange={e =>
                      actualizarHotelCampo(
                        hIndex,
                        'comentario',
                        e.target.value
                      )
                    }
                    placeholder="Comentario sobre el hotel (se puede generar con IA o escribir a mano)"
                    rows={4}
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  />

                  <FotoYMapaHotel
                    lat={hotel.lat}
                    lng={hotel.lng}
                    fotoUrl={hotel.fotoUrl}
                    direccion={hotel.direccion}
                    fotoConsultada={hotel.fotoConsultada}
                  />
                  <FotoHotelManual
                    fotoUrl={hotel.fotoUrl}
                    estrellas={hotel.estrellas}
                    link={hotel.link}
                    fotoConsultada={hotel.fotoConsultada}
                    hayNombre={!!hotel.nombre?.trim()}
                    onGuardar={datos => guardarFotoHotelManual(hIndex, datos)}
                  />

                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginTop: '1rem'
                    }}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={hotel.noRefPrepago}
                        onChange={e =>
                          actualizarHotelCampo(
                            hIndex,
                            'noRefPrepago',
                            e.target.checked
                          )
                        }
                      />
                      {' '}NO REF/PREPAGO
                    </label>

                    <div>
                      <label>Operador (opcional)</label><br />
                      <input
                        style={{ width: '180px' }}
                        value={hotel.operador}
                        onChange={e =>
                          actualizarHotelCampo(
                            hIndex,
                            'operador',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Comm. %</label><br />
                      <input
                        type="number"
                        style={{ width: '70px' }}
                        value={hotel.comision}
                        onChange={e =>
                          actualizarComision(hIndex, e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {hotel.noRefPrepago && (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: '#a00',
                        marginTop: '0.5rem'
                      }}
                    >
                      Se agregará: "Promoción 100% pre paga y en gastos totales (sin devolución)"
                    </p>
                  )}

                  {hotel.habitaciones.map((hab, habIndex) => (
                    <div
                      key={habIndex}
                      style={{
                        marginTop: '1rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px dashed #ccc'
                      }}
                    >
                      <h4>
                        Habitación {habIndex + 1}{' '}
                        <span
                          style={{
                            fontWeight: 'normal',
                            color: '#555',
                            fontSize: '0.9rem'
                          }}
                        >
                          ({resumenPax(habitaciones[habIndex])})
                        </span>
                      </h4>

                      <div>
                        <label>Tipo de habitación</label><br />
                        <input
                          value={hab.tipoHabitacion}
                          onChange={e =>
                            actualizarHabitacionHotel(
                              hIndex,
                              habIndex,
                              'tipoHabitacion',
                              e.target.value
                            )
                          }
                          placeholder="Ej: Doble Standard"
                        />
                      </div>

                      <table
                        style={{
                          marginTop: '0.75rem',
                          borderCollapse: 'collapse',
                          width: '100%'
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                textAlign: 'left',
                                padding: '0.4rem'
                              }}
                            ></th>
                            <th
                              style={{
                                textAlign: 'left',
                                padding: '0.4rem'
                              }}
                            >
                              ADL
                            </th>
                            {mostrarColumnaChd && (
                              <th
                                style={{
                                  textAlign: 'left',
                                  padding: '0.4rem'
                                }}
                              >
                                CHD
                              </th>
                            )}
                            {mostrarColumnaInf && (
                              <th
                                style={{
                                  textAlign: 'left',
                                  padding: '0.4rem'
                                }}
                              >
                                INF
                              </th>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          <FilaHotelCosto
                            label="Costo comm. hotel (estadía total)"
                            hotel={hotel}
                            hIndex={hIndex}
                            habIndex={habIndex}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
                            onCosto={actualizarCostoPasajero}
                          />

                          <FilaHotelCalculada
                            label="Neto por pasajero"
                            hab={hab}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
                            calcular={(tipo) =>
                              calcularNeto(
                                habIndex,
                                tipo,
                                hab[tipo].costo,
                                hotel.comision
                              )
                            }
                          />

                          <FilaHotelEditable
                            label="Precio de venta sugerido"
                            hab={hab}
                            hIndex={hIndex}
                            habIndex={habIndex}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
                            campo="venta"
                            onEditar={actualizarVentaManual}
                          />

                          <FilaHotelEditable
                            label="Utilidad (USD)"
                            hab={hab}
                            hIndex={hIndex}
                            habIndex={habIndex}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
                            campo="utilidad"
                            onEditar={actualizarUtilidadManual}
                          />

                          <FilaHotelPorcentaje
                            hab={hab}
                            habitacionesPax={habitaciones[habIndex]}
                            mostrarChd={mostrarColumnaChd}
                            mostrarInf={mostrarColumnaInf}
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
        <button
          type="button"
          onClick={agregarOpcionHotel}
          style={{ marginBottom: '1rem' }}
        >
          + Agregar otra opción de hotel ({hotelesOpciones.length}/4)
        </button>
      )}
    </>
  )
}