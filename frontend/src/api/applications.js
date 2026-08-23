// src/api/applications.js

import apiClient from "../lib/apiClient";
import Application from "../models/application";

// GET all or filtered applications (Returns Application[])
export const getApplications = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/applications/?${queryString}` : "/applications/";

    const { data } = await apiClient.get(url);

    if (Array.isArray(data)) {
      return data.map((item) => Application.fromApiResponse(item));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch applications:", err);
    throw err;
  }
};

// GET all applications (convenience wrapper)
export const getAllApplications = async () => {
  return getApplications();
};

// GET applications by person ID
export const getApplicationsByPersonId = async (personId) => {
  return getApplications({ person_id: personId });
};

// GET applications by program ID
export const getApplicationsByProgramId = async (programId) => {
  return getApplications({ program_id: programId });
};

// GET applications by stage
export const getApplicationsByStage = async (stage) => {
  return getApplications({ stage: stage });
};

// CREATE a new application (Returns created Application instance)
export const createApplication = async (applicationData) => {
  if (!applicationData || typeof applicationData !== "object") {
    throw new Error("Invalid application data provided");
  }
  if (
    !applicationData.person_id ||
    !applicationData.program_id ||
    !applicationData.application_year
  ) {
    throw new Error(
      "Missing required fields: person_id, program_id, application_year"
    );
  }
  try {
    const { data } = await apiClient.post("/applications/", applicationData);
    return Application.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to create application:", err);
    throw err;
  }
};

// UPDATE an existing application (Returns updated Application instance)
export const updateApplication = async (applicationId, updates) => {
  try {
    const { data } = await apiClient.patch(
      `/applications/${applicationId}`,
      updates
    );
    return Application.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to update application:", err);
    throw err;
  }
};

// DELETE an application by ID (Returns success status)
export const deleteApplication = async (applicationId) => {
  try {
    await apiClient.delete(`/applications/${applicationId}`);
    return { status: "success" };
  } catch (err) {
    console.error("Failed to delete application:", err);
    throw err;
  }
};
