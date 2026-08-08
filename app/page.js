import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '500px' }}>
      <h1>Cotizador de Viajes</h1>
      <p>Sistema interno de armado de cotizaciones de paquetes turísticos.</p>
      <Link href="/nueva">
        <button style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          + Nueva cotización
        </button>
      </Link>
    </main>
  )
}