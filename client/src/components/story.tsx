
import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StoryProps {
  username: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  onView: () => void;
}

export function Story({ username, content, imageUrl, createdAt, onView }: StoryProps) {
  return (
    <Card className="w-full max-w-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={onView}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary">
            <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{username}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true, locale: fr })}
            </p>
          </div>
        </div>
        {imageUrl && (
          <div className="relative aspect-square mb-3">
            <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover rounded-md" />
          </div>
        )}
        <p className="text-sm">{content}</p>
      </CardContent>
    </Card>
  );
}
