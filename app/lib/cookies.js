export function getCookie(nombre) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + nombre + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export function setCookie(nombre, valor, dias = 365) {
  if (typeof document === 'undefined') return
  const fecha = new Date()
  fecha.setTime(fecha.getTime() + dias * 24 * 60 * 60 * 1000)
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${fecha.toUTCString()}; path=/`
}