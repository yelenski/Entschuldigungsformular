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

  // Neue Status-Auswahl für alle Entschuldigungen
  const statusOptions = [
    { value: "Aussenstehend", backendValue: "pending", label: "Aussenstehend", icon: <Clock className="h-4 w-4 mr-2" />, className: "bg-yellow-100 text-yellow-800" },
    { value: "Dokument Anfordern", backendValue: "awaiting_docs", label: "Dokument anfordern", icon: <FileQuestion className="h-4 w-4 mr-2" />, className: "bg-blue-100 text-blue-800" },
    { value: "In Prüfung", backendValue: "under_review", label: "In Prüfung", icon: <AlarmClock className="h-4 w-4 mr-2" />, className: "bg-purple-100 text-purple-800" },
    { value: "Genehmigt", backendValue: "approved", label: "Genehmigen", icon: <CheckCircle className="h-4 w-4 mr-2" />, className: "bg-green-100 text-success" },
    { value: "Abgelehnt", backendValue: "rejected", label: "Ablehnen", icon: <XCircle className="h-4 w-4 mr-2" />, className: "bg-red-100 text-error" },
    { value: "Abgelaufen", backendValue: "expired", label: "Als abgelaufen markieren", icon: <TimerOff className="h-4 w-4 mr-2" />, className: "bg-gray-100 text-gray-800" },
  ];

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
        
        <>
          <li className="py-1 px-2 text-xs font-semibold text-gray-500 bg-gray-50">
            Status ändern
          </li>
          {statusOptions.map(option => (
            <li key={option.value}>
              <button
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-light focus:outline-none flex items-center rounded ${option.className} ${absence.status === option.backendValue ? 'font-bold ring-2 ring-primary/40' : ''}`}
                onClick={() => updateStatusMutation.mutate(option.backendValue)}
                disabled={updateStatusMutation.isPending || absence.status === option.backendValue}
              >
                {option.icon}
                {option.label}
              </button>
            </li>
          ))}
        </>
      </ul>
    </div>
  );
}
