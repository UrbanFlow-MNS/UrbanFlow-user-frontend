import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, AlertTriangle, AlertCircle, MapPin, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/Header'
import { useIncidents, type Incident, type IncidentPriority, type IncidentStatus } from '@/api/incidents'
import { cn } from '@/lib/utils'

const CARD = 'bg-white rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
const ACTIVE_STATUSES: IncidentStatus[] = ['OPEN', 'IN_PROGRESS']
const PRIORITY_WEIGHT: Record<IncidentPriority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

const PRIORITY_BADGE: Record<IncidentPriority, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-gray-100 text-gray-600',
}

const STATUS_BADGE: Record<IncidentStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', className)}>{children}</span>
}

function IncidentCard({ incident }: { incident: Incident }) {
  const { t } = useTranslation()
  const Icon = incident.priority === 'URGENT' || incident.priority === 'HIGH' ? AlertTriangle : AlertCircle

  return (
    <div className={cn(CARD, 'flex items-start gap-4 px-5 py-4')}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground tracking-tight truncate">{incident.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {incident.code}
          {incident.category?.name ? ` · ${incident.category.name}` : ''}
        </p>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{incident.description}</p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge className={STATUS_BADGE[incident.status]}>{t(`incidents.status.${incident.status}`)}</Badge>
          <Badge className={PRIORITY_BADGE[incident.priority]}>{t(`incidents.priority.${incident.priority}`)}</Badge>
        </div>

        {(incident.site?.name || incident.estimateDuration != null) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
            {incident.site?.name && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {incident.site.name}
              </span>
            )}
            {incident.estimateDuration != null && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {t('incidents.duration_estimate', { minutes: incident.estimateDuration })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className={cn(CARD, 'flex items-start gap-4 px-5 py-4 animate-pulse')}>
      <div className="h-10 w-10 rounded-xl bg-accent shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-accent rounded w-2/3" />
        <div className="h-3 bg-accent rounded w-1/3" />
        <div className="h-3 bg-accent rounded w-full" />
      </div>
    </div>
  )
}

function Message({ title, subtitle, onRetry }: { title: string; subtitle: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <div className={cn(CARD, 'px-5 py-8 text-center')}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 text-xs font-semibold text-primary hover:underline">
          {t('incidents.error_retry')}
        </button>
      )}
    </div>
  )
}

function search(incident: Incident, query: string): boolean {
  const q = query.toLowerCase()
  return (
    incident.title.toLowerCase().includes(q) ||
    incident.code.toLowerCase().includes(q) ||
    (incident.site?.name ?? '').toLowerCase().includes(q)
  )
}

function IncidentsPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const { data, isLoading, isError, refetch } = useIncidents()

  const active = (data ?? []).filter((i) => ACTIVE_STATUSES.includes(i.status))
  const filtered = active
    .filter((i) => search(i, query))
    .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || +new Date(b.createdAt) - +new Date(a.createdAt))

  const message = isError
    ? { title: t('incidents.error_title'), subtitle: t('incidents.error_subtitle'), onRetry: () => refetch() }
    : !active.length
      ? { title: t('incidents.empty_title'), subtitle: t('incidents.empty_subtitle') }
      : !filtered.length
        ? { title: t('incidents.no_results_title'), subtitle: t('incidents.no_results_subtitle') }
        : null

  return (
    <div className="min-h-screen bg-[hsl(0_0%_97%)]">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <section className="pt-10 sm:pt-14 pb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">{t('incidents.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('incidents.subtitle')}</p>

          <div className="relative mt-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('incidents.search_placeholder')}
              className="h-11 pl-9 rounded-xl border-border bg-white placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
            />
          </div>
        </section>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : message ? (
          <Message {...message} />
        ) : (
          <div className="space-y-3">
            {filtered.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default IncidentsPage
