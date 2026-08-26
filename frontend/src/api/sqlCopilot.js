// src/api/sqlCopilot.js

import apiClient from "../lib/apiClient";

// Execute custom read-only SQL query
export const executeSqlQuery = async (query) => {
  try {
    const { data } = await apiClient.post("/sql/execute", { query });
    return data;
  } catch (err) {
    console.error("Failed to execute SQL query:", err);
    throw err;
  }
};

// Natural language AI Co-Pilot query
export const queryAICopilot = async (prompt, history = []) => {
  try {
    const { data } = await apiClient.post("/sql/ai-copilot", { prompt, history });
    return data;
  } catch (err) {
    console.error("Failed to query AI Co-Pilot:", err);
    throw err;
  }
};

// Fetch allowed schema metadata for browser
export const getAllowedSchema = async () => {
  try {
    const { data } = await apiClient.get("/sql/schema");
    return data;
  } catch (err) {
    console.error("Failed to fetch allowed schema metadata:", err);
    throw err;
  }
};
