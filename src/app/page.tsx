"use client";

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user is authenticated and in fun mode, show chat interface
  if (session?.user.mode === "fun") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <ChatInterface mode="fun" />
      </div>
    );
  }

  // Show fun mode landing/sign-in page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="w-full max-w-4xl p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            🎉 Fun Mode AI Chat
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Join the collective AI experience where everyone shares the same conversation memory and learns together!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Fun Mode Main Card */}
          <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Collective AI Experience
              </h2>
              
              <div className="mb-8">
                <ul className="text-sm text-gray-700 space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Access to all conversations from every user</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Collective knowledge building in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>No sign-in required - instant access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Perfect for experimentation and discovery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>AI memory grows with every interaction</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={handleFunModeSignIn}
                disabled={isSigningIn}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 text-lg shadow-lg disabled:opacity-50"
                size="lg"
              >
                {isSigningIn ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Entering Fun Mode...
                  </div>
                ) : (
                  "🎈 Enter Fun Mode Now"
                )}
              </Button>
            </div>
          </Card>

          {/* Personal Mode Option */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Want Privacy Instead?
              </h2>
              
              <div className="mb-8">
                <p className="text-gray-700 mb-4">
                  If you prefer a private AI assistant with your own personal conversation history:
                </p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Private conversation history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Personal AI memory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Secure Google authentication</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => window.location.href = "/auth/signin/regular"}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-3"
                size="lg"
              >
                Choose Personal Mode
              </Button>
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            ✨ Same AI quality • 🔄 Switch anytime • ⚡ Instant access
          </p>
        </div>
      </div>
    </div>
  );
}
