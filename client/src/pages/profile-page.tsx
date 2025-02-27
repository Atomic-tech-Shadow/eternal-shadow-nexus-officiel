import { useAuth } from "@/hooks/use-auth";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import type { Badge, Post, User } from "@shared/schema";
import { PostCard } from "@/components/post-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, Users } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: badges } = useQuery<Badge[]>({
    queryKey: ["/api/users", user?.id, "badges"],
    enabled: !!user,
  });

  const { data: posts } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });

  const experienceForNextLevel = user ? user.level * 1000 : 0;
  const progress = user ? (user.experience / experienceForNextLevel) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Profil */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {user?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user?.username}</h2>
                  <p className="text-sm text-muted-foreground">
                    Niveau {user?.level}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Expérience</span>
                    <span>
                      {user?.experience} / {experienceForNextLevel}
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>

                {/* Badges */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Badges
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {badges?.map((badge) => (
                      <Card key={badge.id} className="p-2">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-full bg-primary/10">
                            <Award className="h-6 w-6 text-primary" />
                          </div>
                          <p className="text-xs font-medium truncate">
                            {badge.name}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Statistiques
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <p className="text-2xl font-bold">{posts?.length ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Publications</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Abonnés</p>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publications */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Publications</h2>
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
