"use client";

import { useState } from "react";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "../../firebase"; 
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // ✅ ShadCN button
import { Input } from "@/components/ui/input"; // ✅ ShadCN input

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleAuth = async () => {
        try {
            let userCredential;
            if (isSignUp) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // ✅ Save new user to FastAPI backend
                await fetch("http://127.0.0.1:8000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, display_name: displayName })
                });

            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            router.push("/"); // ✅ Redirect to home after login
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{isSignUp ? "Create an Account" : "Welcome Back"}</h2>

                {isSignUp && (
                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm mb-1">Display Name</label>
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

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded" onClick={handleAuth}>
                    {isSignUp ? "Sign Up" : "Log In"}
                </Button>

                <p className="text-sm text-gray-600 mt-3 text-center cursor-pointer" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
                </p>

                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </div>
        </div>
    );
}