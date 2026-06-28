import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/Header'
import { useStops, type Stop } from '@/api/stops'
import { cn } from '@/lib/utils'

function StopCard({ stop }: { stop: Stop }) {
  return (
    <div
      className={cn(
        'w-full bg-white rounded-2xl px-5 py-4',
        'border border-border/60',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        'flex items-center gap-4',
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/50">
        <span className="text-primary"><MapPin size={18} /></span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground tracking-tight truncate">{stop.stopName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {stop.stopLat.toFixed(4)}° N · {stop.stopLong.toFixed(4)}° E
        </p>
      </div>
    </div>
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

function StopsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useStops()
  const filtered = (data ?? []).filter((s) => s.stopName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[hsl(0_0%_97%)]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <section className="pt-10 sm:pt-14 pb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">{t('stops.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('stops.subtitle')}</p>
          <div className="relative mt-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('stops.search_placeholder')} className="h-11 pl-9 rounded-xl border-border bg-white placeholder:text-muted-foreground/60 focus-visible:ring-primary/30" />
          </div>
        </section>
        {isLoading && <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>}
        {isError && <div className={cn('bg-white rounded-2xl px-5 py-8 text-center', 'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]')}><p className="text-sm font-semibold text-foreground">{t('stops.error_title')}</p><p className="text-xs text-muted-foreground mt-1">{t('stops.error_subtitle')}</p><button onClick={() => refetch()} className="mt-4 text-xs font-semibold text-primary hover:underline">{t('stops.error_retry')}</button></div>}
        {!isLoading && !isError && filtered.length === 0 && <div className={cn('bg-white rounded-2xl px-5 py-8 text-center', 'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]')}><p className="text-sm font-semibold text-foreground">{t('stops.empty_title')}</p><p className="text-xs text-muted-foreground mt-1">{t('stops.empty_subtitle')}</p></div>}
        {!isLoading && !isError && filtered.length > 0 && <div className="space-y-3">{filtered.map((s) => <StopCard key={s.stopId} stop={s} />)}</div>}
      </main>
    </div>
  )
}

export default StopsPage
