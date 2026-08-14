export function FotoYMapaHotel({ lat, lng, fotoUrl, direccion, fotoConsultada }) {
  const bbox = lat && lng
    ? `${lng - 0.006},${lat - 0.006},${lng + 0.006},${lat + 0.006}`
    : null

  if (!bbox && !fotoUrl && fotoConsultada !== false) return null

  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
      {fotoUrl ? (
        <div style={{ width: '220px', height: '220px', overflow: 'hidden', border: '1px solid #ccc', flexShrink: 0 }}>
          <img src={fotoUrl} alt="Foto del hotel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : fotoConsultada && (
        <p style={{ fontSize: '0.85rem', color: '#a00' }}>No se encontraron imágenes para este hotel.</p>
      )}
      {bbox && (
        <div style={{ width: '220px', height: '220px', border: '1px solid #ccc', flexShrink: 0 }}>
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${lat},${lng}`}
            style={{ width: '100%', height: '100%', border: 0 }}
            title="Ubicación del hotel"
          />
        </div>
      )}
      {direccion && <p style={{ fontSize: '0.75rem', color: '#555', width: '100%', margin: 0 }}>{direccion}</p>}
    </div>
  )
}