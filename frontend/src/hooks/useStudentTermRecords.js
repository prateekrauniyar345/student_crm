// src/hooks/useStudentTermRecords.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import {
  getStudentTermRecords,
  getStudentTermRecordsByPersonId,
  getStudentTermRecordsByTermId,
  createStudentTermRecord,
  updateStudentTermRecord,
  deleteStudentTermRecord,
} from "../api/studentTermRecords";
import { useToast } from "../context/ToastContext";

// Fetch all student term records
export function useAllStudentTermRecords() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.studentTermRecords.all(),
    queryFn: getStudentTermRecords,
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch student term records by filters
export function useStudentTermRecordsByFilters(filters = {}) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.studentTermRecords.list(filters),
    queryFn: () => getStudentTermRecords(filters),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch student term records by person ID
export function useStudentTermRecordsByPersonId(personId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.studentTermRecords.byPersonId(personId),
    queryFn: () => getStudentTermRecordsByPersonId(personId),
    enabled: !!isAuthenticated && !!session && !!personId,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch student term records by term ID
export function useStudentTermRecordsByTermId(termId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.studentTermRecords.byTermId(termId),
    queryFn: () => getStudentTermRecordsByTermId(termId),
    enabled: !!isAuthenticated && !!session && !!termId,
    staleTime: 1000 * 60 * 10,
  });
}

// Create student term record mutation
export function useCreateStudentTermRecord() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (recordData) => createStudentTermRecord(recordData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentTermRecords.all(),
      });
      success("Student term record created successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to create student term record";
      showError(message);
    },
  });
}

// Update student term record mutation
export function useUpdateStudentTermRecord() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ recordId, updates }) => updateStudentTermRecord(recordId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentTermRecords.all(),
      });
      success("Student term record updated successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to update student term record";
      showError(message);
    },
  });
}

// Delete student term record mutation
export function useDeleteStudentTermRecord() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (recordId) => deleteStudentTermRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentTermRecords.all(),
      });
      success("Student term record deleted successfully");
    },
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to delete student term record";
      showError(message);
    },
  });
}
