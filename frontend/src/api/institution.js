import apiClient from "../lib/apiClient";

export const getInstitutions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const { data } = await apiClient.get(`/institutions?${params}`);
    return data;
  } catch (err) {
    console.error("Failed to fetch institutions:", err);
    throw err;
  }
};

export const createInstitution = async (institutionData) => {
    if (!institutionData || typeof institutionData !== 'object') {
        throw new Error("Invalid institution data provided");
    }
    if(!institutionData.name || !institutionData.code) {
        throw new Error("Missing required institution fields");
    }
    try {
        const { data } = await apiClient.post("/institutions", institutionData);
        return data;
    } catch (err) {
        console.error("Failed to create institution:", err);
        throw err;
    }
};

export const updateInstitution = async (id, updates) => {
  try {
    const { data } = await apiClient.patch(`/institutions/${id}`, updates);
    return data;
  } catch (err) {
    console.error("Failed to update institution:", err);
    throw err;
  }
};

export const deleteInstitution = async (id) => {
  try {
    await apiClient.delete(`/institutions/${id}`);
    return { status: "success" };
  } catch (err) {
    console.error("Failed to delete institution:", err);
    throw err;
  }
};