import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Hier die URL 
const BASE_URL = import.meta.env.VITE_API_URL;

type UnauthorizedBehavior = "returnNull" | "throw";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Dummy-API für reines Frontend ohne Backend
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  return new Response(JSON.stringify({
    error: 'Kein Backend vorhanden. API-Aufruf wurde abgefangen.',
    method,
    url,
    data
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Dummy-QueryFn für reines Frontend ohne Backend
    return {
      error: 'Kein Backend vorhanden. Query wurde abgefangen.',
      queryKey
    } as any;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});