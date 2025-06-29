"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  isStreaming?: boolean;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, userTools } = useUser();
  const params = useParams();
  const toolId = params?.toolId as string;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentTool = useMemo(() => {
    if (!toolId || !userTools) return null;
    const tool = userTools.find((tool) => tool.id === toolId);
    console.log("Current Tool Object:", tool);
    return tool;
  }, [toolId, userTools]);

  // Add welcome message when component mounts
  useEffect(() => {
    if (currentTool && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        text: `Hi ${user?.firstName || 'there'}! 👋 I'm DevTutor, your AI programming assistant. I'm here to help you learn **${currentTool.name}**!\n\nFeel free to ask me anything about ${currentTool.name} - from basic concepts to advanced topics. I can explain code, help with debugging, suggest best practices, and guide you through your learning journey.\n\nWhat would you like to learn about ${currentTool.name} today?`,
        sender: "ai",
      };
      setMessages([welcomeMessage]);
    }
  }, [currentTool, user, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessageText = input;
    const userMessage: Message = {
      id: Date.now(),
      text: userMessageText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Create an AI message that will be streamed
    const aiMessageId = Date.now() + 1;
    const aiMessage: Message = {
      id: aiMessageId,
      text: "",
      sender: "ai",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      const response = await fetch("/api/chat_window", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessageText,
          user,
          tools: currentTool ? [currentTool] : [],
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                // Update final message without streaming flag
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  // Update the AI message with accumulated text
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? { ...msg, text: accumulatedText }
                        : msg
                    )
                  );
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Fallback to non-streaming API
      try {
        const fallbackResponse = await fetch("/api/chat_window/route_clean", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userMessage: userMessageText,
          }),
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    text: data.response || "Sorry, something went wrong. Please try again.",
                    isStreaming: false,
                  }
                : msg
            )
          );
        } else {
          throw new Error("Fallback also failed");
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  text: "Sorry, something went wrong. Please try again.",
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="flex flex-col flex-grow m-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Link href="/dashboard"><Button variant="outline">Home</Button></Link>
            <CardTitle className="text-center flex-grow">DevTutor</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow p-4">
          <ScrollArea ref={scrollAreaRef} className="flex-grow h-[calc(100vh-200px)] p-4 border rounded-md bg-white dark:bg-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start mb-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "ai" && (
                  <Avatar className="mr-3 mt-1">
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
                  {message.sender === "ai" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          // Custom styling for code blocks
                          code: ({ className, children, ...props }) => {
                            const isInline = !className || !className.includes('language-');
                            if (isInline) {
                              return (
                                <code
                                  className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                          // Custom styling for paragraphs
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          // Custom styling for lists
                          ul: ({ children }) => <ul className="mb-2 pl-4">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 pl-4">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-gray-500 dark:bg-gray-400 animate-pulse ml-1" />
                      )}
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
                {message.sender === "user" && (
                  <Avatar className="ml-3 mt-1">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && (
              <div className="flex items-start mb-4 justify-start">
                <Avatar className="mr-3 mt-1">
                  <AvatarImage src="/ai-avatar.png" />
                  <AvatarFallback>DT</AvatarFallback>
                </Avatar>
                <div className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="ml-2 text-sm">DevTutor is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex mt-4 space-x-2">
            <Input
              type="text"
              placeholder={`Ask me anything about ${currentTool?.name || 'programming'}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              className="flex-grow"
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || input.trim() === ""}
              className="px-6"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
