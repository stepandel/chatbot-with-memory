"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, LogOut } from "lucide-react";
import MarkdownMessage from "./markdown-message";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
}

interface ChatInterfaceProps {
  mode?: "fun" | "regular";
}

export default function ChatInterface({ mode = "fun" }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        role: "assistant",
        timestamp: Date.now() + 1,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        const assistantMessageId = (Date.now() + 1).toString();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessageIndex = newMessages.findIndex(
              (msg) => msg.id === assistantMessageId
            );
            if (lastMessageIndex !== -1) {
              newMessages[lastMessageIndex] = {
                ...newMessages[lastMessageIndex],
                content: newMessages[lastMessageIndex].content + chunk,
              };
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: "Sorry, there was an error processing your message.",
          role: "assistant",
          timestamp: Date.now() + 2,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header with mode info and logout */}
      <div
        className={`flex justify-between items-center mb-4 p-4 rounded-lg shadow-sm border ${
          mode === "fun"
            ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div>
          {mode === "fun" ? (
            <>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎉 Fun Mode
              </h1>
              <p className="text-sm text-purple-700 mt-1">
                Collective AI experience • Everyone shares this conversation
                memory
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900">
                🔒 Personal AI Chat
              </h1>
              <p className="text-sm text-blue-700 mt-1">
                Your private AI assistant • Personal conversation history
              </p>
            </>
          )}
          {session?.user && (
            <p className="text-xs text-gray-600 mt-1">
              {mode === "fun"
                ? "Connected to shared experience"
                : `Signed in as ${session.user.name || session.user.email}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => signOut()}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              mode === "fun"
                ? "border-purple-300 text-purple-700 hover:bg-purple-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LogOut className="w-4 h-4" />
            {mode === "fun" ? "Exit Fun Mode" : "Sign Out"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex justify-center">
            <Card
              className={`max-w-md p-6 border ${
                mode === "fun"
                  ? "bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200"
                  : "bg-gradient-to-br from-blue-50 to-gray-50 border-blue-200"
              }`}
            >
              <div className="text-center">
                {mode === "fun" ? (
                  <>
                    <h3 className="text-lg font-semibold text-purple-800 mb-3">
                      Welcome to Fun Mode! 🚀
                    </h3>
                    <div className="text-sm text-purple-700 space-y-2">
                      <p>
                        You&apos;re now part of a collective AI experience
                        where:
                      </p>
                      <ul className="text-left space-y-1 mt-3">
                        <li>• Everyone shares the same conversation memory</li>
                        <li>• The AI learns from all previous interactions</li>
                        <li>• You can build upon others&apos; conversations</li>
                        <li>• It&apos;s a collaborative knowledge space</li>
                      </ul>
                      <p className="mt-3 text-xs text-gray-600">
                        Start chatting to contribute to the collective AI
                        memory!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">
                      Welcome to Your Personal AI! 🔒
                    </h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p>Your private AI assistant is ready to help:</p>
                      <ul className="text-left space-y-1 mt-3">
                        <li>• Secure, private conversation history</li>
                        <li>• Personal AI memory just for you</li>
                        <li>• No data sharing with other users</li>
                        <li>• Personalized responses and context</li>
                      </ul>
                      <p className="mt-3 text-xs text-gray-600">
                        Start chatting to build your personal AI assistant!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
        {messages.map((message) => (
          <MarkdownMessage 
            key={message.id} 
            message={{
              ...message,
              createdAt: new Date(message.timestamp).toISOString()
            }} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
