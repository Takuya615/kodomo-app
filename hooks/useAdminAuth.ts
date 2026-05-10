"use client";

import { useState, useEffect, useCallback } from "react";

const ADMIN_TOKEN_KEY = "kodomo_admin_token";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (stored) {
      setToken(stored);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  return { token, isAuthenticated, isLoading, login, logout };
}
