// src/api/institutions.js
import apiClient from "../lib/apiClient";
import Institution from "../models/institutions"; 

// GET all or filtered institutions (Returns Institutions[])
export const getInstitutions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/institutions?${queryString}` : "/institutions";

    const { data } = await apiClient.get(url);

    if (Array.isArray(data)) {
      return data.map((item) => Institution.fromApiResponse(item));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch institutions:", err);
    throw err;
  }
};



// CREATE a new institution (Returns created Institutions instance)
export const createInstitution = async (institutionData) => {
  if (!institutionData || typeof institutionData !== "object") {
    throw new Error("Invalid institution data provided");
  }
  if (!institutionData.name || !institutionData.code) {
    throw new Error("Missing required institution fields");
  }
  try {
    const { data } = await apiClient.post("/institutions", institutionData);
    return Institution.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to create institution:", err);
    throw err;
  }
};



// UPDATE an existing institution (Returns updated Institutions instance)
export const updateInstitution = async (id, updates) => {
  console.log("Updating institution with ID:", id, "with updates:", updates);
  try {
    const { data } = await apiClient.patch(`/institutions/${id}`, updates);
    return Institution.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to update institution:", err);
    throw err;
  }
};



// DELETE an institution by ID (Returns success status)
export const deleteInstitution = async (id) => {
  try {
    await apiClient.delete(`/institutions/${id}`);
    return { status: "success" };
  } catch (err) {
    console.error("Failed to delete institution:", err);
    throw err;
  }
};