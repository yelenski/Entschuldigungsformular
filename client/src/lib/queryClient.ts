import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
  data?: unknown | undefined,
): Promise<Response> {
  const apiUrl = ensureApiUrl(url);
  console.log(`Making ${method} request to ${apiUrl}`); // Debug log
  
  const res = await fetch(apiUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "Accept": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include"
  });

  console.log(`Response status: ${res.status}`); // Debug log
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error: ${res.status}`, errorText); // Debug log
    throw new Error(
      errorText || `${res.status}: ${res.statusText}`
    );
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
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
