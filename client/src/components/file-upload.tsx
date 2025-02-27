
import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  type: 'profile' | 'post' | 'video';
  onUploadComplete: (url: string) => void;
}

export function FileUpload({ type, onUploadComplete }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const res = await apiRequest('POST', '/api/upload', formData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Fichier uploadé",
        description: "Votre fichier a été uploadé avec succès.",
      });
      onUploadComplete(data.url);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier : " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={type === 'video' ? 'video/*' : 'image/*'}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploadMutation.isPending ? 'Upload en cours...' : 'Upload'}
      </Button>
    </div>
  );
}
