import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { useNotifications } from "./hooks/use-notifications";
import ProtectedRoute from "./lib/protected-route";
import { Route, Switch } from "wouter"; // Remplacement de useRoutes

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
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={() => <ProtectedRoute component={HomePage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route path="/groups" component={() => <ProtectedRoute component={GroupsPage} />} />
      <Route path="/badges" component={() => <ProtectedRoute component={BadgesPage} />} />
      <Route path="/projects" component={() => <ProtectedRoute component={ProjectsPage} />} />
      <Route path="/anime" component={() => <ProtectedRoute component={AnimePage} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminPage} />} />
      <Route component={NotFound} /> {/* Route par défaut pour les 404 */}
    </Switch>
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
