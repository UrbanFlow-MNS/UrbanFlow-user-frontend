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
