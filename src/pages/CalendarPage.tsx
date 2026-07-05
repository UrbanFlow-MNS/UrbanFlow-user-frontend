import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Route, ChevronLeft, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/Header'
import { useRoutes, useRouteDetail, type Route as TransportRoute, type RouteStop, type RouteDetail } from '@/api/routes'
import { formatTime, formatDuration, type FormatLang } from '@/lib/format'
import { cn } from '@/lib/utils'

function cleanRouteName(name: string): string {
  return name.replace(/\s*\[.*?\]/g, '').trim()
}

function LineCard({ route, onClick }: { route: TransportRoute; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left bg-white rounded-2xl px-5 py-4',
        'border border-border/60',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
        'hover:-translate-y-0.5 transition-all duration-150',
        'flex items-center gap-4',
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold"
        style={route.routeColor ? { backgroundColor: `#${route.routeColor}` } : undefined}
      >
        {!route.routeColor && (
          <span className="text-primary">
            <Route size={18} />
          </span>
        )}
        {route.routeColor && (route.routeShortName ?? String(route.routeId))}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground tracking-tight truncate">
          {route.routeName ?? route.routeLongName ?? route.routeShortName}
        </p>
        {route.routeTypeName && (
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{route.routeTypeName}</p>
        )}
      </div>
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-accent shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-accent rounded w-2/3" />
        <div className="h-3 bg-accent rounded w-1/3" />
      </div>
    </div>
  )
}

function TripSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-pulse">
      <div className="flex items-center">
        <div className="h-6 bg-accent rounded w-16" />
        <div className="flex-1 mx-3 border-t border-dashed border-accent mt-1" />
        <div className="h-6 bg-accent rounded w-16" />
      </div>
      <div className="mt-2 flex justify-center">
        <div className="h-3 bg-accent rounded w-32" />
      </div>
    </div>
  )
}

interface TripCardProps {
  stops: RouteStop[]
  lang: FormatLang
}

function TripCard({ stops, lang }: TripCardProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const firstStop = stops[0]
  const lastStop = stops[stops.length - 1]
  const duration = lastStop.arrivalTime - firstStop.arrivalTime

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full px-5 py-4 text-left"
      >
        <div className="flex items-center">
          <span className="text-lg font-bold text-foreground tabular-nums">{formatTime(firstStop.arrivalTime)}</span>
          <div className="flex-1 border-t border-dashed border-border mx-3 mt-1" />
          <span className="text-lg font-bold text-foreground tabular-nums">{formatTime(lastStop.arrivalTime)}</span>
          <ChevronDown
            size={16}
            className={cn('ml-3 text-muted-foreground/60 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center">
          {formatDuration(duration, lang)}{' · '}{t('calendar.stops_count', { count: stops.length })}
        </p>
      </button>

      {isOpen && (
        <div className="px-5 pb-4 border-t border-border/40">
          <div className="mt-3">
            {stops.map((stop, i) => {
              const isFirst = i === 0
              const isLast = i === stops.length - 1
              return (
                <div key={stop.stopId} className="flex items-start gap-3 relative">
                  {!isLast && (
                    <div className="absolute left-[5px] top-3 w-0.5 h-full bg-border/50" />
                  )}
                  <div
                    className={cn(
                      'relative z-10 mt-1 w-3 h-3 rounded-full shrink-0 border-2',
                      isFirst || isLast ? 'bg-primary border-primary' : 'bg-white border-border',
                    )}
                  />
                  <div className="flex items-baseline justify-between w-full pb-3 min-w-0">
                    <span
                      className={cn(
                        'text-xs truncate',
                        isFirst || isLast ? 'font-semibold text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {stop.stopName}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0 tabular-nums">
                      {formatTime(stop.arrivalTime)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarPage() {
  const { t, i18n } = useTranslation()
  const lang: FormatLang = i18n.language.startsWith('fr') ? 'fr' : 'en'
  const [search, setSearch] = useState('')
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null)

  const { data: routesData, isLoading: routesLoading, isError: routesError, refetch: routesRefetch } = useRoutes()
  const { data: detailData, isLoading: detailLoading, isError: detailError, refetch: detailRefetch } = useRouteDetail(
    selectedRoute ? String(selectedRoute.routeId) : undefined,
  )

  const displayName = (r: TransportRoute) =>
    r.routeName ?? r.routeLongName ?? r.routeShortName ?? r.routeTypeName ?? ''

  const filtered = (routesData ?? []).filter((r) =>
    displayName(r).toLowerCase().includes(search.toLowerCase()),
  )

  const groups = (detailData ?? [])
    .map((rd) => {
      const sorted = rd.trips
        .filter((trip) => trip.stops.length >= 2)
        .sort((a, b) => {
          const af = [...a.stops].sort((x, y) => x.sequenceOrder - y.sequenceOrder)[0]
          const bf = [...b.stops].sort((x, y) => x.sequenceOrder - y.sequenceOrder)[0]
          return af.arrivalTime - bf.arrivalTime
        })
      if (sorted.length === 0) return null
      const firstTrip = sorted[0]
      const stops = [...firstTrip.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder)
      const direction = `${stops[0].stopName} → ${stops[stops.length - 1].stopName}`
      return { direction, trips: sorted }
    })
    .filter((g): g is { direction: string; trips: RouteDetail['trips'] } => g !== null)

  const totalTrips = groups.reduce((acc, g) => acc + g.trips.length, 0)

  if (selectedRoute) {
    const rawTitle = selectedRoute.routeLongName ?? selectedRoute.routeShortName ?? String(selectedRoute.routeId)
    const title = cleanRouteName(rawTitle)

    return (
      <div className="min-h-screen bg-[hsl(0_0%_97%)]">
        <Header />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
          <section className="pt-10 sm:pt-14 pb-6">
            <button
              onClick={() => setSelectedRoute(null)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ChevronLeft size={16} />
              {t('calendar.back')}
            </button>

            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              {title}
            </h1>
          </section>

          {detailLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <TripSkeletonCard key={i} />
              ))}
            </div>
          )}

          {detailError && (
            <div
              className={cn(
                'bg-white rounded-2xl px-5 py-8 text-center',
                'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
              )}
            >
              <p className="text-sm font-semibold text-foreground">{t('calendar.trips_error_title')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('calendar.trips_error_subtitle')}</p>
              <button
                onClick={() => detailRefetch()}
                className="mt-4 text-xs font-semibold text-primary hover:underline"
              >
                {t('calendar.trips_error_retry')}
              </button>
            </div>
          )}

          {!detailLoading && !detailError && totalTrips === 0 && (
            <div
              className={cn(
                'bg-white rounded-2xl px-5 py-8 text-center',
                'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
              )}
            >
              <p className="text-sm font-semibold text-foreground">{t('calendar.no_trips')}</p>
            </div>
          )}

          {!detailLoading && !detailError && totalTrips > 0 && (
            <div className="space-y-3">
              {groups.map((group, gi) => (
                <div key={gi}>
                  {groups.length > 1 && (
                    <div className="flex items-center gap-3 pt-2 pb-1">
                      <div className="h-px flex-1 bg-border/40" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 shrink-0">
                        {group.direction}
                      </span>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                  )}
                  <div className="space-y-3">
                    {group.trips.map((trip) => {
                      const stops = [...trip.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                      return <TripCard key={trip.tripId} stops={stops} lang={lang} />
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(0_0%_97%)]">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <section className="pt-10 sm:pt-14 pb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            {t('calendar.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('calendar.subtitle')}</p>

          <div className="relative mt-6">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('calendar.search_placeholder')}
              className="h-11 pl-9 rounded-xl border-border bg-white placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
            />
          </div>
        </section>

        {routesLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {routesError && (
          <div
            className={cn(
              'bg-white rounded-2xl px-5 py-8 text-center',
              'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            )}
          >
            <p className="text-sm font-semibold text-foreground">{t('calendar.error_title')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('calendar.error_subtitle')}</p>
            <button
              onClick={() => routesRefetch()}
              className="mt-4 text-xs font-semibold text-primary hover:underline"
            >
              {t('calendar.error_retry')}
            </button>
          </div>
        )}

        {!routesLoading && !routesError && filtered.length === 0 && (
          <div
            className={cn(
              'bg-white rounded-2xl px-5 py-8 text-center',
              'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            )}
          >
            <p className="text-sm font-semibold text-foreground">{t('calendar.empty_title')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('calendar.empty_subtitle')}</p>
          </div>
        )}

        {!routesLoading && !routesError && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((route) => (
              <LineCard
                key={route.routeId}
                route={route}
                onClick={() => setSelectedRoute(route)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default CalendarPage
