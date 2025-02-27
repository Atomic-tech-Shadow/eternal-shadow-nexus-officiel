import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EditProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    bio: user?.bio || "",
    profilePic: user?.profilePic || "",
    twitter: "",
    github: "",
    discord: "",
    email: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil : " + error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Éditer le profil</DialogTitle>
          <DialogDescription>
            Personnalisez votre profil et ajoutez vos informations de contact.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Photo de profil</Label>
            <div className="flex items-center gap-4">
              <FileUpload
                type="profile"
                onUploadComplete={(url) =>
                  setProfileData({ ...profileData, profilePic: url })
                }
              />
              {profileData.profilePic && (
                <img
                  src={profileData.profilePic}
                  alt="Profile"
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({ ...profileData, bio: e.target.value })
              }
              placeholder="Parlez-nous un peu de vous..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Réseaux sociaux</Label>
            <Input
              value={profileData.twitter}
              onChange={(e) =>
                setProfileData({ ...profileData, twitter: e.target.value })
              }
              placeholder="Twitter"
            />
            <Input
              value={profileData.github}
              onChange={(e) =>
                setProfileData({ ...profileData, github: e.target.value })
              }
              placeholder="GitHub"
            />
            <Input
              value={profileData.discord}
              onChange={(e) =>
                setProfileData({ ...profileData, discord: e.target.value })
              }
              placeholder="Discord"
            />
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              placeholder="Email de contact"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => updateProfileMutation.mutate(profileData)}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
