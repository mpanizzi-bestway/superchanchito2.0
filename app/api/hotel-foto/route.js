export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const fotoNombre = searchParams.get('fotoNombre')
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!fotoNombre || !apiKey) {
      return new Response(null, { status: 404 })
    }

    const url = `https://places.googleapis.com/v1/${fotoNombre}/media?maxWidthPx=500&maxHeightPx=500&key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) return new Response(null, { status: 404 })

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const buffer = await res.arrayBuffer()

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}