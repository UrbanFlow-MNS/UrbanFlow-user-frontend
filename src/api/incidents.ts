import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Incident {
  id: number
  code: string
  name: string
  title: string
  description: string
  estimateDuration?: number
  status: IncidentStatus
  priority: IncidentPriority
  createdAt: string
  updatedAt: string
  resolutionDate: string | null
  siteId?: number
  categoryId?: number
  createdBy?: number
  affectedRouteIds?: number[]
  category?: { id: number; name: string; isActive: boolean }
  site?: { id: number; name: string; city: string; [key: string]: unknown }
  [key: string]: unknown
}

async function fetchIncidents(): Promise<Incident[]> {
  return apiClient<Incident[]>('/api/incidents')
}

export function useIncidents(): UseQueryResult<Incident[], Error> {
  return useQuery<Incident[], Error>({
    queryKey: ['incidents'],
    staleTime: 60_000,
    queryFn: fetchIncidents,
  })
}
