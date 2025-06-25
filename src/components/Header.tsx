import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

import { RefreshCw } from "lucide-react";

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
}

export function Header({ title, onRefresh }: HeaderProps) {
  const { user, logout } = useAuth();
  const [_, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response;
    },
    onSuccess: () => {
      logout();
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary">{title}</h1>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {user.username}
              </span>
              <p className="text-xs text-muted-foreground">
                {user.role === "teacher" ? "Lehrer" : "Schüler"}
              </p>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefresh}
                  title="Absenzenliste neu laden"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  );
}
