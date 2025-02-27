import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    let retryTimeout: NodeJS.Timeout;
    let ws: WebSocket;

    const connect = () => {
      // Use current protocol and host for WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);

          // Mettre à jour le cache des notifications
          queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });

          // Afficher une notification toast
          toast({
            title: "Nouvelle notification",
            description: notification.content,
          });
        } catch (error) {
          console.error("Error processing notification:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected (code: ${event.code}), retrying in 5s...`);
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [user, queryClient, toast]);
}