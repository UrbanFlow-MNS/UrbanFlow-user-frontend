import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface Stop {
    stopId: number;
    stopName: string;
    stopLat: number;
    stopLong: number;
}

async function fetchAllStops(): Promise<Stop[]> {
    const data = await apiClient<Stop[]>("/api/stops/all");
    if (data?.length) {
        console.log("[stops] first item:", JSON.stringify(data[0]));
    }
    return data;
}

export function useStops(): UseQueryResult<Stop[], Error> {
    return useQuery<Stop[], Error>({
        queryKey: ["stops", "all"],
        queryFn: fetchAllStops,
        staleTime: 10 * 60 * 1000,
    });
}
