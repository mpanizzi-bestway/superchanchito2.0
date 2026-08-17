import { supabase } from '../../../lib/supabase'
import { obtenerCotizacionCompleta } from '../../../lib/obtenerCotizacion'
import { generarSeccionesWhatsapp, generarTextoWhatsapp } from '../../../lib/textoWhatsapp'
import { VistaWhatsapp } from '../../../components/VistaWhatsapp'

export default async function CotizacionWhatsapp({ params }) {
  const { id } = await params
  const { cotizacion, error } = await obtenerCotizacionCompleta(supabase, id)

  if (error || !cotizacion) {
    return <main style={{ padding: '2rem' }}><p>No se encontró la cotización.</p></main>
  }

  const secciones = generarSeccionesWhatsapp(cotizacion)
  const texto = generarTextoWhatsapp(cotizacion)

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <VistaWhatsapp secciones={secciones} texto={texto} />
    </main>
  )
}