// src/hooks/useApplications.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import {
  getApplications,
  getApplicationsByPersonId,
  getApplicationsByProgramId,
  getApplicationsByStage,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../api/applications";
import { useToast } from "../context/ToastContext";

// Fetch all applications
export function useAllApplications() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.applications.all(),
    queryFn: getApplications,
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch applications by filters
export function useApplicationsByFilters(filters = {}) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.applications.list(filters),
    queryFn: () => getApplications(filters),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch applications by person ID
export function useApplicationsByPersonId(personId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.applications.byPersonId(personId),
    queryFn: () => getApplicationsByPersonId(personId),
    enabled: !!isAuthenticated && !!session && !!personId,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch applications by program ID
export function useApplicationsByProgramId(programId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.applications.byProgramId(programId),
    queryFn: () => getApplicationsByProgramId(programId),
    enabled: !!isAuthenticated && !!session && !!programId,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch applications by stage
export function useApplicationsByStage(stage) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.applications.byStage(stage),
    queryFn: () => getApplicationsByStage(stage),
    enabled: !!isAuthenticated && !!session && !!stage,
    staleTime: 1000 * 60 * 10,
  });
}

// Create application mutation
export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (applicationData) => createApplication(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.all(),
      });
      success("Application created successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to create application";
      showError(message);
    },
  });
}

// Update application mutation
export function useUpdateApplication() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ applicationId, updates }) => updateApplication(applicationId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.all(),
      });
      success("Application updated successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to update application";
      showError(message);
    },
  });
}

// Delete application mutation
export function useDeleteApplication() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (applicationId) => deleteApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.all(),
      });
      success("Application deleted successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to delete application";
      showError(message);
    },
  });
}
