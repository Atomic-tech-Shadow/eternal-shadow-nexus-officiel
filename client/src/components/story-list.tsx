import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Story } from './story';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { apiRequest } from '../lib/api';
import { useState } from 'react';

export function StoryList() {
  const [newStory, setNewStory] = useState({ content: '', imageUrl: '' });
  const queryClient = useQueryClient();

  const { data: stories } = useQuery({
    queryKey: ['/api/stories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/stories');
      return res.json();
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (data: typeof newStory) => {
      const res = await apiRequest('POST', '/api/stories', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      setNewStory({ content: '', imageUrl: '' });
    },
  });

  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      await apiRequest('POST', `/api/stories/${storyId}/views`);
    },
  });

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Créer une story</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Contenu de la story"
              value={newStory.content}
              onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
            />
            <Input
              placeholder="URL de l'image (optionnel)"
              value={newStory.imageUrl}
              onChange={(e) => setNewStory({ ...newStory, imageUrl: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => createStoryMutation.mutate(newStory)}>
              Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stories?.map((story) => (
          <Story
            key={story.id}
            username={story.user.username}
            content={story.content}
            imageUrl={story.imageUrl}
            createdAt={new Date(story.createdAt)}
            onView={() => viewStoryMutation.mutate(story.id)}
          />
        ))}
      </div>
    </div>
  );
}