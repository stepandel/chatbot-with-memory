"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100">
      <div className="w-full max-w-6xl p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to AI Chat
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your AI experience. Whether you want to join a collective conversation or have a private assistant, we&apos;ve got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Fun Mode Card */}
          <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300 transition-all hover:shadow-lg">
            <div className="text-center">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Fun Mode
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Join a collective AI experience where everyone contributes to and learns from shared conversations
              </p>
              
              <div className="mb-8">
                <h3 className="font-semibold text-purple-800 mb-4 text-lg">🚀 What you get:</h3>
                <ul className="text-sm text-purple-700 space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Access to all conversations ever had with the AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Collective knowledge building with other users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>No sign-in required - instant access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Perfect for experimentation and learning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Shared AI memory grows with every interaction</span>
                  </li>
                </ul>
              </div>

              <Link href="/auth/signin/fun">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 text-lg"
                  size="lg"
                >
                  🎈 Try Fun Mode
                </Button>
              </Link>
            </div>
          </Card>

          {/* Regular Mode Card */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-gray-50 border-2 border-blue-200 hover:border-blue-300 transition-all hover:shadow-lg">
            <div className="text-center">
              <div className="text-8xl mb-6">🔒</div>
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                Personal Mode
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Your private, secure AI assistant with personalized memory and individual conversation history
              </p>
              
              <div className="mb-8">
                <h3 className="font-semibold text-blue-800 mb-4 text-lg">🔐 What you get:</h3>
                <ul className="text-sm text-blue-700 space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Private conversation history just for you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Personal AI memory and context building</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Secure Google authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Complete data privacy and security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Personalized responses based on your history</span>
                  </li>
                </ul>
              </div>

              <Link href="/auth/signin/regular">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 text-lg"
                  size="lg"
                >
                  🛡️ Choose Personal Mode
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Not sure which to choose?
            </h3>
            <p className="text-gray-600 mb-4">
              Both modes offer the same powerful AI capabilities. The only difference is whether your conversations are shared or private.
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <div>✨ Same AI quality</div>
              <div>•</div>
              <div>🔄 Switch anytime</div>
              <div>•</div>
              <div>⚡ Instant access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}