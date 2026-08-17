// src/hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import {
  getUsers,
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from "../api/users";
import { useToast } from "../context/ToastContext";

// Fetch all users
export function useAllUsers() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: getAllUsers,
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
  });
}

// Fetch users with filters
export function useUsersByFilters(filters = {}) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => getUsers(filters),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 5,
  });
}

// Fetch single user
export function useUserById(userId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getUserById(userId),
    enabled: !!isAuthenticated && !!session && !!userId,
    staleTime: 1000 * 60 * 10,
  });
}

// Hook to update a user profile
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ userId, updatePayload }) => updateUser(userId, updatePayload),
    onSuccess: (updatedUser, variables) => {
      // Invalidate all users list and specific user detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.me(),
      });
      success("User profile updated successfully");
      return updatedUser;
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to update user";
      showError(message);
    },
  });
}

// Hook to create a new user
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (createUserPayload) => createUser(createUserPayload),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.all(),
      });
      success("User created successfully");
      return newUser;
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to create user";
      showError(message);
    },
  });
}

// Hook to delete a user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ email, id }) => deleteUser(email, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.all(),
      });
      success("User deleted successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to delete user";
      showError(message);
    },
  });
}

