"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "../firebase/authService"; 
import { auth } from "@/app/firebase/firebase"; // Import Firebase auth to check authentication state

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  
  const handleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Handle registration
        await authService.register(email, password, displayName);
        alert("Registration successful! Please log in.");
        router.push("/login"); // Redirect to login after registration
      } else {
        // Handle login
        await authService.login(email, password);

        // Check if the user is authenticated
        const user = auth.currentUser;
        if (user) {
          alert("log in complete.");
          router.push("/upload"); // Redirect to the home page

        } else {
          throw new Error("Login failed. Please try again.");
        }
      }
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>

        {isSignUp && (
          <div className="mb-4">
            <label className="block text-gray-600 text-sm mb-1">
              Display Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
        </Button>

        <p
          className="text-sm text-gray-600 mt-3 text-center cursor-pointer"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </p>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>
    </div>
  );
}