// src/hooks/useCurrentUser.js
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../api/queryKeys";
import { getCurrentUser } from "../api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../api/users";
import { useToast } from "../context/ToastContext";


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


export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    // Accept an object containing both userId and the update data
    mutationFn: ({ userId, updatePayload }) => updateUser(userId, updatePayload),
    onSuccess: (updatedUser) => {
        success("Profile updated successfully");
        // Invalidate query to refetch fresh user data everywhere
        queryClient.invalidateQueries({
            queryKey: queryKeys.me(),
        });
        return updatedUser;
    },
    onError: (err) => {
        const message = err.response?.data?.detail || err.message || "Failed to update profile";
        showError(message);
    },
  });
}
