'use client'

import { useState, useEffect } from 'react'
import { OPERADORES } from '../lib/operadores'

export function SelectorOperador({ value, onChange }) {
  const [mostrarOtro, setMostrarOtro] = useState(!OPERADORES.includes(value) && !!value)

  useEffect(() => {
    setMostrarOtro(!OPERADORES.includes(value) && !!value)
  }, [value])

  function handleSelect(e) {
    const v = e.target.value
    if (v === 'Otro') {
      setMostrarOtro(true)
      onChange('')
    } else {
      setMostrarOtro(false)
      onChange(v)
    }
  }

  return (
    <div>
      <label>Operador (opcional)</label><br />
      <select value={mostrarOtro ? 'Otro' : (value || '')} onChange={handleSelect} style={{ width: '180px' }}>
        <option value="">Seleccionar...</option>
        {OPERADORES.map(op => <option key={op} value={op}>{op}</option>)}
      </select>
      {mostrarOtro && (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Especificar operador"
          style={{ width: '180px', marginTop: '0.3rem', display: 'block' }}
        />
      )}
    </div>
  )
}