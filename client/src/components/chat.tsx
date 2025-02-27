
import React from 'react';
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Chat({ receiverId }: { receiverId: number }) {
  const [message, setMessage] = React.useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId, content: message }),
    });
    
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Messages list */}
      </div>
      <div className="border-t p-4 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
