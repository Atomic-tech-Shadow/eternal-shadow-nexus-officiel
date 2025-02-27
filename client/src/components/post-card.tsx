import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post, User, Comment } from "@shared/schema";
import { Heart, MessageSquare, Share2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function PostCard({ post }: { post: Post & { user: User } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const { data: comments } = useQuery<(Comment & { user: User })[]>({
    queryKey: ["/api/posts", post.id, "comments"],
    enabled: showComments,
  });

  const { data: likes } = useQuery<{ count: number }>({
    queryKey: ["/api/posts", post.id, "likes"],
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/likes`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", post.id, "likes"],
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/comments`, {
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", post.id, "comments"],
      });
      setComment("");
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post.user.username}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Erreur lors du partage:", err);
      }
    } else {
      // Copier le lien si le partage natif n'est pas disponible
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans votre presse-papiers",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarFallback>
            {post.user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.user.username}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(post.createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
          >
            <Heart
              className={`mr-2 h-4 w-4 ${likeMutation.isPending && "animate-pulse"}`}
            />
            {likes?.count || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {comments?.length || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
        </div>

        {showComments && (
          <div className="space-y-4 w-full">
            <div className="flex gap-2">
              <Textarea
                placeholder="Écrire un commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                onClick={() => commentMutation.mutate(comment)}
                disabled={!comment.trim() || commentMutation.isPending}
              >
                {commentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Envoyer"
                )}
              </Button>
            </div>

            <div className="space-y-2">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {comment.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{comment.user.username}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}