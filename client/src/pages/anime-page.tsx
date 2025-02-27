import { NavBar } from "@/components/nav-bar";
import { useQuery } from "@tanstack/react-query";
import type { Post, User, Category } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnimePage() {
  // Récupérer la catégorie Anime & Manga
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const animeCategory = categories?.find(
    (category) => category.type === "anime"
  );

  const { data: posts, isLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts", { categoryId: animeCategory?.id }],
    enabled: !!animeCategory,
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Anime & Manga</h1>

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
              <p>Aucun post dans cette catégorie</p>
              <p className="text-sm">Soyez le premier à partager du contenu !</p>
            </div>
          ) : (
            posts?.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </main>
    </div>
  );
}
