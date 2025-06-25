import { apiRequest } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { AbsenceTable } from "@/components/AbsenceTable";
import { AbsenceDetails } from "@/components/AbsenceDetails";
import { ContextMenu } from "@/components/ContextMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { type Absence } from "@shared/schema";

export default function TeacherOverview() {
  const { user, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("offen");

  // Fetch absences
  const { data: allAbsences, isLoading, refetch } = useQuery<Absence[]>({
    queryKey: ['absences'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/absences");
      return await response.json();
    }
  });

  // Mapping Backend-Status zu deutschen Status
  function mapStatusToGerman(status: string) {
    switch (status) {
      case 'pending': return 'Aussenstehend';
      case 'awaiting_docs': return 'Dokument Anfordern';
      case 'under_review': return 'In Prüfung';
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      case 'expired': return 'Abgelaufen';
      default: return status;
    }
  }
  const safeAbsences = Array.isArray(allAbsences) ? allAbsences : [];
  const mappedAbsences = safeAbsences.map(absence => ({ ...absence, status: mapStatusToGerman(absence.status) }));

  // Einfache Tab-Filterung: Jeder Eintrag nur nach gemapptem Status
  const exklusiveOffene = mappedAbsences.filter(absence => absence.status === 'Aussenstehend');
  const exklusiveInBearbeitung = mappedAbsences.filter(absence =>
    absence.status === 'Dokument Anfordern' || absence.status === 'In Prüfung');
  const exklusiveAbgeschlossen = mappedAbsences.filter(absence =>
    absence.status === 'Genehmigt' || absence.status === 'Abgelehnt' || absence.status === 'Abgelaufen');

  useEffect(() => {
    // Redirect if not authenticated or not a teacher
    if (!isAuthenticated || user?.role !== "teacher") {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated || user?.role !== "teacher") {
    return null; // Don't render anything while redirecting
  }

  const handleContextMenu = (e: React.MouseEvent, absence: Absence) => {
    e.preventDefault();
    setSelectedAbsence(absence);
    setIsContextMenuOpen(true);
    setContextMenuPosition({ x: e.pageX, y: e.pageY });
  };

  const handleAbsenceClick = (absence: Absence) => {
    setSelectedAbsence(absence);
    setIsDetailsOpen(true);
  };

  const closeContextMenu = () => {
    setIsContextMenuOpen(false);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
  };

  const onAbsenceStatusChange = () => {
    // Refresh the data after a status change
    refetch();
    closeDetails();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Übersicht Entschuldigungen" onRefresh={refetch} />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <Tabs 
                defaultValue="offen" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="border-b w-full justify-start rounded-none">
                  <TabsTrigger value="offen" className="px-6 py-3">
                    Offen
                  </TabsTrigger>
                  <TabsTrigger value="bearbeitung" className="px-6 py-3">
                    In Bearbeitung
                  </TabsTrigger>
                  <TabsTrigger value="abgeschlossen" className="px-6 py-3">
                    Abgeschlossen
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="offen">
                  <AbsenceTable 
                    absences={exklusiveOffene}
                    isLoading={isLoading}
                    onAbsenceClick={handleAbsenceClick}
                    onContextMenu={handleContextMenu}
                    type="pending"
                  />
                </TabsContent>

                <TabsContent value="bearbeitung">
                  <AbsenceTable 
                    absences={exklusiveInBearbeitung}
                    isLoading={isLoading}
                    onAbsenceClick={handleAbsenceClick}
                    onContextMenu={handleContextMenu}
                    type="pending"
                  />
                </TabsContent>

                <TabsContent value="abgeschlossen">
                  <AbsenceTable 
                    absences={exklusiveAbgeschlossen}
                    isLoading={isLoading}
                    onAbsenceClick={handleAbsenceClick}
                    onContextMenu={handleContextMenu}
                    type="processed"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <ContextMenu 
        isOpen={isContextMenuOpen} 
        position={contextMenuPosition}
        onClose={closeContextMenu}
        absence={selectedAbsence}
        onViewDetails={() => {
          closeContextMenu();
          setIsDetailsOpen(true);
        }}
        onStatusChange={onAbsenceStatusChange}
      />
      
      <AbsenceDetails 
        isOpen={isDetailsOpen} 
        absence={selectedAbsence}
        onClose={closeDetails}
        onStatusChange={onAbsenceStatusChange}
      />
    </div>
  );
}
