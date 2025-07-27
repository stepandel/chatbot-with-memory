"use client";

import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import PersonalChatInterface from "@/components/personal-chat-interface";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegularModePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    // If user is in fun mode, redirect to fun mode
    if (session?.user.mode === "fun") {
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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <Card className="max-w-md p-8 bg-white border border-blue-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-900 mb-4">
              🔒 Personal Mode
            </h1>
            <p className="text-gray-600 mb-6">
              Sign in with Google to access your private AI assistant with personal conversation history.
            </p>
            <Button
              onClick={() => signIn("google")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign in with Google
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (session.user.mode === "fun") {
    return null; // Will redirect
  }

  return <PersonalChatInterface />;
}