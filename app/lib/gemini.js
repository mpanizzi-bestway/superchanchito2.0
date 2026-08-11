const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent'

// Nunca lanza excepción hacia arriba: si algo falla, devuelve null
// para que el resto del sistema siga funcionando sin bloquearse.
export async function llamarGemini(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return null

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return texto ? texto.trim() : null
  } catch {
    return null
  }
}