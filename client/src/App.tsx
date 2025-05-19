import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import StudentForm from "@/pages/student-form";
import TeacherOverview from "@/pages/teacher-overview";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/student/form">
        {() => (
          <ProtectedRoute roles={["student"]}>
            <StudentForm />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/teacher/overview">
        {() => (
          <ProtectedRoute roles={["teacher"]}>
            <TeacherOverview />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
