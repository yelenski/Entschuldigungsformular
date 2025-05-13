import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

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
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/auth/me', {
        signal,
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to get user session');
      }
      
      return await response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  // Aktualisiere den Benutzer, wenn die Abfrage erfolgreich ist
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  const login = (userData: User) => {
    setUser(userData);
    // Aktualisiere die Abfrage, damit der Benutzer als eingeloggt gilt
    // und wir uns nicht zweimal anmelden müssen
    refetch();
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
