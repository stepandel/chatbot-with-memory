"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SignInModeSelector() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100">
      <div className="w-full max-w-4xl p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your AI Experience
          </h1>
          <p className="text-lg text-gray-600">
            Select how you&apos;d like to interact with our AI assistant
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Fun Mode Card */}
          <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Fun Mode
              </h2>
              <p className="text-gray-700 mb-6">
                Join a collective AI experience where everyone shares the same conversation memory
              </p>
              
              <div className="mb-6">
                <h3 className="font-medium text-purple-800 mb-3">Features:</h3>
                <ul className="text-sm text-purple-700 space-y-2 text-left">
                  <li>• Shared conversation memory with all users</li>
                  <li>• Learn from everyone&apos;s interactions</li>
                  <li>• Collective AI knowledge building</li>
                  <li>• No sign-in required</li>
                  <li>• Perfect for experimentation</li>
                </ul>
              </div>

              <Link href="/auth/signin/fun">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
                  size="lg"
                >
                  🚀 Enter Fun Mode
                </Button>
              </Link>
            </div>
          </Card>

          {/* Regular Mode Card */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-gray-50 border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Personal Mode
              </h2>
              <p className="text-gray-700 mb-6">
                Your private, personalized AI assistant with secure authentication
              </p>
              
              <div className="mb-6">
                <h3 className="font-medium text-blue-800 mb-3">Features:</h3>
                <ul className="text-sm text-blue-700 space-y-2 text-left">
                  <li>• Private conversation history</li>
                  <li>• Personal AI memory and context</li>
                  <li>• Secure Google authentication</li>
                  <li>• Individual user experience</li>
                  <li>• Data privacy and security</li>
                </ul>
              </div>

              <Link href="/auth/signin/regular">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  size="lg"
                >
                  Sign in with Google
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            You can switch between modes anytime. Both modes offer the same AI capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
