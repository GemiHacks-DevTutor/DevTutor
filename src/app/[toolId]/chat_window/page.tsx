"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserAvatar from "@/components/UserAvatar";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { user, userTools } = useUser();
  const params = useParams();
  const toolId = params?.toolId as string;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Copy code to clipboard
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Header with navigation and user avatar */}
      <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
        <div className="flex flex-col space-y-2">
          <Link href={`/${toolId}`}>
            <Button variant="outline">← Back to Tool</Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            DevTutor Chat
          </h1>
          {currentTool && (
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400">
                Learning {currentTool.name}
              </p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentTool.difficulty === 'beginner' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : currentTool.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {currentTool.difficulty}
              </span>
            </div>
          )}
        </div>
        <UserAvatar />
      </div>

      {/* Chat container */}
      <div className="max-w-6xl mx-auto h-[80vh] flex flex-col">
        <Card className="flex flex-col h-full">
          <CardContent className="flex flex-col h-full p-6">
            {/* Scrollable chat area */}
            <div className="flex-1 min-h-0 mb-4">
              <ScrollArea ref={scrollAreaRef} className="h-full p-4 border rounded-md bg-white dark:bg-gray-800">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start mb-4 ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.sender === "ai" && (
                      <Avatar className="mr-3 mt-1 flex-shrink-0">
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
                        <div className="prose prose-base max-w-none dark:prose-invert text-base">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                            // Custom styling for code blocks with syntax highlighting
                            code: ({ className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const language = match ? match[1] : '';
                              const isInline = !className || !className.includes('language-');
                              
                              if (isInline) {
                                return (
                                  <code
                                    className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-mono border border-gray-200 dark:border-gray-600"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              
                              return (
                                <div className="relative my-3 group">
                                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
                                    {language && (
                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-mono font-medium uppercase tracking-wider">
                                        {language}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => copyToClipboard(String(children))}
                                      className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-200 opacity-70 hover:opacity-100"
                                      title="Copy code"
                                    >
                                      {copiedCode === String(children) ? (
                                        <>
                                          <Check className="w-3 h-3 text-green-500" />
                                          <span className="text-green-500 font-medium">Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={isDarkMode ? vscDarkPlus : oneLight}
                                    customStyle={{
                                      margin: 0,
                                      padding: '1.25rem 1.5rem',
                                      borderRadius: '0 0 0.5rem 0.5rem',
                                      fontSize: '1rem',
                                      lineHeight: '1.6',
                                      background: isDarkMode ? '#1e1e1e' : '#fafafa',
                                      border: isDarkMode ? '1px solid #333' : '1px solid #e5e7eb',
                                      borderTop: 'none',
                                    }}
                                    language={language}
                                    PreTag="div"
                                    showLineNumbers={true}
                                    lineNumberStyle={{
                                      minWidth: '3em',
                                      paddingRight: '1em',
                                      color: isDarkMode ? '#6e7681' : '#656d76',
                                      fontSize: '0.875rem',
                                      userSelect: 'none',
                                    }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            },
                            // Custom styling for paragraphs
                            p: ({ children }) => <p className="mb-3 last:mb-0 text-base leading-relaxed">{children}</p>,
                            // Custom styling for lists
                            ul: ({ children }) => <ul className="mb-3 pl-4 text-base">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-3 pl-4 text-base">{children}</ol>,
                            li: ({ children }) => <li className="mb-2 text-base">{children}</li>,
                          }}
                          >
                            {message.text}
                          </ReactMarkdown>
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-gray-500 dark:bg-gray-400 animate-pulse ml-1" />
                          )}
                        </div>
                      ) : (
                        <div className="text-base leading-relaxed">
                          {message.text}
                        </div>
                      )}
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="ml-3 mt-1 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                          {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {loading && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && (
                  <div className="flex items-start mb-4 justify-start">
                    <Avatar className="mr-3 mt-1 flex-shrink-0">
                      <AvatarImage src="/ai-avatar.png" />
                      <AvatarFallback>DT</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 p-3 rounded-lg">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="ml-2 text-base">DevTutor is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Fixed input area at bottom */}
            <div className="flex space-x-2 flex-shrink-0">
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
                className="px-6 flex-shrink-0"
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
    </div>
  );
}
