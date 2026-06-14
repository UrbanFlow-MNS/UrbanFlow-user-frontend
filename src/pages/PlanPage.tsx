import { useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Loader2, MapPin, Navigation, LogIn, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import {
  useFastestRoute,
  type FastestRouteParams,
  type FastestRouteResponse,
  type PlannerLeg,
} from '@/api/tripPlanner'
import { formatDuration, formatTime, type FormatLang } from '@/lib/format'
import { cn } from '@/lib/utils'

function parseNumberParam(value: string | null): number | null {
  if (value === null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function PlanPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()

  const lang: FormatLang = i18n.language?.startsWith('en') ? 'en' : 'fr'

  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  const startLat = parseNumberParam(searchParams.get('startLat'))
  const startLong = parseNumberParam(searchParams.get('startLong'))
  const endLat = parseNumberParam(searchParams.get('endLat'))
  const endLong = parseNumberParam(searchParams.get('endLong'))
  const departureTimeSeconds =
    parseNumberParam(searchParams.get('departureTimeSeconds')) ??
    Math.floor(Date.now() / 1000)

  const params = useMemo<FastestRouteParams | null>(() => {
    if (
      startLat === null ||
      startLong === null ||
      endLat === null ||
      endLong === null
    ) {
      return null
    }
    return {
      agencyId: 1,
      startLat,
      startLong,
      endLat,
      endLong,
      departureTimeSeconds,
    }
  }, [startLat, startLong, endLat, endLong, departureTimeSeconds])

  const noQuery = !from && !to && params === null
  const needsGeocoding = !!(from || to) && params === null

  const query = useFastestRoute(params)

  const handleTryDemo = () => {
    const now = 21600
    const next = new URLSearchParams(searchParams)
    next.set('startLat', '49.1193')
    next.set('startLong', '6.1757')
    next.set('endLat', '49.1058')
    next.set('endLong', '6.1779')
    next.set('departureTimeSeconds', String(now))
    navigate(`/plan?${next.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[hsl(0_0%_97%)]">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 pt-8 sm:pt-12">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          {t('plan.title')}
        </h1>

        <div
          className={cn(
            'mt-6 bg-white rounded-2xl p-4 sm:p-5',
            'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            'border border-border/60',
            'flex items-center gap-4',
          )}
        >
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin size={14} className="text-muted-foreground shrink-0" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('plan.from')}
              </span>
              <span className="font-medium truncate">{from || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Navigation size={14} className="text-muted-foreground shrink-0" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('plan.to')}
              </span>
              <span className="font-medium truncate">{to || '—'}</span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/')}
            size="sm"
            variant="outline"
            className="h-9 rounded-xl text-xs font-semibold border-border shrink-0"
          >
            {t('plan.edit')}
          </Button>
        </div>

        <div className="mt-6">
          {noQuery && <EmptyState />}

          {needsGeocoding && <GeocodingPendingState onTryDemo={handleTryDemo} />}

          {params !== null && query.isLoading && <LoadingState />}

          {params !== null && query.isError && query.error?.message === 'auth_required' && (
            <AuthRequiredState onLogin={login} />
          )}

          {params !== null &&
            query.isError &&
            query.error?.message !== 'auth_required' && (
              <ErrorState onRetry={() => query.refetch()} />
            )}

          {params !== null && query.isSuccess && query.data && (
            <RouteResult data={query.data} lang={lang} />
          )}
        </div>
      </main>
    </div>
  )
}

function StateCard({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl px-5 py-6 flex flex-col items-center text-center gap-3',
        'border border-border/60',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-foreground tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground max-w-sm">{subtitle}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <StateCard
      icon={<MapPin size={20} />}
      title={t('plan.empty_title')}
      subtitle={t('plan.empty_subtitle')}
      action={
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          {t('not_found.back_home')}
          <ArrowRight size={14} />
        </Link>
      }
    />
  )
}

function LoadingState() {
  const { t } = useTranslation()
  return (
    <StateCard
      icon={<Loader2 size={20} className="animate-spin" />}
      title={t('plan.loading')}
    />
  )
}

function AuthRequiredState({ onLogin }: { onLogin: () => void }) {
  const { t } = useTranslation()
  return (
    <StateCard
      icon={<LogIn size={20} />}
      title={t('plan.auth_required_title')}
      subtitle={t('plan.auth_required_subtitle')}
      action={
        <Button
          onClick={onLogin}
          className={cn(
            'h-10 rounded-xl text-sm font-semibold px-4',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'shadow-[0_2px_8px_rgba(105,18,226,0.3)]',
          )}
        >
          <LogIn size={14} />
          {t('header.sign_in')}
        </Button>
      }
    />
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <StateCard
      icon={<AlertCircle size={20} />}
      title={t('plan.error_title')}
      action={
        <Button
          onClick={onRetry}
          variant="outline"
          className="h-10 rounded-xl text-sm font-semibold border-border"
        >
          {t('plan.error_retry')}
        </Button>
      }
    />
  )
}

function GeocodingPendingState({ onTryDemo }: { onTryDemo: () => void }) {
  const { t } = useTranslation()
  return (
    <StateCard
      icon={<MapPin size={20} />}
      title={t('plan.geocoding_pending_title')}
      subtitle={t('plan.geocoding_pending_subtitle')}
      action={
        <Button
          onClick={onTryDemo}
          className={cn(
            'h-10 rounded-xl text-sm font-semibold px-4',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'shadow-[0_2px_8px_rgba(105,18,226,0.3)]',
          )}
        >
          {t('plan.geocoding_try_demo')}
        </Button>
      }
    />
  )
}

function RouteResult({
  data,
  lang,
}: {
  data: FastestRouteResponse
  lang: FormatLang
}) {
  const { t } = useTranslation()

  if (data.length === 0) {
    return <NoRouteState />
  }

  const firstLeg = data[0]
  const lastLeg = data[data.length - 1]
  const firstStop = firstLeg.trip.stops[0]
  const lastStop = lastLeg.trip.stops[lastLeg.trip.stops.length - 1]
  const totalDuration = lastStop.arrivalTime - firstStop.arrivalTime

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'bg-white rounded-2xl p-5',
          'border border-border/60',
          'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        )}
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Clock size={14} />
          {t('plan.duration_total')}
        </div>
        <div className="mt-2 text-2xl font-semibold text-foreground tracking-tight">
          {formatDuration(totalDuration, lang)}
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            <span className="text-xs uppercase tracking-wider mr-1">
              {t('plan.departure')}
            </span>
            <span className="text-foreground font-medium">
              {formatTime(firstStop.arrivalTime)}
            </span>
          </span>
          <ArrowRight size={14} />
          <span>
            <span className="text-xs uppercase tracking-wider mr-1">
              {t('plan.arrival')}
            </span>
            <span className="text-foreground font-medium">
              {formatTime(lastStop.arrivalTime)}
            </span>
          </span>
        </div>
      </div>

      <ol className="space-y-3">
        {data.map((leg, idx) => (
          <LegCard key={idx} leg={leg} lang={lang} />
        ))}
      </ol>
    </div>
  )
}

function LegCard({ leg, lang }: { leg: PlannerLeg; lang: FormatLang }) {
  const { t } = useTranslation()
  const stops = leg.trip.stops
  const firstStop = stops[0]
  const lastStop = stops[stops.length - 1]
  const legDuration = lastStop.arrivalTime - firstStop.arrivalTime

  return (
    <li
      className={cn(
        'bg-white rounded-2xl p-4 sm:p-5',
        'border border-border/60',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
      )}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="bg-primary text-primary-foreground rounded-lg px-2 py-1 text-xs font-semibold">
          Ligne {leg.routeId}
        </span>
      </div>

      <ol className="mt-4 relative">
        {stops.map((stop, idx) => {
          const isEndpoint = idx === 0 || idx === stops.length - 1
          const isLast = idx === stops.length - 1
          return (
            <li key={stop.stopId} className="flex items-stretch gap-3">
              <div className="w-14 shrink-0 pt-0.5 text-xs font-medium text-foreground tabular-nums text-right">
                {formatTime(stop.arrivalTime)}
              </div>
              <div className="relative flex flex-col items-center">
                <span
                  className={cn(
                    'mt-1 h-3 w-3 rounded-full border-2 border-primary',
                    isEndpoint ? 'bg-primary' : 'bg-white',
                  )}
                />
                {!isLast && <span className="flex-1 w-0.5 bg-primary/40 my-0.5" />}
              </div>
              <div className="flex-1 pb-3 text-sm text-foreground">
                {stop.stopName}
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
        <Clock size={12} />
        <span className="uppercase tracking-wider">{t('plan.leg_duration')}</span>
        <span className="text-foreground font-medium">
          {formatDuration(legDuration, lang)}
        </span>
      </div>
    </li>
  )
}

function NoRouteState() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <StateCard
      icon={<AlertCircle size={20} />}
      title={t('plan.no_route_title')}
      subtitle={t('plan.no_route_subtitle')}
      action={
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="h-10 rounded-xl text-sm font-semibold border-border"
        >
          {t('plan.error_retry')}
        </Button>
      }
    />
  )
}

export default PlanPage
