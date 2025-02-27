import { NavBar } from "@/components/nav-bar";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { useQuery } from "@tanstack/react-query";
import type { Post, User, Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const { data: posts, isLoading: postsLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts", { categoryId: selectedCategory }],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Charger les posts recommandés (pour l'instant basé sur la catégorie)
  const { data: recommendedPosts, isLoading: recommendedLoading } = useQuery<(Post & { user: User })[]>({
    queryKey: ["/api/posts", { recommended: true, categoryId: selectedCategory }],
    enabled: !!selectedCategory,
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList>
            <TabsTrigger value="feed">Mon Fil</TabsTrigger>
            <TabsTrigger value="discover">Découvrir</TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <StoryList />
            {/* Filtres */}
            <div className="flex gap-4 mb-8">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CreatePost />

            {/* Posts */}
            <div className="space-y-6 mt-8">
              {postsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
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
                <div className="text-center py-12 text-muted-foreground">
                  <p>Aucun post pour le moment</p>
                  <p className="text-sm">Soyez le premier à partager quelque chose !</p>
                </div>
              ) : (
                posts?.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="discover">
            <div className="grid gap-6 md:grid-cols-2">
              {recommendedLoading ? (
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
              ) : recommendedPosts?.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <p>Aucune recommandation pour le moment</p>
                  <p className="text-sm">Sélectionnez une catégorie pour voir des suggestions</p>
                </div>
              ) : (
                recommendedPosts?.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}