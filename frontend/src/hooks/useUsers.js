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

