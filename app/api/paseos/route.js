import { llamarGemini } from '../../lib/gemini'

export async function POST(req) {
  try {
    const { ciudad, pais } = await req.json()
    if (!ciudad || !pais) return Response.json({ paseos: [] })

    const prompt = `Listá los 4 paseos o excursiones más recomendables para hacer en ${ciudad}, ${pais}. Para cada uno indicá: nombre, costo estimado en dólares (aproximado, no hace falta que sea exacto) y una descripción de hasta 3 líneas. Devolvé ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional, sin markdown, sin bloques de código: [{"nombre":"...","costo":"...","descripcion":"..."}] con exactamente 4 elementos.`

    const texto = await llamarGemini(prompt)
    if (!texto) return Response.json({ paseos: [] })

    const limpio = texto.replace(/```json/gi, '').replace(/```/g, '').trim()

    try {
      const paseos = JSON.parse(limpio)
      return Response.json({ paseos: Array.isArray(paseos) ? paseos : [] })
    } catch {
      return Response.json({ paseos: [] })
    }
  } catch {
    return Response.json({ paseos: [] })
  }
}