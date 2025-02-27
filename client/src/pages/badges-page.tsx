import { NavBar } from "@/components/nav-bar";
import { useQuery } from "@tanstack/react-query";
import type { Badge } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function BadgesPage() {
  const { user } = useAuth();
  const { data: badges, isLoading } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  const { data: userBadges } = useQuery<Badge[]>({
    queryKey: ["/api/users", user?.id, "badges"],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Badges et Récompenses</h1>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {badges?.map((badge) => {
              const isEarned = userBadges?.some((b) => b.id === badge.id);
              return (
                <Card key={badge.id} className={!isEarned ? "opacity-50" : undefined}>
                  <CardHeader>
                    <CardTitle>{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className={`h-8 w-8 ${isEarned ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  );
}
