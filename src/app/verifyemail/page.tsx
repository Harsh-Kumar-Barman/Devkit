"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const searchParams = useSearchParams();

  const verifyUserEmail = async () => {
    try {
      await axios.post("/api/auth/verifyemail", { token });
      setVerified(true);
    } catch (error: any) {
      setError(true);
      console.log(error.response.data);
    }
  };

  useEffect(() => {
    const urlToken = searchParams.get("token");
    setToken(urlToken || "");
  }, [searchParams]);

  useEffect(() => {
    if (token.length > 0) {
      verifyUserEmail();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black text-white">
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-10 w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">Verify Email</h1>
        <h2 className="p-2 bg-orange-500 text-black">{token ? `${token.substring(0, 10)}...` : "no token"}</h2>

        {verified && (
          <div>
            <h2 className="text-2xl text-green-500 mb-4">Email Verified Successfully</h2>
            <Link href="/login" className="px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition">
              Login
            </Link>
          </div>
        )}
        {error && (
          <div>
            <h2 className="text-2xl text-red-500">Verification Failed</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
