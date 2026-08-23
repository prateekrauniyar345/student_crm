// src/hooks/usePeople.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import {
  getPeople,
  getPeopleByInstitution,
  getPeopleByLifecycleStage,
  createPerson,
  updatePerson,
  deletePerson,
} from "../api/people";
import { useToast } from "../context/ToastContext";

// Fetch all people
export function useAllPeople() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.people.all(),
    queryFn: getPeople,
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch people by filters
export function usePeopleByFilters(filters = {}) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.people.list(filters),
    queryFn: () => getPeople(filters),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch people by institution
export function usePeopleByInstitution(institutionId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.people.byInstitution(institutionId),
    queryFn: () => getPeopleByInstitution(institutionId),
    enabled: !!isAuthenticated && !!session && !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch people by lifecycle stage
export function usePeopleByLifecycleStage(lifecycleStage) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.people.byLifecycleStage(lifecycleStage),
    queryFn: () => getPeopleByLifecycleStage(lifecycleStage),
    enabled: !!isAuthenticated && !!session && !!lifecycleStage,
    staleTime: 1000 * 60 * 10,
  });
}

// Create person mutation
export function useCreatePerson() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (personData) => createPerson(personData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.people.all(),
      });
      success("Person created successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to create person";
      showError(message);
    },
  });
}

// Update person mutation
export function useUpdatePerson() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ personId, updates }) => updatePerson(personId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.people.all(),
      });
      success("Person updated successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to update person";
      showError(message);
    },
  });
}

// Delete person mutation
export function useDeletePerson() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (personId) => deletePerson(personId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.people.all(),
      });
      success("Person deleted successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || err.message || "Failed to delete person";
      showError(message);
    },
  });
}
