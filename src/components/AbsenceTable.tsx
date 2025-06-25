// Lokale Definition für reines Frontend
interface Absence {
  id: number;
  studentName: string;
  studentClass: string;
  educationType?: string;
  reason?: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  submissionDate: string;
  processedDate?: string;
}
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { useEffect } from "react";

interface AbsenceTableProps {
  absences: Absence[];
  isLoading: boolean;
  onAbsenceClick: (absence: Absence) => void;
  onContextMenu: (e: React.MouseEvent, absence: Absence) => void;
  type: "pending" | "processed";
}

export function AbsenceTable({ 
  absences, 
  isLoading, 
  onAbsenceClick, 
  onContextMenu,
  type
}: AbsenceTableProps) {
  // Add debug logging
  useEffect(() => {
    console.log("AbsenceTable - Current absences:", absences);
  }, [absences]);

  // Defensive: absences immer als Array behandeln
  const safeAbsences = Array.isArray(absences) ? absences : [];

  if (isLoading) {
    return <LoadingState />;
  }

  // Validate absences data
  const validAbsences = safeAbsences.filter(absence => {
    if (!absence.studentClass) {
      console.warn("Found absence without studentClass:", absence);
      return false;
    }
    return true;
  });

  if (validAbsences.length === 0) {
    return <EmptyState type={type} />;
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Schüler</TableHead>
            <TableHead>Klasse</TableHead>
            <TableHead>Schultyp</TableHead>
            <TableHead>Grund</TableHead>
            <TableHead>Von</TableHead>
            <TableHead>Bis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              {type === "pending" ? "Eingereicht am" : "Verarbeitet am"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validAbsences.map((absence) => (
            <TableRow
              key={absence.id}
              onClick={() => onAbsenceClick(absence)}
              onContextMenu={(e) => onContextMenu(e, absence)}
              className="hover:bg-gray-light cursor-pointer"
            >
              <TableCell className="font-medium">{absence.studentName}</TableCell>
              <TableCell>{absence.studentClass}</TableCell>
              <TableCell>{absence.educationType || "-"}</TableCell>
              <TableCell>{absence.reason}</TableCell>
              <TableCell>{formatDate(absence.dateStart)}</TableCell>
              <TableCell>{formatDate(absence.dateEnd)}</TableCell>
              <TableCell>
                <StatusBadge status={absence.status} />
              </TableCell>
              <TableCell>
                {type === "pending" 
                  ? formatDate(absence.submissionDate)
                  : absence.processedDate ? formatDate(absence.processedDate) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 flex flex-col items-center space-y-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
    </div>
  );
}

function EmptyState({ type }: { type: "pending" | "processed" }) {
  return (
    <div className="py-8 px-4 text-center">
      <p className="text-gray-500">
        {type === "pending"
          ? "Keine offenen Entschuldigungen vorhanden."
          : "Keine verarbeiteten Entschuldigungen vorhanden."}
      </p>
    </div>
  );
}
