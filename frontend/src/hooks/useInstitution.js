// src/hooks/institution.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import { 
  getInstitutions, 
  updateInstitution, 
  deleteInstitution 
} from "../api/institutions";
import {
  getInstitutionMemberships,
  createInstitutionMembership,
  updateInstitutionMembership,
  deleteInstitutionMembership
} from "../api/institutionMembership";
import { useToast } from "../context/ToastContext";




// Hook to get all institutions (No ID needed)
export function useAllInstitutions() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.institutions.all(),
    queryFn: () => getInstitutions(),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 10,
  });
}

// Hook to get a single institution by ID
export function useInstitutionById(institutionId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.institutions.detail(institutionId),
    queryFn: () => getInstitutions({ id: institutionId }),
    // Only run if auth exists AND a valid institutionId is provided
    enabled: !!isAuthenticated && !!session && !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
}

// Hook to update an institutions
export function useUpdateInstitution() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ institutionId, updates }) => updateInstitution(institutionId, updates),
    onSuccess: (updatedInstitution, variables) => {
      // Invalidate the specific detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.institutions.detail(variables.institutionId),
      });
      // Invalidate the all list query          
      queryClient.invalidateQueries({
        queryKey: queryKeys.institutions.all(),
      });
      success("Institution updated successfully");
      return updatedInstitution;
    },
    onError: (err) => {
      const message = err.response?.data?.detail || "Failed to update institution";
      showError(message);
    },
  });
}

// Hook to delete an institution
export function useDeleteInstitution() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (institutionId) => deleteInstitution(institutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.institutions.all(),
      });
      success("Institution deleted successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || "Failed to delete institution";
      showError(message);
    },
  });
}






// INSTITUTION MEMBERSHIP HOOKS
// Generic Filtered Query Hook
export function useInstitutionMemberships(filters = {}) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.memberships.list(filters),
    queryFn: () => getInstitutionMemberships(filters),
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Convenience Hook: Get current logged-in user's memberships & roles
export function useMyMemberships(userId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.memberships.byUser(userId),
    queryFn: () => getInstitutionMemberships({ user_id: userId }),
    enabled: !!isAuthenticated && !!session && !!userId,
    staleTime: 1000 * 60 * 10,
  });
}

// Convenience Hook: Get all staff/members in an active institution
export function useInstitutionStaff(institutionId) {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.memberships.byInstitution(institutionId),
    queryFn: () => getInstitutionMemberships({ institution_id: institutionId }),
    enabled: !!isAuthenticated && !!session && !!institutionId,
    staleTime: 1000 * 60 * 5,
  });
}

// Create Membership Mutation
export function useCreateMembership() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: createInstitutionMembership,
    onSuccess: (newMembership) => {
      // Invalidate all membership queries so lists update
      queryClient.invalidateQueries({
        queryKey: queryKeys.memberships.all(),
      });
      success("User added to institution successfully");
      return newMembership;
    },
    onError: (err) => {
      const message = err.response?.data?.detail || "Failed to create membership";
      showError(message);
    },
  });
}

// Update Membership Mutation (Composite Key)
export function useUpdateMembership() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ institutionId, userId, data }) =>
      updateInstitutionMembership({ institutionId, userId, data }),
    onSuccess: (updatedMembership, variables) => {
      // Invalidate the specific composite record
      queryClient.invalidateQueries({
        queryKey: queryKeys.memberships.detail(
          variables.institutionId,
          variables.userId
        ),
      });

      // Invalidate lists so tables show the updated role/department
      queryClient.invalidateQueries({
        queryKey: queryKeys.memberships.all(),
      });

      success("Membership role updated successfully");
      return updatedMembership;
    },
    onError: (err) => {
      const message = err.response?.data?.detail || "Failed to update membership";
      showError(message);
    },
  });
}

// Delete Membership Mutation (Composite Key)
export function useDeleteMembership() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({ institutionId, userId }) =>
      deleteInstitutionMembership({ institutionId, userId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.memberships.all(),
      });
      success("Membership removed successfully");
    },
    onError: (err) => {
      const message = err.response?.data?.detail || "Failed to delete membership";
      showError(message);
    },
  });
}