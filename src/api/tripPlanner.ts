import { useQuery } from '@tanstack/react-query'
import { apiClient, ApiError, tokenStorage } from '@/lib/apiClient'

export interface FastestRouteParams {
  agencyId: number
  startLat: number
  startLong: number
  endLat: number
  endLong: number
  departureTimeSeconds: number
}

export interface RouteSegment {
  lineName: string
  lineColor?: string
  fromStop: string
  toStop: string
  durationSeconds: number
  departureTimeSeconds: number
  arrivalTimeSeconds: number
}

export interface FastestRouteResult {
  totalDurationSeconds: number
  departureTimeSeconds: number
  arrivalTimeSeconds: number
  segments: RouteSegment[]
}

export class AuthRequiredError extends Error {
  constructor() {
    super('auth_required')
    this.name = 'AuthRequiredError'
  }
}

async function fetchFastestRoute(params: FastestRouteParams): Promise<FastestRouteResult> {
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
    // TODO: typer depuis @bato-urbanflow/urbanflow-models
    return data as unknown as FastestRouteResult
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      throw new AuthRequiredError()
    }
    throw err
  }
}

export function useFastestRoute(params: FastestRouteParams | null) {
  return useQuery<FastestRouteResult, Error>({
    queryKey: ['trip-planner', 'fastest', params],
    queryFn: () => fetchFastestRoute(params as FastestRouteParams),
    enabled: params !== null,
    retry: false,
  })
}
