import { FilaCosto, FilaCostoTour } from './FilaCosto'

export function SeccionCostosFijos({ costosFijos, actualizarCosto, tipoDestino }) {
  return (
    <>
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
    </>
  )
}