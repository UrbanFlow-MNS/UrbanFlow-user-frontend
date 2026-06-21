import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface Route {
  routeId: string | number
  agencyId?: number
  routeName?: string
  routeShortName?: string
  routeLongName?: string
  routeColor?: string
  routeTypeName?: string
  [key: string]: unknown
}

export interface RouteStop {
  stopId: number
  stopName: string
  longitude: number
  latitude: number
  arrivalTime: number
  sequenceOrder: number
}

export interface RouteDetail {
  routeId: number
  routeShortName: string
  routeLongName: string
  routeTypeName: string
  trips: {
    tripId: number
    stops: RouteStop[]
  }[]
}

async function fetchRoutes(): Promise<Route[]> {
  const data = await apiClient<Route[]>('/api/routes/all')
  console.log('[routes] full first item:', JSON.stringify(data?.[0], null, 2))
  return data
}

export function useRoutes(): UseQueryResult<Route[], Error> {
  return useQuery<Route[], Error>({
    queryKey: ['routes'],
    staleTime: 5 * 60 * 1000,
    queryFn: fetchRoutes,
  })
}

async function fetchRouteDetail(id: string): Promise<RouteDetail[]> {
  return apiClient<RouteDetail[]>(`/api/routes/getDetails/${id}`)
}

export function useRouteDetail(id: string | undefined): UseQueryResult<RouteDetail[], Error> {
  return useQuery<RouteDetail[], Error>({
    queryKey: ['route-detail', id],
    queryFn: () => fetchRouteDetail(id!),
    enabled: id !== undefined,
    staleTime: 5 * 60 * 1000,
  })
}
