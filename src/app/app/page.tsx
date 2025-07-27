"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import PersonalChatInterface from "@/components/personal-chat-interface";

export default function RegularModePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      redirect("/auth/signin");
      return;
    }

    // If user is in fun mode, redirect to fun mode
    if (session.user.mode === "fun") {
      redirect("/");
      return;
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user.mode === "fun") {
    return null; // Will redirect
  }

  return <PersonalChatInterface />;
}