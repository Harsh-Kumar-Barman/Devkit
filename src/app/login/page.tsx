"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Loader2, Chrome } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect if logged in with valid session
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      router.replace("/"); // logged in & valid user
    }
  }, [status, session, router]);

  // Auto logout if session is authenticated but missing user id (means user deleted)
  useEffect(() => {
    if (status === "authenticated" && !session?.user?.id) {
      signOut(); // force logout
    }
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Logged in successfully!");
        router.replace("/");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred.",error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p className="text-white text-center mt-10">Loading...</p>;
  if (status === "authenticated" && session?.user?.id) return null; // Prevent flashing login page

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-10 w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-zinc-400 text-sm">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-zinc-800"></div>
          <span className="px-3 text-zinc-500 text-sm">OR</span>
          <div className="flex-1 border-t border-zinc-800"></div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-6 w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Chrome className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>

        <p className="mt-8 text-center text-sm text-zinc-400">
          {"Don't have an account? "}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}