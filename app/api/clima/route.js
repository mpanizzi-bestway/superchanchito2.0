import { llamarGemini } from '../../lib/gemini'

export async function POST(req) {
  try {
    const { destinos, mes } = await req.json()

    if (!destinos || destinos.length === 0 || !mes) {
      return Response.json({ texto: null })
    }

    let prompt
    if (destinos.length === 1) {
      const d = destinos[0]
      prompt = `Escribí una sola línea en español sobre el clima esperado en ${d.ciudad}, ${d.pais} durante el mes de ${mes}. Tono siempre positivo e informativo, mencionando un rango aproximado de temperaturas y si suele haber lluvias. Agregá un emoji relacionado al clima al final. No uses comillas ni markdown, devolvé solo el texto de la línea, sin preámbulo.`
    } else {
      const [d1, d2] = destinos
      prompt = `Escribí una sola línea breve en español sobre el clima esperado en ${d1.ciudad} y ${d2.ciudad} durante el mes de ${mes}, dos destinos del mismo viaje que suelen estar geográficamente cerca. Si comparten condiciones climáticas similares, planteálo como un plus para el viajero ("mismo clima en los dos destinos, así no hay que cambiar de ropa") en vez de detallar cada ciudad por separado; si son bien distintas, mencioná ambas brevemente. Tono siempre positivo e informativo. Agregá un emoji relacionado al clima al final. Máximo una oración corta. No uses comillas ni markdown, devolvé solo el texto de la línea, sin preámbulo.`
    }

    const texto = await llamarGemini(prompt)
    return Response.json({ texto })
  } catch {
    return Response.json({ texto: null })
  }
}