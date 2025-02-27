import { NavBar } from "@/components/nav-bar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { User, Category, Badge } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Award, Tag } from "lucide-react";
import { Redirect } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Vérifier si l'utilisateur est admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: badges } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "anime" as "anime" | "tech",
    description: "",
  });

  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    imageUrl: "",
    requirement: "",
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof newCategory) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCategory({ name: "", type: "anime", description: "" });
      toast({
        title: "Catégorie créée",
        description: "La nouvelle catégorie a été ajoutée avec succès.",
      });
    },
  });

  const createBadgeMutation = useMutation({
    mutationFn: async (data: typeof newBadge) => {
      const res = await apiRequest("POST", "/api/badges", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/badges"] });
      setNewBadge({ name: "", description: "", imageUrl: "", requirement: "" });
      toast({
        title: "Badge créé",
        description: "Le nouveau badge a été ajouté avec succès.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Administration</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tag className="h-4 w-4" />
              Catégories
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Award className="h-4 w-4" />
              Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Liste de tous les utilisateurs inscrits sur la plateforme.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom d'utilisateur</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Expérience</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.level}</TableCell>
                        <TableCell>{user.experience}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter une catégorie</CardTitle>
                  <CardDescription>
                    Créez une nouvelle catégorie pour organiser le contenu.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="categoryName">Nom</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({ ...newCategory, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="categoryType">Type</Label>
                      <select
                        id="categoryType"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1"
                        value={newCategory.type}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            type: e.target.value as "anime" | "tech",
                          })
                        }
                      >
                        <option value="anime">Anime</option>
                        <option value="tech">Tech</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Textarea
                        id="categoryDescription"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => createCategoryMutation.mutate(newCategory)}
                    >
                      Créer la catégorie
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Catégories existantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories?.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.type}</TableCell>
                          <TableCell>{category.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter un badge</CardTitle>
                  <CardDescription>
                    Créez un nouveau badge pour récompenser les utilisateurs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="badgeName">Nom</Label>
                      <Input
                        id="badgeName"
                        value={newBadge.name}
                        onChange={(e) =>
                          setNewBadge({ ...newBadge, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="badgeDescription">Description</Label>
                      <Textarea
                        id="badgeDescription"
                        value={newBadge.description}
                        onChange={(e) =>
                          setNewBadge({
                            ...newBadge,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="badgeImage">Image URL</Label>
                      <Input
                        id="badgeImage"
                        value={newBadge.imageUrl}
                        onChange={(e) =>
                          setNewBadge({ ...newBadge, imageUrl: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="badgeRequirement">Condition d'obtention</Label>
                      <Input
                        id="badgeRequirement"
                        value={newBadge.requirement}
                        onChange={(e) =>
                          setNewBadge({
                            ...newBadge,
                            requirement: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button onClick={() => createBadgeMutation.mutate(newBadge)}>
                      Créer le badge
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Badges existants</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Condition</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {badges?.map((badge) => (
                        <TableRow key={badge.id}>
                          <TableCell>{badge.name}</TableCell>
                          <TableCell>{badge.description}</TableCell>
                          <TableCell>{badge.requirement}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
