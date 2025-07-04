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
const testAbsences = [
  {
    "id": 1,
    "studentId": 101,
    "studentName": "Sarah Müller",
    "studentClass": "2A",
    "profession": "Informatiker",
    "phonePrivate": "079 123 45 67",
    "phoneWork": "044 987 65 43",
    "educationType": "BM",
    "teacherId": 1,
    "teacherName": "Frau Weber",
    "teachers": "[\"Frau Weber\", \"Herr Schmidt\"]",
    "absenceType": "Krankheit",
    "dateStart": "2025-05-16",
    "dateEnd": "2025-05-16",
    "reason": "Migräne mit starken Kopfschmerzen",
    "lessonCount": "4",
    "location": "Zürich",
    "submissionDate": "2025-05-16T08:15:00.000Z",
    "parentSignature": true,
    "supervisorSignature": true,
    "status": "under_review",
    "processedDate": "05.06.2025"
  },
  {
    "id": 2,
    "studentId": 102,
    "studentName": "Marco Berger",
    "studentClass": "1B",
    "profession": "Kaufmann",
    "phonePrivate": "078 234 56 78",
    "phoneWork": "043 876 54 32",
    "educationType": "BS",
    "teacherId": 2,
    "teacherName": "Herr Schmidt",
    "teachers": "[\"Herr Schmidt\", \"Frau Weber\"]",
    "absenceType": "Arzttermin",
    "dateStart": "2025-05-15",
    "dateEnd": "2025-05-15",
    "reason": "Zahnarzttermin - Weisheitszahn-OP",
    "lessonCount": "6",
    "location": "Basel",
    "submissionDate": "2025-05-14T16:30:00.000Z",
    "parentSignature": true,
    "supervisorSignature": true,
    "status": "approved",
    "processedDate": "2025-05-15T09:00:00.000Z"
  },
  {
    "id": 3,
    "studentId": 103,
    "studentName": "Nina Suter",
    "studentClass": "3A",
    "profession": "Informatiker",
    "phonePrivate": "076 345 67 89",
    "phoneWork": "041 765 43 21",
    "educationType": "BM",
    "teacherId": 3,
    "teacherName": "Frau Fischer",
    "teachers": "[\"Frau Fischer\", \"Herr Schmidt\"]",
    "absenceType": "Familiäre Gründe",
    "dateStart": "2025-05-14",
    "dateEnd": "2025-05-14",
    "reason": "Beerdigung Grossvater",
    "lessonCount": "8",
    "location": "Bern",
    "submissionDate": "2025-05-13T14:20:00.000Z",
    "parentSignature": true,
    "supervisorSignature": true,
    "status": "approved",
    "processedDate": "2025-05-13T16:45:00.000Z"
  },
  {
    "id": 4,
    "studentId": 104,
    "studentName": "Lukas Weber",
    "studentClass": "2B",
    "profession": "Mechaniker",
    "phonePrivate": "077 456 78 90",
    "phoneWork": "042 654 32 10",
    "educationType": "BS",
    "teacherId": 1,
    "teacherName": "Frau Weber",
    "teachers": "[\"Frau Weber\", \"Herr Meier\"]",
    "absenceType": "Militär",
    "dateStart": "2025-05-20",
    "dateEnd": "2025-05-20",
    "reason": "Rekrutierung",
    "lessonCount": "8",
    "location": "Aarau",
    "submissionDate": "2025-05-15T10:00:00.000Z",
    "parentSignature": true,
    "supervisorSignature": true,
    "status": "approved",
    "processedDate": "05.06.2025"
  },
  {
    "id": 5,
    "studentId": 105,
    "studentName": "Lisa Schmid",
    "studentClass": "1A",
    "profession": "Kaufmann",
    "phonePrivate": "075 567 89 01",
    "phoneWork": "045 543 21 09",
    "educationType": "BM",
    "teacherId": 2,
    "teacherName": "Herr Schmidt",
    "teachers": "[\"Herr Schmidt\"]",
    "absenceType": "Krankheit",
    "dateStart": "2025-05-15",
    "dateEnd": "2025-05-16",
    "reason": "Grippe mit Fieber",
    "lessonCount": "16",
    "location": "Luzern",
    "submissionDate": "2025-05-15T07:30:00.000Z",
    "parentSignature": true,
    "supervisorSignature": true,
    "status": "awaiting_docs",
    "processedDate": "2025-05-15T09:30:00.000Z"
  },
  {
    "id": 6,
    "studentId": 106,
    "studentName": "Jan Keller",
    "studentClass": "3B",
    "profession": "Informatiker",
    "phonePrivate": "079 678 90 12",
    "phoneWork": "044 432 10 98",
    "educationType": "BM",
    "teacherId": 3,
    "teacherName": "Frau Fischer",
    "teachers": "[\"Frau Fischer\", \"Frau Weber\", \"Herr Schmidt\"]",
    "absenceType": "Sonstiges",
    "dateStart": "2025-05-13",
    "dateEnd": "2025-05-13",
    "reason": "Führerprüfung",
    "lessonCount": "4",
    "location": "Zürich",
    "submissionDate": "2025-05-12T16:45:00.000Z",
    "parentSignature": true,
    "supervisorSignature": true,
    "status": "rejected",
    "processedDate": "2025-05-13T08:30:00.000Z"
  },
  {
    "id": 15,
    "studentId": 642,
    "studentName": "David Superman",
    "studentClass": "2A",
    "profession": "Kaufmann",
    "phonePrivate": "079 333 44 55",
    "phoneWork": "056 222 55 66",
    "educationType": "BM",
    "signature": "data:image/png;base64,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",
    "teacherId": 1,
    "teacherName": "Frau Müller",
    "teachers": "[\"Frau Müller\",\"Herr Weber\"]",
    "absenceType": "Krankheit",
    "dateStart": "2025-06-04",
    "dateEnd": "2025-06-04",
    "reason": "Verspätung - Zug ausgefallen",
    "lessonCount": "3",
    "location": "Mägenwil",
    "submissionDate": "2025-06-05T14:30:18.429Z",
    "parentSignature": true,
    "supervisorSignature": true,
    "status": "pending",
    "processedDate": null
  }
];

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  if (url.includes("absences")) {
    if (method === "POST") {
      // Neuen Eintrag hinzufügen (id generieren)
      const now = new Date().toISOString();
      const newAbsence = {
        id: testAbsences.length > 0 ? Math.max(...testAbsences.map(a => a.id)) + 1 : 1,
        submissionDate: (data && (data as any).submissionDate) ? (data as any).submissionDate : now,
        status: (data && (data as any).status) ? (data as any).status : "pending",
        ...data as object
      };
      testAbsences.push(newAbsence);
      return new Response(JSON.stringify(newAbsence), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (method === "PATCH" || method === "PUT") {
      // Eintrag aktualisieren (z.B. Status ändern)
      const { id, ...updateFields } = data as any;
      const idx = testAbsences.findIndex(a => a.id === id);
      if (idx !== -1) {
        // Nur erlaubte Status speichern
        const allowedStatus = [
          "pending", "awaiting_docs", "under_review", "approved", "rejected", "expired"
        ];
        let newStatus = updateFields.status;
        if (newStatus && !allowedStatus.includes(newStatus)) {
          // Ungültiger Status, alten Status beibehalten
          newStatus = testAbsences[idx].status;
        }
        testAbsences[idx] = {
          ...testAbsences[idx],
          ...updateFields,
          ...(newStatus ? { status: newStatus } : {})
        };
        return new Response(JSON.stringify(testAbsences[idx]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Absence not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    // GET: Liste zurückgeben
    return new Response(JSON.stringify(testAbsences), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
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