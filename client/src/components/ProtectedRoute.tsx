import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles = [] }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/");
      } else if (roles.length > 0 && !roles.includes(user?.role || "")) {
        // Redirect based on role
        if (user?.role === "student") {
          setLocation("/student/form");
        } else if (user?.role === "teacher") {
          setLocation("/teacher/overview");
        } else {
          setLocation("/");
        }
      }
    }
  }, [isAuthenticated, isLoading, roles, user?.role, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (roles.length > 0 && !roles.includes(user?.role || "")) {
    return null;
  }

  return <>{children}</>;
}
