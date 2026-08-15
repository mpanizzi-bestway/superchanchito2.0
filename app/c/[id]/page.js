import { supabase } from '../../lib/supabase'
import { obtenerCotizacionCompleta } from '../../lib/obtenerCotizacion'
import { VistaClienteCotizacion } from '../../components/VistaClienteCotizacion'

export default async function CotizacionOnline({ params }) {
  const { id } = await params
  const { cotizacion, error } = await obtenerCotizacionCompleta(supabase, id)

  if (error || !cotizacion) {
    return <main style={{ padding: '2rem' }}><p>No se encontró la cotización.</p></main>
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <VistaClienteCotizacion cotizacion={cotizacion} />
    </main>
  )
}