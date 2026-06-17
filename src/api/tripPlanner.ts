import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { apiClient, ApiError, tokenStorage } from '@/lib/apiClient'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

export interface GeocoordPair {
  lat: number
  lon: number
}

async function fetchGeocode(address: string): Promise<GeocoordPair | null> {
  const search = new URLSearchParams({ q: address, format: 'json', limit: '1' })
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${search.toString()}`,
    { headers: { 'Accept-Language': 'fr', 'User-Agent': 'UrbanFlow/1.0' } },
  )
  if (!res.ok) return null
  const data: NominatimResult[] = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}

export interface GeocodeParams {
  from: string
  to: string
}

export interface GeocodeResult {
  start: GeocoordPair
  end: GeocoordPair
}

async function fetchGeocodeRoute(params: GeocodeParams): Promise<GeocodeResult> {
  const [start, end] = await Promise.all([
    fetchGeocode(params.from),
    fetchGeocode(params.to),
  ])
  if (!start || !end) {
    throw new Error('geocoding_failed')
  }
  return { start, end }
}

export function useGeocodeRoute(
  params: GeocodeParams | null,
): UseQueryResult<GeocodeResult, Error> {
  return useQuery<GeocodeResult, Error>({
    queryKey: ['geocode', params?.from, params?.to],
    queryFn: () => fetchGeocodeRoute(params as GeocodeParams),
    enabled: params !== null && params.from.length > 0 && params.to.length > 0,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export interface FastestRouteParams {
  agencyId: number
  startLat: number
  startLong: number
  endLat: number
  endLong: number
  departureTimeSeconds: number
}

export interface PlannerStop {
  stopId: number
  stopName: string
  longitude: number
  latitude: number
  arrivalTime: number
  sequenceOrder: number
}

export interface PlannerTrip {
  tripId: number
  stops: PlannerStop[]
}

export interface PlannerLeg {
  routeId: number
  trip: PlannerTrip
}

export type FastestRouteResponse = PlannerLeg[]

export class AuthRequiredError extends Error {
  constructor() {
    super('auth_required')
    this.name = 'AuthRequiredError'
  }
}

async function fetchFastestRoute(params: FastestRouteParams): Promise<FastestRouteResponse> {
  const token = tokenStorage.get()
  if (!token) {
    throw new AuthRequiredError()
  }

  const search = new URLSearchParams({
    agencyId: String(params.agencyId),
    startLat: String(params.startLat),
    startLong: String(params.startLong),
    endLat: String(params.endLat),
    endLong: String(params.endLong),
    departureTimeSeconds: String(params.departureTimeSeconds),
  })

  try {
    const data = await apiClient<unknown>(`/api/trip-planner/fastest?${search.toString()}`)
    return data as FastestRouteResponse
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      throw new AuthRequiredError()
    }
    throw err
  }
}

export function useFastestRoute(
  params: FastestRouteParams | null,
): UseQueryResult<FastestRouteResponse, Error> {
  return useQuery<FastestRouteResponse, Error>({
    queryKey: ['trip-planner', 'fastest', params],
    queryFn: () => fetchFastestRoute(params as FastestRouteParams),
    enabled: params !== null,
    retry: false,
  })
}
