"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("token");
    setIsAuthenticated(!!token);
    setIsLoading(false);

    // Redirect to login if not authenticated and not on auth pages
    if (!token && !pathname?.startsWith("/auth")) {
      router.push("/auth/signin");
    }
  }, [pathname, router]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/auth/signin");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

