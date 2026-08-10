import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '500px' }}>
      <h1>Cotizador de Viajes</h1>
      <p>Sistema interno de armado de cotizaciones de paquetes turísticos.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link href="/nueva"><button>+ Nueva cotización</button></Link>
        <Link href="/cotizaciones"><button>Ver cotizaciones</button></Link>
      </div>
    </main>
  )
}