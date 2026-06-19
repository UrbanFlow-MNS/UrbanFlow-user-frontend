import { useRef, useState, useEffect, useId } from 'react'
import { useStops, type Stop } from '@/api/stops'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (name: string) => void
  onSelect: (stop: Stop) => void
  placeholder: string
  icon?: React.ReactNode
}

const MAX_RESULTS = 8

export function StopAutocomplete({ value, onChange, onSelect, placeholder, icon }: Props) {
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const { data: stops, isLoading, isError } = useStops()

  const filtered =
    value.trim().length > 0 && stops
      ? stops
          .filter((s) => s.stopName.toLowerCase().includes(value.trim().toLowerCase()))
          .slice(0, MAX_RESULTS)
      : []

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
    setOpen(true)
    setActiveIndex(-1)
  }

  function handleSelect(stop: Stop) {
    onSelect(stop)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && !isError && !isLoading && filtered.length > 0

  return (
    <div ref={containerRef} className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
          {icon}
        </span>
      )}
      {isLoading ? (
        <div
          className={cn(
            'h-12 rounded-xl border border-border bg-[hsl(0_0%_98%)]',
            'animate-pulse',
            icon ? 'pl-9' : '',
          )}
        />
      ) : (
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-item-${activeIndex}` : undefined}
          className={cn(
            'h-12 rounded-xl border-border bg-[hsl(0_0%_98%)]',
            'placeholder:text-muted-foreground/60 focus-visible:ring-primary/30',
            icon ? 'pl-9' : '',
          )}
        />
      )}

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className={cn(
            'absolute z-50 top-full mt-1 w-full',
            'bg-white rounded-xl border border-border/60',
            'shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
            'py-1 max-h-64 overflow-y-auto',
          )}
        >
          {filtered.map((stop, idx) => (
            <li
              key={stop.stopId}
              id={`${listId}-item-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              onPointerDown={(e) => {
                e.preventDefault()
                handleSelect(stop)
              }}
              className={cn(
                'px-3 py-2 text-sm cursor-pointer text-foreground',
                'hover:bg-accent',
                idx === activeIndex && 'bg-accent',
              )}
            >
              {stop.stopName}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
