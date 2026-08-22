// src/hooks/useAcademicTerms.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import {
  getAcademicTerms,
  getAcademicTermsByInstitution,
  getAcademicTermsByYear,
  createAcademicTerm,
  updateAcademicTerm,
  deleteAcademicTerm,
} from "../api/academicTerms";
import { useToast } from "../context/ToastContext";

// Fetch all academic terms
export function useAllAcademicTerms() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.academicTerms.all(),
    queryFn: getAcademicTerms,
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch academic terms by filters
export function useAcademicTermsByFilters(filters = {}) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.academicTerms.list(filters),
    queryFn: () => getAcademicTerms(filters),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch academic terms by institution
export function useAcademicTermsByInstitution(institutionId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.academicTerms.byInstitution(institutionId),
    queryFn: () => getAcademicTermsByInstitution(institutionId),
    enabled: !!isAuthenticated && !!session && !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch academic terms by application year
export function useAcademicTermsByYear(applicationYear) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.academicTerms.byYear(applicationYear),
    queryFn: () => getAcademicTermsByYear(applicationYear),
    enabled: !!isAuthenticated && !!session && !!applicationYear,
    staleTime: 1000 * 60 * 10,
  });
}

// Create academic term mutation
export function useCreateAcademicTerm() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (termData) => createAcademicTerm(termData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.academicTerms.all(),
      });
      success("Academic term created successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to create academic term";
      showError(message);
    },
  });
}

// Update academic term mutation
export function useUpdateAcademicTerm() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ termId, updates }) => updateAcademicTerm(termId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.academicTerms.all(),
      });
      success("Academic term updated successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to update academic term";
      showError(message);
    },
  });
}

// Delete academic term mutation
export function useDeleteAcademicTerm() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (termId) => deleteAcademicTerm(termId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.academicTerms.all(),
      });
      success("Academic term deleted successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to delete academic term";
      showError(message);
    },
  });
}
