"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function FunModeSignIn() {
  const router = useRouter();

  const handleFunModeSignIn = async () => {
    const result = await signIn("fun-mode", {
      callbackUrl: "/",
      redirect: false,
    });

    if (result?.ok) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎉 Entering Fun Mode...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700">
            Connecting you to the collective AI experience!
          </p>

          <Button
            onClick={handleFunModeSignIn}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
            size="lg"
          >
            🚀 Enter Fun Mode
          </Button>
        </div>
      </Card>
    </div>
  );
}
