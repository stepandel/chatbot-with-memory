"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, LogOut } from "lucide-react";
import ChatSidebar from "./chat-sidebar";
import MarkdownMessage from "./markdown-message";
import { useConversations } from "@/hooks/useConversations";
import { ConversationTitleGenerator } from "@/lib/conversation-title-generator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function PersonalChatInterface() {
  const { data: session } = useSession();
  const conversationsHook = useConversations();
  const { createConversation, updateConversation } = conversationsHook;
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const conversation = await response.json();
        setCurrentConversation(conversation);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
  };

  const handleConversationSelect = (conversationId: string) => {
    loadConversation(conversationId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // If no current conversation, create one first
    if (!currentConversation) {
      // Generate a meaningful title based on the user's message
      const initialTitle = await ConversationTitleGenerator.generateTitle({
        userMessage: input
      });
      
      const newConversation = await createConversation(initialTitle);
      if (newConversation) {
        setCurrentConversation({
          ...newConversation,
          messages: [],
        });

        // The hook already updates the conversations list automatically
        // Wait a bit for state to update then proceed with message
        setTimeout(() => sendMessage(newConversation.id, input), 100);
        return;
      } else {
        // Failed to create conversation
        return;
      }
    }

    if (currentConversation) {
      sendMessage(currentConversation.id, input);
    }
  };

  const sendMessage = async (
    conversationId: string,
    messageContent: string
  ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    // Add user message to current conversation
    setCurrentConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, userMessage],
          }
        : null
    );

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/personal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        role: "assistant",
        createdAt: new Date().toISOString(),
      };

      // Add assistant message placeholder
      setCurrentConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, assistantMessage],
            }
          : null
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Update the assistant message with streaming content
          setCurrentConversation((prev) => {
            if (!prev) return null;

            const updatedMessages = [...prev.messages];
            const lastMessageIndex = updatedMessages.length - 1;

            if (
              lastMessageIndex >= 0 &&
              updatedMessages[lastMessageIndex].role === "assistant"
            ) {
              updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex],
                content: updatedMessages[lastMessageIndex].content + chunk,
              };
            }

            return {
              ...prev,
              messages: updatedMessages,
            };
          });
        }

        // After streaming is complete, improve the title if this is the first exchange
        setCurrentConversation((prev) => {
          if (prev && prev.messages.length <= 2) {
            const finalAssistantMessage = prev.messages.find(m => m.role === "assistant");
            if (finalAssistantMessage && finalAssistantMessage.content) {
              // Asynchronously update the title with both user message and assistant response
              ConversationTitleGenerator.generateTitle({
                userMessage: messageContent,
                assistantResponse: finalAssistantMessage.content
              }).then(async (newTitle) => {
                // Update through the hook so sidebar updates automatically
                const success = await updateConversation(conversationId, newTitle);
                if (success) {
                  // Update the current conversation title in local state
                  setCurrentConversation(current => 
                    current ? { ...current, title: newTitle } : null
                  );
                }
              }).catch(error => {
                console.error("Error updating conversation title:", error);
              });
            }
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, there was an error processing your message.",
        role: "assistant",
        createdAt: new Date().toISOString(),
      };

      setCurrentConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, errorMessage],
            }
          : null
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <ChatSidebar
        currentConversationId={currentConversation?.id || null}
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
        conversationsHook={conversationsHook}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              🔒 Personal AI Chat
            </h1>
            <p className="text-sm text-blue-700">
              {currentConversation
                ? currentConversation.title
                : "Start a new conversation"}
            </p>
            {session?.user && (
              <p className="text-xs text-gray-600 mt-1">
                Signed in as {session.user.name || session.user.email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => signOut()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <div className="flex justify-center">
              <Card className="max-w-md p-6 bg-gradient-to-br from-blue-50 to-gray-50 border-blue-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    Welcome to Your Personal AI! 🔒
                  </h3>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>Your private AI assistant is ready to help:</p>
                    <ul className="text-left space-y-1 mt-3">
                      <li>• Secure, private conversation history</li>
                      <li>• Personal AI memory just for you</li>
                      <li>• Chat history saved and organized</li>
                      <li>• Switch between conversations anytime</li>
                    </ul>
                    <p className="mt-3 text-xs text-gray-600">
                      Start chatting to create your first conversation!
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            currentConversation.messages.map((message) => (
              <MarkdownMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-200 bg-white"
        >
          <div className="flex gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
}
