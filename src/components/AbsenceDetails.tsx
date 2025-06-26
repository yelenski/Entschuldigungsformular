import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Absence } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getFormattedDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

interface AbsenceDetailsProps {
  isOpen: boolean;
  absence: Absence | null;
  onClose: () => void;
  onStatusChange: () => void;
}

export function AbsenceDetails({ 
  isOpen, 
  absence, 
  onClose,
  onStatusChange
}: AbsenceDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (absence) {
      console.log("AbsenceDetails - Displaying absence:", absence);
    }
  }, [absence]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: "completed" | "rejected") => {
      if (!absence) return;
      
      const statusData = {
        status: newStatus,
        processedDate: getFormattedDate(new Date())
      };
      
      const response = await apiRequest(
        "PATCH", 
        `/api/absences/${absence.id}/status`, 
        statusData
      );
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status aktualisiert",
        description: "Der Status der Entschuldigung wurde erfolgreich aktualisiert.",
      });
      onStatusChange();
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Status konnte nicht aktualisiert werden: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  if (!absence) {
    return null;
  }

  const formatDate = (date?: string) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleUpdateStatus = (status: "approved" | "rejected") => {
    setIsUpdating(true);
    updateStatusMutation.mutate(status);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Entschuldigungsdetails</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Details zur eingereichten Abwesenheit
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Schüler</p>
              <p className="mt-1 text-gray-900">{absence?.studentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Klasse</p>
              <p className="mt-1 text-gray-900">{absence?.studentClass}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Schultyp</p>
              <p className="mt-1 text-gray-900">{absence?.educationType || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Beruf</p>
              <p className="mt-1 text-gray-900">{absence?.profession}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Telefon Privat</p>
              <p className="mt-1 text-gray-900">{absence?.phonePrivate || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Telefon Geschäft</p>
              <p className="mt-1 text-gray-900">{absence?.phoneWork || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ort</p>
              <p className="mt-1 text-gray-900">{absence?.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Anzahl Lektionen</p>
              <p className="mt-1 text-gray-900">{absence?.lessonCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Lehrer</p>
              <p className="mt-1 text-gray-900">
                {(() => {
                  try {
                    const teachers = JSON.parse(absence?.teachers || '[]');
                    return Array.isArray(teachers) ? teachers.join(', ') : absence?.teacherName;
                  } catch (e) {
                    return absence?.teacherName;
                  }
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Von</p>
              <p className="mt-1 text-gray-900">{formatDate(absence?.dateStart)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bis</p>
              <p className="mt-1 text-gray-900">{formatDate(absence?.dateEnd)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Grund</p>
              <p className="mt-1 text-gray-900">{absence?.reason}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unterschriften</p>
              <p className="mt-1 text-gray-900">
                {[
                  absence?.signature && 'Lernende:r',
                  absence?.parentSignature && 'Eltern',
                  absence?.supervisorSignature && 'Lehrperson'
                ].filter(Boolean).join(', ') || 'Keine'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <StatusBadge status={absence?.status} className="mt-1" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Eingereicht am</p>
              <p className="mt-1 text-gray-900">{formatDate(absence?.submissionDate)}</p>
            </div>
            {absence?.processedDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Bearbeitet am</p>
                <p className="mt-1 text-gray-900">{formatDate(absence?.processedDate)}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {absence?.status === "pending" && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleUpdateStatus("rejected")}
                disabled={isUpdating}
              >
                Ablehnen
              </Button>
              <Button
                onClick={() => handleUpdateStatus("approved")}
                disabled={isUpdating}
              >
                Akzeptieren
              </Button>
            </div>
          )}
          <Button variant="secondary" onClick={onClose}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
