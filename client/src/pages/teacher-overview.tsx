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
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch absences
  const { data: allAbsences, isLoading, refetch } = useQuery<Absence[]>({
    queryKey: ['/api/absences'],
  });

  const pendingAbsences = allAbsences?.filter(absence => absence.status === 'pending') || [];
  const processedAbsences = allAbsences?.filter(absence => absence.status !== 'pending') || [];

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
      <Header title="Übersicht Entschuldigungen" />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <Tabs 
                defaultValue="pending" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="border-b w-full justify-start rounded-none">
                  <TabsTrigger value="pending" className="px-6 py-3">
                    Offene Entschuldigungen
                  </TabsTrigger>
                  <TabsTrigger value="processed" className="px-6 py-3">
                    Verarbeitete Entschuldigungen
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  <AbsenceTable 
                    absences={pendingAbsences}
                    isLoading={isLoading}
                    onAbsenceClick={handleAbsenceClick}
                    onContextMenu={handleContextMenu}
                    type="pending"
                  />
                </TabsContent>
                
                <TabsContent value="processed">
                  <AbsenceTable 
                    absences={processedAbsences}
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
