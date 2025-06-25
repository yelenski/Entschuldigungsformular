// client/src/lib/api.ts

// Dummy-API für reines Frontend ohne Backend
export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  // Simuliere eine leere/dummy Antwort
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