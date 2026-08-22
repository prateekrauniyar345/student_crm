// src/api/programs.js

import apiClient from "../lib/apiClient";
import Program from "../models/program";

// GET all or filtered programs (Returns Program[])
export const getPrograms = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/programs/?${queryString}` : "/programs/";

    const { data } = await apiClient.get(url);

    if (Array.isArray(data)) {
      return data.map((item) => Program.fromApiResponse(item));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch programs:", err);
    throw err;
  }
};

// GET all programs (convenience wrapper)
export const getAllPrograms = async () => {
  return getPrograms();
};

// GET programs by institution
export const getProgramsByInstitution = async (institutionId) => {
  return getPrograms({ institution_id: institutionId });
};

// CREATE a new program (Returns created Program instance)
export const createProgram = async (programData) => {
  if (!programData || typeof programData !== "object") {
    throw new Error("Invalid program data provided");
  }
  if (!programData.institution_id || !programData.code || !programData.name) {
    throw new Error("Missing required program fields: institution_id, code, name");
  }
  try {
    const { data } = await apiClient.post("/programs/", programData);
    return Program.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to create program:", err);
    throw err;
  }
};

// UPDATE an existing program (Returns updated Program instance)
export const updateProgram = async (programId, updates) => {
  try {
    const { data } = await apiClient.patch(`/programs/${programId}`, updates);
    return Program.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to update program:", err);
    throw err;
  }
};

// DELETE a program by ID (Returns success status)
export const deleteProgram = async (programId) => {
  try {
    await apiClient.delete(`/programs/${programId}`);
    return { status: "success" };
  } catch (err) {
    console.error("Failed to delete program:", err);
    throw err;
  }
};
