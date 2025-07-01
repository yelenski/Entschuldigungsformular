import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Absence } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getFormattedDate } from "@/lib/utils";
import { 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlarmClock, 
  FileQuestion, 
  TimerOff 
} from "lucide-react";

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  absence: Absence | null;
  onClose: () => void;
  onViewDetails: () => void;
  onStatusChange: () => void;
}

export function ContextMenu({ 
  isOpen, 
  position, 
  absence, 
  onClose, 
  onViewDetails,
  onStatusChange 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle clicks outside of the context menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
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
    onSuccess: (_, variables) => {
      const statusMessages = {
        "approved": "Entschuldigung wurde genehmigt",
        "completed": "Entschuldigung als erledigt markiert",
        "rejected": "Entschuldigung wurde abgelehnt",
        "awaiting_docs": "Entschuldigung wartet auf weitere Dokumente",
        "under_review": "Entschuldigung wird geprüft",
        "expired": "Entschuldigung wurde als abgelaufen markiert",
      };
      
      toast({
        title: "Status aktualisiert",
        description: statusMessages[variables as keyof typeof statusMessages] || "Status wurde aktualisiert",
      });
      onStatusChange();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Status konnte nicht aktualisiert werden: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  if (!isOpen || !absence) {
    return null;
  }

  // Hilfsfunktion: Status-Optionen je nach aktuellem Status
  function getStatusOptions(currentStatus: string) {
    const allStatuses = [
      { key: "approved", label: "Genehmigen", icon: <CheckCircle className="h-4 w-4 mr-2" /> },
      { key: "rejected", label: "Ablehnen", icon: <XCircle className="h-4 w-4 mr-2" /> },
      { key: "awaiting_docs", label: "Dokumente anfordern", icon: <FileQuestion className="h-4 w-4 mr-2" /> },
      { key: "under_review", label: "Zur Prüfung", icon: <AlarmClock className="h-4 w-4 mr-2" /> },
      { key: "expired", label: "Als abgelaufen markieren", icon: <TimerOff className="h-4 w-4 mr-2" /> },
    ];
    if (currentStatus === "pending") {
      // Alle außer "pending"
      return allStatuses;
    }
    if (currentStatus === "under_review" || currentStatus === "awaiting_docs") {
      // Nur bestimmte Status
      return allStatuses.filter(s => ["approved", "rejected", "expired"].includes(s.key));
    }
    // Für abgeschlossene Status keine Status-Optionen
    return [];
  }

  const statusOptions = getStatusOptions(absence.status);

  const menuStyle = {
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div 
      ref={menuRef}
      className="absolute z-50 bg-white shadow-lg rounded-md overflow-hidden border border-gray-medium w-48"
      style={menuStyle}
    >
      <ul>
        <li>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-light focus:outline-none flex items-center"
            onClick={onViewDetails}
          >
            <Info className="h-4 w-4 mr-2" />
            Details anzeigen
          </button>
        </li>
        {statusOptions.length > 0 && (
          <>
            <li className="py-1 px-2 text-xs font-semibold text-gray-500 bg-gray-50">
              Status ändern
            </li>
            {statusOptions.map(option => (
              <li key={option.key}>
                <button
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-light focus:outline-none flex items-center ${
                    option.key === "approved" ? "text-green-700" :
                    option.key === "rejected" ? "text-red-700" :
                    option.key === "awaiting_docs" ? "text-blue-700" :
                    option.key === "under_review" ? "text-purple-700" :
                    option.key === "expired" ? "text-gray-700" : ""
                  }`}
                  onClick={() => updateStatusMutation.mutate(option.key)}
                  disabled={updateStatusMutation.isPending}
                >
                  {option.icon}
                  {option.label}
                </button>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}
