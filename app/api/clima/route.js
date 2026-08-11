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
      prompt = `Escribí una sola línea en español sobre el clima esperado en ${d1.ciudad}, ${d1.pais} y en ${d2.ciudad}, ${d2.pais} durante el mes de ${mes}, ya que son dos destinos distintos del mismo viaje. Tono siempre positivo e informativo, mencionando temperaturas aproximadas para ambos destinos y si suele haber lluvias. Agregá un emoji relacionado al clima al final. No uses comillas ni markdown, devolvé solo el texto de la línea, sin preámbulo.`
    }

    const texto = await llamarGemini(prompt)
    return Response.json({ texto })
  } catch {
    return Response.json({ texto: null })
  }
}