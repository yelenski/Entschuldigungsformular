import { QueryClient, QueryFunction } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_API_URL;

type UnauthorizedBehavior = "returnNull" | "throw";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Ensure URL starts with /api
function ensureApiUrl(url: string): string {
  if (!url.startsWith('/api')) {
    return `/api${url.startsWith('/') ? url : `/${url}`}`;
  }
  return url;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const apiUrl = BASE_URL + ensureApiUrl(url);

  const res = await fetch(apiUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `${res.status}: ${res.statusText}`);
  }

  return res;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const relativeUrl = queryKey[0] as string;
    const apiUrl = BASE_URL + ensureApiUrl(relativeUrl);

    const res = await fetch(apiUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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