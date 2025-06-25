// client/src/lib/api.ts

// Dummy-API für reines Frontend ohne Backend
export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  // Für GET auf /api/absences gib ein leeres Array zurück
  if (method === "GET" && url.includes("/api/absences")) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Simuliere eine leere/dummy Antwort für alle anderen Fälle
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