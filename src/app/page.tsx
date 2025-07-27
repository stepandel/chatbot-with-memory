"use client";

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';

export default function FunModePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      redirect("/auth/signin/fun");
      return;
    }

    // If user is in regular mode, redirect to regular mode
    if (session.user.mode === "regular") {
      redirect("/app");
      return;
    }
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session || session.user.mode === "regular") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <ChatInterface mode="fun" />
    </div>
  );
}
