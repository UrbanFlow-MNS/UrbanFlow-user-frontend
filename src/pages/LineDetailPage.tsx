import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Route } from 'lucide-react'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { useRouteDetail, type RouteStop } from '@/api/routes'
import { formatTime, formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-16 rounded-lg bg-accent" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-accent rounded w-3/4" />
          <div className="h-3 bg-accent rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}

interface FitBoundsProps {
  stops: RouteStop[]
}

function FitBounds({ stops }: FitBoundsProps) {
  const map = useMap()
  useEffect(() => {
    const bounds = L.latLngBounds(stops.map((s) => [s.latitude, s.longitude]))
    map.fitBounds(bounds, { padding: [32, 32] })
  }, [])
  return null
}

interface PanToStopProps {
  stops: RouteStop[]
  selectedStopId: number | null
}

function PanToStop({ stops, selectedStopId }: PanToStopProps) {
  const map = useMap()
  useEffect(() => {
    if (selectedStopId == null) return
    const stop = stops.find((s) => s.stopId === selectedStopId)
    if (stop) map.setView([stop.latitude, stop.longitude], 16, { animate: true })
  }, [selectedStopId, stops, map])
  return null
}

interface StopsListProps {
  stops: RouteStop[]
  selectedStopId: number | null
  onSelectStop: (id: number) => void
}

function StopsList({ stops, selectedStopId, onSelectStop }: StopsListProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <ol className="relative">
        {stops.map((stop, idx) => {
          const isEndpoint = idx === 0 || idx === stops.length - 1
          const isLast = idx === stops.length - 1
          const isSelected = stop.stopId === selectedStopId
          return (
            <li
              key={stop.stopId}
              className="flex items-stretch gap-3 cursor-pointer"
              onClick={() => onSelectStop(stop.stopId)}
            >
              <div className="w-14 shrink-0 pt-0.5 text-xs font-medium text-foreground tabular-nums text-right">
                {formatTime(stop.arrivalTime)}
              </div>
              <div className="relative flex flex-col items-center">
                <span
                  className={cn(
                    'mt-1 h-3 w-3 rounded-full border-2 border-primary transition-transform',
                    isEndpoint ? 'bg-primary' : 'bg-white',
                    isSelected && 'scale-125',
                  )}
                />
                {!isLast && <span className="flex-1 w-0.5 bg-primary/40 my-0.5" />}
              </div>
              <div
                className={cn(
                  'flex-1 pb-3 text-sm text-foreground',
                  isSelected && 'bg-accent/50 rounded-lg px-1',
                )}
              >
                {stop.stopName}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

interface StopsMapProps {
  stops: RouteStop[]
  selectedStopId: number | null
  onSelectStop: (id: number) => void
}

function StopsMap({ stops, selectedStopId, onSelectStop }: StopsMapProps) {
  const avgLat = stops.reduce((sum, s) => sum + s.latitude, 0) / stops.length
  const avgLng = stops.reduce((sum, s) => sum + s.longitude, 0) / stops.length
  const [roadPositions, setRoadPositions] = useState<[number, number][]>([])
  const markerRefs = useRef<Record<number, L.Marker>>({})

  useEffect(() => {
    if (stops.length < 2) return
    const coords = stops.map((s) => `${s.longitude},${s.latitude}`).join(';')
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
    )
      .then((r) => r.json())
      .then((data) => {
        const coordinates: [number, number][] = data.routes?.[0]?.geometry?.coordinates?.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
        ) ?? []
        setRoadPositions(coordinates)
      })
      .catch(() => {
        setRoadPositions(stops.map((s): [number, number] => [s.latitude, s.longitude]))
      })
  }, [stops])

  useEffect(() => {
    if (selectedStopId == null) return
    const marker = markerRefs.current[selectedStopId]
    marker?.openPopup()
  }, [selectedStopId])

  const fallback = stops.map((s): [number, number] => [s.latitude, s.longitude])

  return (
    <div className="overflow-hidden rounded-2xl">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={13}
        style={{ height: '500px', borderRadius: '1rem' }}
        className="border border-border/60"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <FitBounds stops={stops} />
        <PanToStop stops={stops} selectedStopId={selectedStopId} />
        <Polyline
          positions={roadPositions.length > 0 ? roadPositions : fallback}
          pathOptions={{ color: '#6912e2', weight: 4, opacity: 0.8 }}
        />
        {stops.map((stop) => (
          <Marker
            key={stop.stopId}
            position={[stop.latitude, stop.longitude]}
            ref={(ref) => { if (ref) markerRefs.current[stop.stopId] = ref }}
            eventHandlers={{ click: () => onSelectStop(stop.stopId) }}
          >
            <Popup>{stop.stopName}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

function LineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [view, setView] = useState<'list' | 'map'>('list')
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)

  const { data, isLoading, isError } = useRouteDetail(id)

  const route = data?.[0]
  const stops = route
    ? [...route.trips[0].stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    : []

  function handleSelectStop(id: number) {
    setSelectedStopId(id)
    setView('map')
  }

  const firstStop = stops[0]
  const lastStop = stops[stops.length - 1]

  return (
    <div className="min-h-screen bg-[hsl(0_0%_97%)]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 pt-10 sm:pt-14">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/lines')}
          className="mb-6 -ml-2 h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Retour
        </Button>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
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
            <p className="text-sm font-semibold text-foreground">Une erreur est survenue</p>
            <p className="text-xs text-muted-foreground mt-1">Impossible de charger les détails de la ligne.</p>
          </div>
        )}

        {!isLoading && !isError && !route && (
          <div
            className={cn(
              'bg-white rounded-2xl px-5 py-8 text-center',
              'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
            )}
          >
            <p className="text-sm font-semibold text-foreground">Ligne introuvable</p>
          </div>
        )}

        {!isLoading && !isError && route && (
          <div className="space-y-4">
            <div
              className={cn(
                'bg-white rounded-2xl px-5 py-5',
                'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
                  <Route size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground tracking-tight truncate">
                    {route.routeLongName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {route.routeTypeName}
                  </p>
                  {stops.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {firstStop.stopName} → {lastStop.stopName}
                      {' · '}
                      {stops.length} arrêt{stops.length > 1 ? 's' : ''}
                      {' · '}
                      {formatDuration(lastStop.arrivalTime - firstStop.arrivalTime, 'fr')}
                    </p>
                  )}
                </div>
                <span className="shrink-0 bg-primary text-primary-foreground rounded-lg px-2.5 py-1 text-xs font-bold">
                  {route.routeShortName}
                </span>
              </div>

              {stops.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const params = new URLSearchParams({
                        from: firstStop.stopName,
                        to: lastStop.stopName,
                        startLat: String(firstStop.latitude),
                        startLong: String(firstStop.longitude),
                        endLat: String(lastStop.latitude),
                        endLong: String(lastStop.longitude),
                        departureTimeSeconds: String(Math.round(firstStop.arrivalTime)),
                      })
                      navigate(`/plan?${params.toString()}`)
                    }}
                  >
                    <Route size={14} />
                    Planifier ce trajet
                  </Button>
                </div>
              )}
            </div>

<div className="flex gap-2">
              <button
                onClick={() => setView('list')}
                className={cn(
                  'flex-1 h-10 rounded-xl text-sm font-semibold transition-colors',
                  view === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-muted-foreground border border-border',
                )}
              >
                Liste
              </button>
              <button
                onClick={() => setView('map')}
                className={cn(
                  'flex-1 h-10 rounded-xl text-sm font-semibold transition-colors',
                  view === 'map'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-muted-foreground border border-border',
                )}
              >
                Carte
              </button>
            </div>

            {view === 'list' && (
              <StopsList
                stops={stops}
                selectedStopId={selectedStopId}
                onSelectStop={handleSelectStop}
              />
            )}
            {view === 'map' && stops.length > 0 && (
              <StopsMap
                stops={stops}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default LineDetailPage
