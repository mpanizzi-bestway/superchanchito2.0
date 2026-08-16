export async function obtenerCotizacionCompleta(supabase, id) {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      cliente:cliente_id ( nombre, apellido, telefono, email, origen_consulta ),
      agente:agente_id ( nombre, apellido, cargo, whatsapp, email, interno ),
      destino:destino_id ( ciudad, pais ),
      destino1:destino1_id ( ciudad, pais ),
      destino2:destino2_id ( ciudad, pais )
    `)
    .eq('id', id)
    .single()

  return { cotizacion: data, error }
}