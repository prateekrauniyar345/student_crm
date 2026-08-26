// src/hooks/useSqlCopilot.js

import { useQuery, useMutation } from "@tanstack/react-query";
import { executeSqlQuery, queryAICopilot, getAllowedSchema } from "../api/sqlCopilot";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// Fetch allowed schema definition
export function useAllowedSchema() {
  const { session, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["sql", "schema"],
    queryFn: getAllowedSchema,
    enabled: !!isAuthenticated && !!session,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Execute Raw SQL Query Mutation
export function useExecuteSql() {
  const { error: showError } = useToast();

  return useMutation({
    mutationFn: (query) => executeSqlQuery(query),
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to execute SQL query";
      showError(message);
    },
  });
}

// AI Co-Pilot Query Mutation
export function useAICopilot() {
  const { error: showError } = useToast();

  return useMutation({
    mutationFn: ({ prompt, history }) => queryAICopilot(prompt, history),
    onError: (err) => {
      const message =
        err.response?.data?.detail || err.message || "Failed to process AI Co-Pilot query";
      showError(message);
    },
  });
}
