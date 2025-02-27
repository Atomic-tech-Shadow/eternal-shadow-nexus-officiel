import { NavBar } from "@/components/nav-bar";
import { useQuery } from "@tanstack/react-query";
import type { Post, User } from "@shared/schema";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const { data: posts, isLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts", { isProject: true }],
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projets Informatiques</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Projet
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-[300px] w-full rounded-xl" />
              </div>
            ))
          ) : posts?.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <p>Aucun projet pour le moment</p>
              <p className="text-sm">Soyez le premier à partager un projet !</p>
            </div>
          ) : (
            posts?.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </main>
    </div>
  );
}
