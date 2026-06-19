import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, MapPin, Navigation, Route, Clock, AlertTriangle, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/Header'
import { StopAutocomplete } from '@/components/StopAutocomplete'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { Stop } from '@/api/stops'

interface QuickCardProps {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
}

function QuickCard({ icon, label, description, onClick }: QuickCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group text-left bg-white rounded-2xl px-5 py-4',
        'border border-border/60',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
        'hover:-translate-y-0.5 transition-all duration-150',
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{label}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </button>
  )
}

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [fromStop, setFromStop] = useState<Stop | null>(null)
  const [toStop, setToStop] = useState<Stop | null>(null)
  const [time, setTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })

  function handleFromChange(name: string) {
    setFrom(name)
    setFromStop(null)
  }

  function handleToChange(name: string) {
    setTo(name)
    setToStop(null)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const [h, m] = time.split(':').map(Number)
    const departureTimeSeconds = h * 3600 + m * 60
    const params = new URLSearchParams({ from, to, departureTimeSeconds: String(departureTimeSeconds) })
    if (fromStop && toStop) {
      params.set('startLat', String(fromStop.stopLat))
      params.set('startLong', String(fromStop.stopLong))
      params.set('endLat', String(toStop.stopLat))
      params.set('endLong', String(toStop.stopLong))
    }
    navigate(`/plan?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[hsl(0_0%_97%)]">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <section className="pt-10 sm:pt-16 pb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-center">
            {t('home.hero_title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center mt-2 max-w-md mx-auto">
            {t('home.hero_subtitle')}
          </p>

          <form
            onSubmit={handleSearch}
            className={cn(
              'mt-8 bg-white rounded-2xl p-4 sm:p-5 max-w-2xl mx-auto',
              'shadow-[0_8px_32px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]',
              'border border-border/40',
            )}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <StopAutocomplete
                value={from}
                onChange={handleFromChange}
                onSelect={(stop) => {
                  setFrom(stop.stopName)
                  setFromStop(stop)
                }}
                placeholder={t('home.from_placeholder')}
                icon={<MapPin size={16} />}
              />
              <StopAutocomplete
                value={to}
                onChange={handleToChange}
                onSelect={(stop) => {
                  setTo(stop.stopName)
                  setToStop(stop)
                }}
                placeholder={t('home.to_placeholder')}
                icon={<Navigation size={16} />}
              />
            </div>
            <div className="relative mt-3">
              <Clock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
              />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 pl-9 rounded-xl border-border bg-[hsl(0_0%_98%)] focus-visible:ring-primary/30"
              />
            </div>
            <Button
              type="submit"
              disabled={!from || !to}
              className={cn(
                'w-full h-12 mt-3 rounded-xl text-sm font-semibold',
                'bg-primary hover:bg-primary/90 text-primary-foreground',
                'shadow-[0_2px_8px_rgba(105,18,226,0.3)] hover:shadow-[0_4px_12px_rgba(105,18,226,0.35)]',
                'transition-all duration-150',
              )}
            >
              {t('home.search')}
              <ArrowRight size={16} />
            </Button>
          </form>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            {t('home.explore')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickCard
              icon={<Route size={18} />}
              label={t('home.lines_title')}
              description={t('home.lines_description')}
              onClick={() => navigate('/lines')}
            />
            <QuickCard
              icon={<MapPin size={18} />}
              label={t('home.stops_title')}
              description={t('home.stops_description')}
              onClick={() => navigate('/stops')}
            />
            <QuickCard
              icon={<Clock size={18} />}
              label={t('home.calendar_title')}
              description={t('home.calendar_description')}
              onClick={() => navigate('/calendar')}
            />
            <QuickCard
              icon={<AlertTriangle size={18} />}
              label={t('home.incidents_title')}
              description={t('home.incidents_description')}
              onClick={() => navigate('/incidents')}
            />
          </div>
        </section>

        {!isAuthenticated && (
          <section className="mt-8">
            <div
              className={cn(
                'bg-white rounded-2xl px-5 py-4 flex items-center gap-4',
                'border border-border/60',
                'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Heart size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground tracking-tight">
                  {t('home.favorites_title')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('home.favorites_description')}
                </p>
              </div>
              <Button
                onClick={login}
                size="sm"
                variant="outline"
                className="h-9 rounded-xl text-xs font-semibold border-border shrink-0"
              >
                {t('header.sign_in')}
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default HomePage
