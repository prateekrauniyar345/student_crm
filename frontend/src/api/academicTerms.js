// src/api/academicTerms.js

import apiClient from "../lib/apiClient";
import AcademicTerm from "../models/academicTerm";

// GET all or filtered academic terms (Returns AcademicTerm[])
export const getAcademicTerms = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/academic-terms/?${queryString}` : "/academic-terms/";

    const { data } = await apiClient.get(url);

    if (Array.isArray(data)) {
      return data.map((item) => AcademicTerm.fromApiResponse(item));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch academic terms:", err);
    throw err;
  }
};

// GET all academic terms (convenience wrapper)
export const getAllAcademicTerms = async () => {
  return getAcademicTerms();
};

// GET academic terms by institution
export const getAcademicTermsByInstitution = async (institutionId) => {
  return getAcademicTerms({ institution_id: institutionId });
};

// GET academic terms by application year
export const getAcademicTermsByYear = async (applicationYear) => {
  return getAcademicTerms({ application_year: applicationYear });
};

// CREATE a new academic term (Returns created AcademicTerm instance)
export const createAcademicTerm = async (termData) => {
  if (!termData || typeof termData !== "object") {
    throw new Error("Invalid academic term data provided");
  }
  if (
    !termData.institution_id ||
    !termData.code ||
    !termData.name ||
    !termData.start_date ||
    !termData.end_date
  ) {
    throw new Error(
      "Missing required academic term fields: institution_id, code, name, start_date, end_date"
    );
  }
  try {
    const { data } = await apiClient.post("/academic-terms/", termData);
    return AcademicTerm.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to create academic term:", err);
    throw err;
  }
};

// UPDATE an existing academic term (Returns updated AcademicTerm instance)
export const updateAcademicTerm = async (termId, updates) => {
  try {
    const { data } = await apiClient.patch(`/academic-terms/${termId}`, updates);
    return AcademicTerm.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to update academic term:", err);
    throw err;
  }
};

// DELETE an academic term by ID (Returns success status)
export const deleteAcademicTerm = async (termId) => {
  try {
    await apiClient.delete(`/academic-terms/${termId}`);
    return { status: "success" };
  } catch (err) {
    console.error("Failed to delete academic term:", err);
    throw err;
  }
};
