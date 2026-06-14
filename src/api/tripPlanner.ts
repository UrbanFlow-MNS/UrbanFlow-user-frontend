import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { apiClient, ApiError, tokenStorage } from '@/lib/apiClient'

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
