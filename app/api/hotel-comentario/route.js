import { llamarGemini } from '../../lib/gemini'

export async function POST(req) {
  try {
    const { nombre, ciudad, pais } = await req.json()
    if (!nombre || !ciudad) return Response.json({ comentario: null })

    const prompt = `Escribí un comentario breve (máximo 3 líneas) en español sobre el hotel "${nombre}" ubicado en ${ciudad}, ${pais}. Destacá sus puntos fuertes generales y su ubicación, en tono positivo e informativo para una cotización de viaje. Si no reconocés el hotel específico, describí en términos generales lo que suele ofrecer un hotel de esa zona, sin inventar datos concretos (no menciones cantidad de estrellas, precios exactos, ni servicios específicos que no puedas confirmar). No uses comillas ni markdown, devolvé solo el texto.`

    const texto = await llamarGemini(prompt)
    return Response.json({ comentario: texto })
  } catch {
    return Response.json({ comentario: null })
  }
}