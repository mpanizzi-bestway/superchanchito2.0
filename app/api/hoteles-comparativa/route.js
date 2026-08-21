import { llamarGemini } from '../../lib/gemini'

export async function POST(req) {
  try {
    const { ciudad, pais, hoteles } = await req.json()
    if (!hoteles || hoteles.length < 2) return Response.json({ frases: [] })

    const listado = hoteles.map((h, i) => `${i + 1}. ${h.nombre} — U$S ${h.precio} por adulto (${h.regimen})`).join('\n')

    const prompt = `Sos un asesor de viajes armando el copy de venta de una cotización para ${ciudad}, ${pais}. Estas son las opciones de hotel cotizadas, en el orden en que se muestran al cliente:\n${listado}\n\nPara cada una, escribí de 1 a 3 líneas cortas en español que la posicionen frente a las demás (la más económica como mejor opción de precio, las intermedias como mejor relación precio-calidad, la más cara como la más exclusiva o todo incluido, etc.), en tono de venta persuasivo. No repitas el nombre del hotel ni el precio, ya se muestran aparte. Cada línea debe empezar con "•". Devolvé ÚNICAMENTE un JSON válido con un array de strings, uno por hotel, en el mismo orden, sin texto adicional ni markdown, cada string con sus líneas separadas por \\n: ["• línea1\\n• línea2", "..."]`

    const texto = await llamarGemini(prompt)
    if (!texto) return Response.json({ frases: [] })

    const limpio = texto.replace(/```json/gi, '').replace(/```/g, '').trim()
    try {
      const frases = JSON.parse(limpio)
      return Response.json({ frases: Array.isArray(frases) ? frases : [] })
    } catch {
      return Response.json({ frases: [] })
    }
  } catch {
    return Response.json({ frases: [] })
  }
}