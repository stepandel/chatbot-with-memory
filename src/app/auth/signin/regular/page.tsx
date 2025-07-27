"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function RegularModeSignIn() {
  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/app" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Sign In to AI Chat
          </h1>
          <p className="text-gray-600 mt-2">
            Access your personalized, private AI experience
          </p>
        </div>

        {/* Regular Mode Info */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">🔒 Personal Mode Features</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Private conversation history</li>
            <li>• Personal AI memory and context</li>
            <li>• Secure Google authentication</li>
            <li>• Individual user experience</li>
          </ul>
        </div>

        {/* Google Sign In */}
        <div className="space-y-4">
          <Button
            onClick={() => handleOAuthSignIn("google")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
            size="lg"
          >
            Sign in with Google
          </Button>
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              Or try Fun Mode (shared experience)
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}