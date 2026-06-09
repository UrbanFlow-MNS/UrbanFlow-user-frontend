export type FormatLang = 'fr' | 'en'

export function formatDuration(seconds: number, lang: FormatLang = 'fr'): string {
  const total = Math.max(0, Math.round(seconds / 60))
  const hours = Math.floor(total / 60)
  const minutes = total % 60

  if (lang === 'fr') {
    if (hours === 0) return `${minutes} min`
    return `${hours} h ${String(minutes).padStart(2, '0')}`
  }

  if (hours === 0) return `${minutes} min`
  return `${hours}h ${minutes}min`
}

export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor((total / 3600) % 24)
  const m = Math.floor((total / 60) % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
