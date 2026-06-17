import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Route, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/Header'
import { useRoutes, type Route as TransportRoute } from '@/api/routes'
import { cn } from '@/lib/utils'

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

      <ChevronRight
        size={16}
        className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0"
      />
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

function LinesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useRoutes()

  const displayName = (r: TransportRoute) =>
    r.routeName ?? r.routeLongName ?? r.routeShortName ?? r.routeTypeName ?? ''

  const filtered = (data ?? []).filter((r) =>
    displayName(r).toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[hsl(0_0%_97%)]">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <section className="pt-10 sm:pt-14 pb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            {t('lines.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('lines.subtitle')}</p>

          <div className="relative mt-6">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('lines.search_placeholder')}
              className="h-11 pl-9 rounded-xl border-border bg-white placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
            />
          </div>
        </section>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div
            className={cn(
              'bg-white rounded-2xl px-5 py-8 text-center',
              'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            )}
          >
            <p className="text-sm font-semibold text-foreground">{t('lines.error_title')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('lines.error_subtitle')}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 text-xs font-semibold text-primary hover:underline"
            >
              {t('lines.error_retry')}
            </button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div
            className={cn(
              'bg-white rounded-2xl px-5 py-8 text-center',
              'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            )}
          >
            <p className="text-sm font-semibold text-foreground">{t('lines.empty_title')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('lines.empty_subtitle')}</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((route) => (
              <LineCard
                key={route.routeId}
                route={route}
                onClick={() => navigate(`/lines/${route.routeId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default LinesPage
