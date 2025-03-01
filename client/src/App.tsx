import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { useNotifications } from "./hooks/use-notifications";
import { Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route"; // Correction de l'importation

// Importation des pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import GroupsPage from "@/pages/groups-page";
import BadgesPage from "@/pages/badges-page";
import ProjectsPage from "@/pages/projects-page";
import AnimePage from "@/pages/anime-page";
import AdminPage from "@/pages/admin-page";
import NotFound from "@/pages/not-found";

function Router() {
  // Activer les notifications en temps réel
  useNotifications();

  return (
    <>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={() => <ProtectedRoute path="/" component={HomePage} />} />
      <Route path="/profile" component={() => <ProtectedRoute path="/profile" component={ProfilePage} />} />
      <Route path="/groups" component={() => <ProtectedRoute path="/groups" component={GroupsPage} />} />
      <Route path="/badges" component={() => <ProtectedRoute path="/badges" component={BadgesPage} />} />
      <Route path="/projects" component={() => <ProtectedRoute path="/projects" component={ProjectsPage} />} />
      <Route path="/anime" component={() => <ProtectedRoute path="/anime" component={AnimePage} />} />
      <Route path="/admin" component={() => <ProtectedRoute path="/admin" component={AdminPage} />} />
      <Route path="*" component={NotFound} /> {/* Gère toutes les routes non définies */}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
