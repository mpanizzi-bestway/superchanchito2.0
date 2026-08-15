import { supabase } from '../../../lib/supabase'
import { obtenerCotizacionCompleta } from '../../../lib/obtenerCotizacion'
import { VistaClienteCotizacion } from '../../../components/VistaClienteCotizacion'
import { BotonImprimir } from '../../../components/BotonImprimir'

export default async function CotizacionPdf({ params }) {
  const { id } = await params
  const { cotizacion, error } = await obtenerCotizacionCompleta(supabase, id)

  if (error || !cotizacion) {
    return <main style={{ padding: '2rem' }}><p>No se encontró la cotización.</p></main>
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div className="no-imprimir" style={{ marginBottom: '1rem' }}>
        <BotonImprimir />
      </div>
      <VistaClienteCotizacion cotizacion={cotizacion} />
      <style>{`
        @media print {
          .no-imprimir { display: none; }
        }
      `}</style>
    </main>
  )
}