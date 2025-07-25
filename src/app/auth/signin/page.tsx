"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/");
    } else {
      alert("Invalid credentials");
    }
    setLoading(false);
  };

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Sign In to AI Chat</h1>
          <p className="text-gray-600 mt-2">
            Access your personalized chat experience
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Demo Credentials</h3>
          <p className="text-sm text-blue-700">
            Email: demo@example.com
            <br />
            Password: demo
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4 mb-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In with Email"}
          </Button>
        </form>

        {/* OAuth Providers */}
        <div className="space-y-3">
          <Button
            onClick={() => handleOAuthSignIn("google")}
            variant="outline"
            className="w-full"
          >
            Sign in with Google
          </Button>
        </div>
      </Card>
    </div>
  );
}
