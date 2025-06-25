import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { AbsenceForm } from "@/components/AbsenceForm";

export default function StudentForm() {
  const { user, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Redirect if not authenticated or not a student
    if (!isAuthenticated || user?.role !== "student") {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated || user?.role !== "student") {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Entschuldigungsformular" />
      
      <main className="flex-grow py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AbsenceForm />
        </div>
      </main>
    </div>
  );
}
