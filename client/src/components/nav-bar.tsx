import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "wouter";
import { 
  LogOut, 
  Menu, 
  Search, 
  Home, 
  Users, 
  BookOpen,
  Code,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { NotificationsDropdown } from "./notifications-dropdown";

export function NavBar() {
  const { user, logoutMutation } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: "Accueil", href: "/" },
    { icon: Users, label: "Groupes", href: "/groups" },
    { icon: BookOpen, label: "Animes", href: "/anime" },
    { icon: Code, label: "Projets", href: "/projects" },
    { icon: Trophy, label: "Badges", href: "/badges" },
  ];

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo et titre pour desktop */}
          <div className="hidden md:flex items-center gap-2">
            <h1 className="text-xl font-bold">Eternal Shadow Nexus</h1>
          </div>

          {/* Menu burger pour mobile */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 mt-8">
                {navigationItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button variant="ghost" className="w-full justify-start">
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo pour mobile */}
          <div className="md:hidden">
            <h1 className="text-lg font-bold">ESN</h1>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="gap-2">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Barre de recherche et profil */}
          <div className="flex items-center gap-2">
            <div className={`hidden md:block relative ${isSearchOpen ? 'w-64' : 'w-40'} transition-all`}>
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>

            {/* Bouton recherche mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* Menu profil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start">
                      Profil
                    </Button>
                  </Link>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Button variant="ghost" className="w-full justify-start">
                        Administration
                      </Button>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  );
}