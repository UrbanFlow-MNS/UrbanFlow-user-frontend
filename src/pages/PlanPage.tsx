import { useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Loader2, MapPin, Navigation, LogIn, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { useFastestRoute, type FastestRouteParams, type RouteSegment } from '@/api/tripPlanner'
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

  // TODO: brancher service de géocodage (Mapbox / OSM Nominatim)
  // TODO: l'agencyId doit venir d'un contexte ville
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
    const now = Math.floor(Date.now() / 1000)
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
  data: {
    totalDurationSeconds: number
    departureTimeSeconds: number
    arrivalTimeSeconds: number
    segments: RouteSegment[]
  }
  lang: FormatLang
}) {
  const { t } = useTranslation()

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
          {formatDuration(data.totalDurationSeconds, lang)}
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            <span className="text-xs uppercase tracking-wider mr-1">
              {t('plan.departure')}
            </span>
            <span className="text-foreground font-medium">
              {formatTime(data.departureTimeSeconds)}
            </span>
          </span>
          <ArrowRight size={14} />
          <span>
            <span className="text-xs uppercase tracking-wider mr-1">
              {t('plan.arrival')}
            </span>
            <span className="text-foreground font-medium">
              {formatTime(data.arrivalTimeSeconds)}
            </span>
          </span>
        </div>
      </div>

      <ol className="space-y-3">
        {data.segments?.map((seg, idx) => (
          <li
            key={idx}
            className={cn(
              'bg-white rounded-2xl p-4 sm:p-5',
              'border border-border/60',
              'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            )}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-lg text-xs font-bold',
                  !seg.lineColor && 'bg-primary text-primary-foreground',
                )}
                style={
                  seg.lineColor
                    ? { backgroundColor: seg.lineColor, color: '#fff' }
                    : undefined
                }
              >
                {seg.lineName}
              </span>
              <span className="text-sm font-medium text-foreground truncate">
                {seg.fromStop}
              </span>
              <ArrowRight size={14} className="text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">
                {seg.toStop}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(seg.durationSeconds, lang)}
              </span>
              <span>
                {formatTime(seg.departureTimeSeconds)} → {formatTime(seg.arrivalTimeSeconds)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default PlanPage
