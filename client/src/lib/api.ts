// client/src/lib/api.ts

export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {

  // Ensure the URL starts with a slash for consistency
  const BASE_URL = import.meta.env.VITE_API_URL;
  const apiUrl = BASE_URL + (url.startsWith('/') ? url : '/' + url);

  const res = await fetch(apiUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "Accept": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors"
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error: ${res.status}`, errorText);
    throw new Error(errorText || `${res.status}: ${res.statusText}`);
  }

  return res;
}