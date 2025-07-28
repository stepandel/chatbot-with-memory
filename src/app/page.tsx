"use client";

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import ChatInterface from '@/components/chat-interface';

export default function FunModePage() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    // If user is in regular mode, redirect to regular mode
    if (session?.user.mode === "regular") {
      window.location.href = "/app";
      return;
    }
  }, [session, status]);

  const handleFunModeSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("fun-mode", { 
        callbackUrl: "/",
        redirect: false 
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // If user is authenticated and in fun mode, show chat interface
  if (session?.user.mode === "fun") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ChatInterface mode="fun" />
      </div>
    );
  }

  // Show fun mode landing/sign-in page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Chat
          </h1>
          <p className="text-lg text-gray-600">
            Choose your experience
          </p>
        </div>

        <div className="space-y-4">
          {/* Fun Mode Button */}
          <Button 
            onClick={handleFunModeSignIn}
            disabled={isSigningIn}
            className="w-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 hover:from-orange-500 hover:via-pink-500 hover:to-purple-600 text-white font-bold py-6 text-xl shadow-lg disabled:opacity-50 transform hover:scale-105 transition-all duration-200 rounded-2xl border-0"
            size="lg"
          >
            {isSigningIn ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Entering Fun Mode...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <span>Fun Mode</span>
                <span className="text-2xl">✨</span>
              </div>
            )}
          </Button>

          {/* Google Sign-in Button */}
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/app" })}
            variant="outline"
            className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 py-3 text-sm font-normal rounded-lg"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </div>
          </Button>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-xs">
            Same AI • Different experience
          </p>
        </div>
      </div>
    </div>
  );
}
