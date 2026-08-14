export async function POST(req) {
  try {
    const { nombre, ciudad, pais } = await req.json()
    if (!nombre || !ciudad) return Response.json({ encontrado: false })

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY no está configurada')
      return Response.json({ encontrado: false })
    }

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.location,places.photos,places.formattedAddress',
      },
      body: JSON.stringify({ textQuery: `${nombre}, ${ciudad}, ${pais}` }),
    })

    if (!res.ok) {
      const textoError = await res.text()
      console.error('Error de Places API:', res.status, textoError)
      return Response.json({ encontrado: false })
    }

    const data = await res.json()
    console.log('Respuesta de Places API:', JSON.stringify(data))
    const lugar = data?.places?.[0]
    if (!lugar) return Response.json({ encontrado: false })

    return Response.json({
      encontrado: true,
      lat: lugar.location?.latitude ?? null,
      lng: lugar.location?.longitude ?? null,
      fotoNombre: lugar.photos?.[0]?.name ?? null,
      direccion: lugar.formattedAddress ?? null,
    })
  } catch (e) {
    console.error('Excepción en hotel-lugar:', e)
    return Response.json({ encontrado: false })
  }
}