import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  username: z.string()
    .min(1, "Benutzername ist erforderlich")
    .refine((val) => val.trim().length > 0, {
      message: "Benutzername darf nicht leer sein",
    }),
  password: z.string()
    .min(1, "Passwort ist erforderlich")
    .min(6, "Passwort muss mindestens 6 Zeichen lang sein")
    .regex(/[A-Z]/, "Passwort muss mindestens einen Grossbuchstaben enthalten")
    .regex(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Passwort muss mindestens ein Sonderzeichen enthalten")
    .refine((val) => val.trim().length > 0, {
      message: "Passwort darf nicht leer sein",
    }),
  role: z.enum(["student", "teacher"], {
    required_error: "Bitte wählen Sie eine Rolle",
    invalid_type_error: "Ungültige Rolle ausgewählt",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && !isPending) {
      const redirectPath = user.role === "student" ? "/student/form" : "/teacher/overview";
      setTimeout(() => setLocation(redirectPath), 0);
    }
  }, [isAuthenticated, user, setLocation]);

  const form = useForm<FormData>({
    mode: "onChange", // Aktiviert Live-Validierung während der Eingabe
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "student",
    },
  });

  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        const response = await apiRequest("POST", "/api/auth/login", data);
        const result = await response.json();
        return result;
      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) {
          throw new Error("Bitte überprüfen Sie Ihre Anmeldedaten");
        }
        throw new Error("Ein unerwarteter Fehler ist aufgetreten");
      }
    },
    onSuccess: (data) => {
      login(data);
      const roleText = data.role === "teacher" ? "Lehrer" : "Schüler";
      
      toast({
        title: "Erfolgreich angemeldet",
        description: `Willkommen zurück, ${data.name}!`,
      });
      
      if (data.role === "student") {
        setLocation("/student/form");
      } else {
        setLocation("/teacher/overview");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: FormData) {
    if (!data.username || !data.password || !data.role) {
      toast({
        title: "Fehlende Eingaben",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }
    submitLogin(data);
  }

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Rolle</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="student" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Schüler
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="teacher" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Lehrer
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benutzername</FormLabel>
                    <FormControl>
                      <Input placeholder="Benutzername" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Anmeldung..." : "Anmelden"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
