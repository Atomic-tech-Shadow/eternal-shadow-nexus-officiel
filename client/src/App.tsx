import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { useRoutes } from "wouter";
import { useNotifications } from "./hooks/use-notifications";
import ProtectedRoute from "./lib/protected-route";

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

  // Définition des routes avec `useRoutes`
  const routes = useRoutes([
    { path: "/auth", component: AuthPage },
    { path: "/", component: () => <ProtectedRoute component={HomePage} /> },
    { path: "/profile", component: () => <ProtectedRoute component={ProfilePage} /> },
    { path: "/groups", component: () => <ProtectedRoute component={GroupsPage} /> },
    { path: "/badges", component: () => <ProtectedRoute component={BadgesPage} /> },
    { path: "/projects", component: () => <ProtectedRoute component={ProjectsPage} /> },
    { path: "/anime", component: () => <ProtectedRoute component={AnimePage} /> },
    { path: "/admin", component: () => <ProtectedRoute component={AdminPage} /> },
    { path: "*", component: NotFound }, // Gère toutes les routes non définies
  ]);

  return routes;
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
