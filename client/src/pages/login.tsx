import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, user } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("student");

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === "student" ? "/student/form" : "/teacher/overview";
      setLocation(redirectPath);
    }
  }, [isAuthenticated, user, setLocation]);

  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: async (data: { username: string; password: string; role: string }) => {
      const response = await apiRequest("POST", `${import.meta.env.VITE_API_URL}/login`, data);
      return await response.json();
    },
    onSuccess: (data) => {
      login(data);
      toast({
        title: "Erfolgreich angemeldet",
        description: `Willkommen zurück, ${data.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Fehlende Eingaben",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (password.length < 6) {
      toast({
        title: "Ungültiges Passwort",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein",
        variant: "destructive",
      });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast({
        title: "Ungültiges Passwort",
        description: "Das Passwort muss mindestens einen Großbuchstaben enthalten",
        variant: "destructive",
      });
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast({
        title: "Ungültiges Passwort",
        description: "Das Passwort muss mindestens einen Kleinbuchstaben enthalten",
        variant: "destructive",
      });
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast({
        title: "Ungültiges Passwort",
        description: "Das Passwort muss mindestens ein Sonderzeichen enthalten",
        variant: "destructive",
      });
      return;
    }

    submitLogin({ username, password, role });
  };

  const passwordRequirements = [
    "Mindestens 6 Zeichen",
    "Mindestens ein Großbuchstabe",
    "Mindestens ein Kleinbuchstabe",
    "Mindestens ein Sonderzeichen"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Anmeldung</CardTitle>
          <CardDescription className="text-center">
            Melden Sie sich an, um fortzufahren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rolle</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <RadioGroup value={role} onValueChange={setRole} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student">Schüler</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <Label htmlFor="teacher">Lehrer</Label>
                      </div>
                    </RadioGroup>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Wählen Sie Ihre Rolle aus</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Benutzername"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Geben Sie Ihren Benutzernamen ein</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="********"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p>Passwort-Anforderungen:</p>
                      <ul className="list-disc list-inside text-sm">
                        {passwordRequirements.map((req) => (
                          <li key={req}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Anmeldung..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
