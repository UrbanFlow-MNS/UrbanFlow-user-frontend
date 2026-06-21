import { useRef, useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

export function TimePicker({ value, onChange, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const [hh, mm] = value.split(':')
  const selectedHour = hh ?? '00'
  const selectedMinute = mm ?? '00'

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const hIdx = HOURS.indexOf(selectedHour)
    const mIdx = MINUTES.indexOf(selectedMinute)
    if (hourRef.current && hIdx >= 0) {
      const item = hourRef.current.children[hIdx] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'center' })
    }
    if (minuteRef.current && mIdx >= 0) {
      const item = minuteRef.current.children[mIdx] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'center' })
    }
  }, [open, selectedHour, selectedMinute])

  function selectHour(h: string) {
    onChange(`${h}:${selectedMinute}`)
  }

  function selectMinute(m: string) {
    onChange(`${selectedHour}:${m}`)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full h-12 rounded-xl border border-border bg-[hsl(0_0%_98%)]',
          'flex items-center gap-2 px-3 text-sm text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          'transition-colors',
        )}
      >
        <Clock size={16} className="text-muted-foreground/70 shrink-0" />
        <span className="tabular-nums">{value}</span>
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 top-full mt-1 left-0',
            'bg-white rounded-xl border border-border/60',
            'shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
            'flex',
          )}
        >
          <div
            ref={hourRef}
            className="w-16 max-h-48 overflow-y-auto py-1"
          >
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault()
                  selectHour(h)
                }}
                className={cn(
                  'w-full px-3 py-1.5 text-sm text-center cursor-pointer',
                  h === selectedHour
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-accent',
                )}
              >
                {h}
              </button>
            ))}
          </div>

          <div className="w-px bg-border/60 my-2" />

          <div
            ref={minuteRef}
            className="w-16 max-h-48 overflow-y-auto py-1"
          >
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault()
                  selectMinute(m)
                }}
                className={cn(
                  'w-full px-3 py-1.5 text-sm text-center cursor-pointer',
                  m === selectedMinute
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-accent',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
