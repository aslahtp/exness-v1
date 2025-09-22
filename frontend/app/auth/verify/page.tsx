"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your token...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No token provided");
      return;
    }

    const verifyToken = async () => {
      try {
        await authApi.verify(token);
        login();
        setStatus("success");
        setMessage("Verification successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. Please try again."
        );
      }
    };

    verifyToken();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-2xl text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white">{message}</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-green-500 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-green-400">{message}</p>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 bg-red-500 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="text-red-400">{message}</p>
            <button
              onClick={() => router.push("/auth/signin")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
