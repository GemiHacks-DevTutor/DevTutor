"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, userTools } = useUser();

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessageText = input;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: userMessageText,
        sender: "user",
      },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat_window", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessageText,
          user,
          tools: userTools,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: data.response, sender: "ai" },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Sorry, something went wrong. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="flex flex-col flex-grow m-4">
        <CardHeader>
          <CardTitle className="text-center">DevTutor</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow p-4">
          <ScrollArea className="flex-grow h-[calc(100vh-200px)] p-4 border rounded-md bg-white dark:bg-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start mb-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "ai" && (
                  <Avatar className="mr-3">
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback>DT</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === "user" && (
                  <Avatar className="ml-3">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </ScrollArea>
          <div className="flex mt-4">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-grow mr-2"
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
