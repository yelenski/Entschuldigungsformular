import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Dummy-User für reines Frontend ohne Backend
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setUser(null); // oder hier einen Dummy-User setzen, falls gewünscht
  }, []);
  
  // useEffect mit [data] entfernt, da kein Backend/Query mehr genutzt wird

  const login = (userData?: User) => {
    setUser(
      userData || {
        id: 1,
        username: "testuser",
        name: "Test User",
        role: "student", // oder "teacher"
      }
    );
  };

  const logout = async () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
