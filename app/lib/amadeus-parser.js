// ============================================================
//  amadeus-parser.js
//  Parseo de itinerarios Amadeus (cryptic) — sin dependencias.
// ============================================================

export function parsearAmadeus(texto) {
  if (!texto || texto.trim() === '') return [];

  const lineas    = texto.split('\n');
  const segmentos = [];

  const MESES = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
  };

  const RE = /^\s{0,4}(\d{1,2})\s{1,4}([A-Z0-9]{2})\s?(\d{1,4})\s+([A-Z])\s+(\d{2}[A-Z]{3})\s+(?:\d[*\s]?)?\s*([A-Z]{3})([A-Z]{3})\s+(?:HK|DK|HL|TK|UN|WK|FLWN)\d*\s+(\d{4})\s+(\d{4})\s*(\d{2}[A-Z]{3})?/i;

  function convertirFecha(raw) {
    if (!raw || raw.length < 5) return '';
    const dia = raw.substring(0, 2);
    const mes = MESES[raw.substring(2, 5).toUpperCase()] || '??';
    return dia + '/' + mes;
  }

  function convertirHora(raw) {
    if (!raw || raw.length < 4) return '';
    return raw.substring(0, 2) + ':' + raw.substring(2, 4);
  }

  const nrosVistos = new Set();

  for (const linea of lineas) {
    const trimmed = linea.trim();
    if (!trimmed) continue;
    if (/^RP\//i.test(trimmed))   continue;
    if (/^AP\s/i.test(trimmed))   continue;
    if (/^---/.test(trimmed))     continue;
    if (/^\d{3}\s/.test(trimmed)) continue;
    if (/^(SEE|PLS|INT|OPER|127|101|010)\b/i.test(trimmed)) continue;
    if (/^\d+\.\w/.test(trimmed)) continue;
    if (/^ARNK$/i.test(trimmed))  continue;

    const m = linea.match(RE);
    if (!m) continue;

    const nroSeg = parseInt(m[1]);
    if (nrosVistos.has(nroSeg)) continue;
    nrosVistos.add(nroSeg);

    const aerolineaCod = m[2].toUpperCase();
    const numeroVuelo  = m[3];
    const fechaSalida   = convertirFecha(m[5]);

    const fechaLlegadaRaw  = m[10] ? convertirFecha(m[10]) : '';
    const llegadaSiguiente = !!m[10] && fechaLlegadaRaw !== fechaSalida;
    const fechaLlegada     = llegadaSiguiente ? fechaLlegadaRaw : fechaSalida;

    segmentos.push({
      segmento: nroSeg,
      aerolinea: aerolineaCod + numeroVuelo,
      aerolineaCod,
      numeroVuelo,
      clase: m[4].toUpperCase(),
      fechaSalida,
      origen: m[6].toUpperCase(),
      destino: m[7].toUpperCase(),
      horaSalida: convertirHora(m[8]),
      horaLlegada: convertirHora(m[9]),
      fechaLlegada,
      llegadaSiguiente
    });
  }

  segmentos.sort((a, b) => a.segmento - b.segmento);
  return segmentos;
}

export const AIRLINES = {
  LA: 'LATAM Airlines', LP: 'LATAM Perú', XL: 'LATAM Ecuador',
  IB: 'Iberia', VY: 'Vueling', UX: 'Air Europa',
  AA: 'American Airlines', DL: 'Delta Air Lines', UA: 'United Airlines',
  AF: 'Air France', KL: 'KLM', LH: 'Lufthansa',
  AD: 'Azul Linhas Aéreas', G3: 'Gol Linhas Aéreas', JJ: 'TAM Airlines',
  CM: 'Copa Airlines', AV: 'Avianca', AR: 'Aerolíneas Argentinas',
  JL: 'Japan Airlines', NH: 'ANA', CX: 'Cathay Pacific',
  EK: 'Emirates', QR: 'Qatar Airways', TK: 'Turkish Airlines',
  BA: 'British Airways', SK: 'SAS', AY: 'Finnair'
};

export const CITY_NAMES = {
  MVD: 'Montevideo', EZE: 'Buenos Aires', GRU: 'São Paulo',
  GIG: 'Río de Janeiro', REC: 'Recife', SSA: 'Salvador',
  FOR: 'Fortaleza', BSB: 'Brasilia', CUN: 'Cancún',
  MIA: 'Miami', JFK: 'New York', LAX: 'Los Ángeles',
  ORD: 'Chicago', MAD: 'Madrid', BCN: 'Barcelona',
  LHR: 'Londres', CDG: 'París', FCO: 'Roma',
  AMS: 'Ámsterdam', FRA: 'Frankfurt', SCL: 'Santiago',
  LIM: 'Lima', BOG: 'Bogotá', GYE: 'Guayaquil',
  UIO: 'Quito', PTY: 'Panamá', SDU: 'Río de Janeiro',
  MXP: 'Milán', NRT: 'Tokio', HND: 'Tokio',
  DXB: 'Dubai', DOH: 'Doha', IST: 'Estambul',
  SYD: 'Sídney', MEL: 'Melbourne', YYZ: 'Toronto',
  YVR: 'Vancouver', SFO: 'San Francisco', ORY: 'París',
  LGW: 'Londres', PMI: 'Mallorca', TFS: 'Tenerife',
  LPA: 'Gran Canaria', AGP: 'Málaga', PUJ: 'Punta Cana',
  SDQ: 'Santo Domingo', HAV: 'La Habana', CUZ: 'Cusco',
  LPB: 'La Paz', ASU: 'Asunción', VVI: 'Santa Cruz'
};

export function airlineName(cod) {
  return AIRLINES[cod] || cod;
}

export function cityName(iata) {
  return CITY_NAMES[iata] || iata;
}

export function fechaGrupo(segs) {
  if (!segs || segs.length === 0) return '';
  const s = segs[0];
  const MESES = {
    '01': 'ENE', '02': 'FEB', '03': 'MAR', '04': 'ABR', '05': 'MAY', '06': 'JUN',
    '07': 'JUL', '08': 'AGO', '09': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DIC'
  };
  if (s.fechaSalida && s.fechaSalida.length >= 5) {
    const parts = s.fechaSalida.split('/');
    if (parts.length >= 2) {
      return parts[0] + ' ' + (MESES[parts[1]] || parts[1]);
    }
  }
  return s.fechaSalida || '';
}

// Se mantiene disponible para el Módulo 8 (salida en PDF / WhatsApp),
// pero no se usa todavía en el formulario — el preview en pantalla
// se resuelve con un componente React, no con este HTML.
export function buildVuelosHtml(segmentos) {
  if (!segmentos || segmentos.length === 0) {
    return '<div>No se cargó itinerario de vuelos.</div>';
  }

  const origenInicial = segmentos[0].origen;
  let idaSegs = [];
  let vueltaSegs = [];
  let enVuelta = false;

  segmentos.forEach((s, i) => {
    if (i > 0 && !enVuelta && s.origen === origenInicial) enVuelta = true;
    enVuelta ? vueltaSegs.push(s) : idaSegs.push(s);
  });

  if (!enVuelta) idaSegs = segmentos;

  function renderTramo(segs, titulo) {
    if (!segs || !segs.length) return '';
    let rows = '';
    segs.forEach(s => {
      const plus1 = s.llegadaSiguiente ? '<span>+1</span>' : '';
      rows += `<div><span>${airlineName(s.aerolineaCod)} ${s.aerolineaCod}${s.numeroVuelo}</span>
        <span>${s.origen} ${s.horaSalida} ${cityName(s.origen)}</span> →
        <span>${s.destino} ${s.horaLlegada}${plus1} ${cityName(s.destino)}</span></div>`;
    });
    return `<div><div>${titulo}</div>${rows}</div>`;
  }

  const tituloIda    = vueltaSegs.length > 0 ? 'Ida — ' + fechaGrupo(idaSegs) : 'Vuelos';
  const tituloVuelta = vueltaSegs.length > 0 ? 'Regreso — ' + fechaGrupo(vueltaSegs) : '';

  let html = renderTramo(idaSegs, tituloIda);
  if (vueltaSegs.length > 0) html += renderTramo(vueltaSegs, tituloVuelta);
  return html;
}