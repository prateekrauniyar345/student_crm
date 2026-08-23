// src/hooks/useStudentProfiles.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import {
  getStudentProfiles,
  getStudentProfileByPersonId,
  createStudentProfile,
  updateStudentProfile,
  deleteStudentProfile,
} from "../api/studentProfiles";
import { useToast } from "../context/ToastContext";

// Fetch all student profiles
export function useAllStudentProfiles() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.studentProfiles.all(),
    queryFn: getStudentProfiles,
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch student profiles by filters
export function useStudentProfilesByFilters(filters = {}) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.studentProfiles.list(filters),
    queryFn: () => getStudentProfiles(filters),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch student profile by person ID
export function useStudentProfileByPersonId(personId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.studentProfiles.byPersonId(personId),
    queryFn: () => getStudentProfileByPersonId(personId),
    enabled: !!isAuthenticated && !!session && !!personId,
    staleTime: 1000 * 60 * 10,
  });
}

// Create student profile mutation
export function useCreateStudentProfile() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (profileData) => createStudentProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentProfiles.all(),
      });
      success("Student profile created successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to create student profile";
      showError(message);
    },
  });
}

// Update student profile mutation
export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ personId, updates }) => updateStudentProfile(personId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentProfiles.all(),
      });
      success("Student profile updated successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to update student profile";
      showError(message);
    },
  });
}

// Delete student profile mutation
export function useDeleteStudentProfile() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (personId) => deleteStudentProfile(personId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentProfiles.all(),
      });
      success("Student profile deleted successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to delete student profile";
      showError(message);
    },
  });
}
