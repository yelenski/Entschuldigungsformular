import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Absence } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getFormattedDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

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

  const handleUpdateStatus = (status: "completed" | "rejected") => {
    setIsUpdating(true);
    updateStatusMutation.mutate(status);
  };

  const isPending = absence.status === "pending";

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Entschuldigungsdetails</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Schüler</p>
              <p className="mt-1 text-gray-900">{absence.studentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Klasse</p>
              <p className="mt-1 text-gray-900">{absence.studentClass}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Beruf</p>
              <p className="mt-1 text-gray-900">{absence.profession}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Lehrer</p>
              <p className="mt-1 text-gray-900">{absence.teacherName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Abwesenheitstyp</p>
              <p className="mt-1 text-gray-900">{absence.absenceType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Zeitraum</p>
              <p className="mt-1 text-gray-900">{absence.dateStart} - {absence.dateEnd}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Eingereicht am</p>
              <p className="mt-1 text-gray-900">{absence.submissionDate}</p>
            </div>
            {absence.status !== "pending" && absence.processedDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-gray-900">
                  {absence.status === "completed" ? "Erledigt" : "Abgewiesen"}
                </p>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Begründung</p>
            <p className="mt-1 text-gray-900 whitespace-pre-line">{absence.reason}</p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
          
          {isPending && (
            <>
              <Button 
                variant="destructive" 
                onClick={() => handleUpdateStatus("rejected")}
                disabled={isUpdating}
              >
                Abweisen
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleUpdateStatus("completed")}
                disabled={isUpdating}
              >
                Akzeptieren
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
