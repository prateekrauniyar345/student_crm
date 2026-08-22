// src/hooks/usePrograms.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import {
  getPrograms,
  getProgramsByInstitution,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../api/programs";
import { useToast } from "../context/ToastContext";

// Fetch all programs
export function useAllPrograms() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.programs.all(),
    queryFn: getPrograms,
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch programs by filters
export function useProgramsByFilters(filters = {}) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.programs.list(filters),
    queryFn: () => getPrograms(filters),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch programs by institution
export function useProgramsByInstitution(institutionId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.programs.byInstitution(institutionId),
    queryFn: () => getProgramsByInstitution(institutionId),
    enabled: !!isAuthenticated && !!session && !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
}

// Create program mutation
export function useCreateProgram() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (programData) => createProgram(programData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.programs.all(),
      });
      success("Program created successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to create program";
      showError(message);
    },
  });
}

// Update program mutation
export function useUpdateProgram() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ programId, updates }) => updateProgram(programId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.programs.all(),
      });
      success("Program updated successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to update program";
      showError(message);
    },
  });
}

// Delete program mutation
export function useDeleteProgram() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (programId) => deleteProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.programs.all(),
      });
      success("Program deleted successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to delete program";
      showError(message);
    },
  });
}
