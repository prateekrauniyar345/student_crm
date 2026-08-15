// src/hooks/useCurrentUser.js
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../api/queryKeys";
import { getCurrentUser } from "../api/auth";

export function useCurrentUser() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.me(), // Generates ["auth", "me"]
    queryFn: getCurrentUser,
    // Only run if Supabase session exists and user is authenticated
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10, // Consider fresh for 10 minutes
  });
}