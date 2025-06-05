import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlarmClock, 
  FileQuestion, 
  TimerOff 
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Ausstehend",
      icon: <Clock className="h-3 w-3 mr-1" />,
      className: "bg-yellow-100 text-yellow-800"
    },
    approved: {
      label: "Genehmigt",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      className: "bg-green-100 text-success"
    },
    completed: { // For backward compatibility
      label: "Erledigt",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      className: "bg-green-100 text-success"
    },
    rejected: {
      label: "Abgelehnt",
      icon: <XCircle className="h-3 w-3 mr-1" />,
      className: "bg-red-100 text-error"
    },
    awaiting_docs: {
      label: "Dokumente ausstehend",
      icon: <FileQuestion className="h-3 w-3 mr-1" />,
      className: "bg-blue-100 text-blue-800"
    },
    under_review: {
      label: "In Prüfung",
      icon: <AlarmClock className="h-3 w-3 mr-1" />,
      className: "bg-purple-100 text-purple-800"
    },
    expired: {
      label: "Abgelaufen",
      icon: <TimerOff className="h-3 w-3 mr-1" />,
      className: "bg-gray-100 text-gray-800"
    },
    // Neue Status für Mapping
    "Aussenstehend": {
      label: "Aussenstehend",
      icon: <Clock className="h-3 w-3 mr-1" />,
      className: "bg-yellow-100 text-yellow-800"
    },
    "Dokument Anfordern": {
      label: "Dokument Anfordern",
      icon: <FileQuestion className="h-3 w-3 mr-1" />,
      className: "bg-blue-100 text-blue-800"
    },
    "In Prüfung": {
      label: "In Prüfung",
      icon: <AlarmClock className="h-3 w-3 mr-1" />,
      className: "bg-purple-100 text-purple-800"
    },
    "Genehmigt": {
      label: "Genehmigt",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      className: "bg-green-100 text-success"
    },
    "Abgelehnt": {
      label: "Abgelehnt",
      icon: <XCircle className="h-3 w-3 mr-1" />,
      className: "bg-red-100 text-error"
    },
    "Abgelaufen": {
      label: "Abgelaufen",
      icon: <TimerOff className="h-3 w-3 mr-1" />,
      className: "bg-gray-100 text-gray-800"
    }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  
  if (!config) {
    return null;
  }
  
  return (
    <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${config.className} ${className || ''}`}>
      {config.icon}
      {config.label}
    </span>
  );
}