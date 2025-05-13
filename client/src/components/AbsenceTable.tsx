import { Absence } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle } from "lucide-react";

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
  if (isLoading) {
    return <LoadingState />;
  }

  if (absences.length === 0) {
    return <EmptyState type={type} />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Schüler</TableHead>
            <TableHead>Klasse</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Von</TableHead>
            <TableHead>Bis</TableHead>
            {type === "pending" ? (
              <TableHead>Lehrer</TableHead>
            ) : (
              <TableHead>Status</TableHead>
            )}
            <TableHead>
              {type === "pending" ? "Eingereicht am" : "Verarbeitet am"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {absences.map((absence) => (
            <TableRow
              key={absence.id}
              onClick={() => onAbsenceClick(absence)}
              onContextMenu={(e) => onContextMenu(e, absence)}
              className="hover:bg-gray-light cursor-pointer"
            >
              <TableCell className="font-medium">{absence.studentName}</TableCell>
              <TableCell>{absence.studentClass}</TableCell>
              <TableCell>{absence.absenceType}</TableCell>
              <TableCell>{absence.dateStart}</TableCell>
              <TableCell>{absence.dateEnd}</TableCell>
              {type === "pending" ? (
                <TableCell>{absence.teacherName}</TableCell>
              ) : (
                <TableCell>
                  <StatusBadge status={absence.status} />
                </TableCell>
              )}
              <TableCell>
                {type === "pending" 
                  ? absence.submissionDate 
                  : absence.processedDate}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-success">
        <CheckCircle className="h-3 w-3 mr-1" />
        Erledigt
      </span>
    );
  } else if (status === "rejected") {
    return (
      <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-error">
        <XCircle className="h-3 w-3 mr-1" />
        Abgewiesen
      </span>
    );
  }
  return null;
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
