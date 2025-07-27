import { useState, useEffect, useCallback } from "react";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/conversations");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (title: string): Promise<Conversation | null> => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      const newConversation = await response.json();
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError(err instanceof Error ? err.message : "Failed to create conversation");
      return null;
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.status}`);
      }

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      return true;
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError(err instanceof Error ? err.message : "Failed to delete conversation");
      return false;
    }
  }, []);

  const updateConversation = useCallback(async (conversationId: string, title: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update conversation: ${response.status}`);
      }

      const updatedConversation = await response.json();
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? updatedConversation : c)
      );
      return true;
    } catch (err) {
      console.error("Error updating conversation:", err);
      setError(err instanceof Error ? err.message : "Failed to update conversation");
      return false;
    }
  }, []);

  const refreshConversations = useCallback(() => {
    setLoading(true);
    fetchConversations();
  }, [fetchConversations]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    createConversation,
    deleteConversation,
    updateConversation,
    refreshConversations,
  };
}