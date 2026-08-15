// src/api/institutionMemberships.js
import apiClient from "../lib/apiClient";
import InstitutionMembership from "../models/institutionMembership";



export const getInstitutionMemberships = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.institution_id || filters.institutionId) {
      params.append("institution_id", filters.institution_id || filters.institutionId);
    }
    if (filters.user_id || filters.userId) {
      params.append("user_id", filters.user_id || filters.userId);
    }
    if (filters.role) {
      params.append("role", filters.role);
    }
    if (filters.department) {
      params.append("department", filters.department);
    }

    const queryString = params.toString();
    const url = queryString ? `/institution-memberships?${queryString}` : "/institution-memberships";

    const { data } = await apiClient.get(url);

    // Map each API response item to an InstitutionMembership model instance
    if (Array.isArray(data)) {
      return data.map((item) => InstitutionMembership.fromApiResponse(item));
    }

    return [];
  } catch (err) {
    console.error("Failed to fetch institution memberships:", err);
    throw err;
  }
};



export const createInstitutionMembership = async (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload provided for creating institution membership");
  }

  // If passed an InstitutionMembership model instance, use its helper method
  let body;
  if (payload instanceof InstitutionMembership) {
    body = payload.createInstitutionMembershipPayload();
  } else {
    const institutionId = payload.institution_id || payload.institutionId;
    const userId = payload.user_id || payload.userId;

    if (!institutionId || !userId) {
      throw new Error("Missing required fields: institution_id and user_id are required");
    }

    body = {
      institution_id: institutionId,
      user_id: userId,
      role: payload.role || "Viewer",
      department: payload.department ?? null,
    };
  }

  try {
    const { data } = await apiClient.post("/institution-memberships", body);
    return InstitutionMembership.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to create institution membership:", err);
    throw err;
  }
};



export const updateInstitutionMembership = async ({ institutionId, userId, data }) => {
  const targetInstitutionId = institutionId || data?.institution_id || data?.institutionId;
  const targetUserId = userId || data?.user_id || data?.userId;

  if (!targetInstitutionId || !targetUserId) {
    throw new Error("Missing required composite key: institutionId and userId are required");
  }

  const payload = {};
  if (data?.role !== undefined) payload.role = data.role;
  if (data?.department !== undefined) payload.department = data.department;

  try {
    const response = await apiClient.patch(
      `/institution-memberships?institution_id=${targetInstitutionId}&user_id=${targetUserId}`,
      payload
    );
    return InstitutionMembership.fromApiResponse(response.data);
  } catch (err) {
    console.error("Failed to update institution membership:", err);
    throw err;
  }
};




export const deleteInstitutionMembership = async ({ institutionId, userId }) => {
  if (!institutionId || !userId) {
    throw new Error("Missing required composite key: institutionId and userId are required to delete");
  }

  try {
    const { data } = await apiClient.delete(
      `/institution-memberships?institution_id=${institutionId}&user_id=${userId}`
    );
    return data;
  } catch (err) {
    console.error("Failed to delete institution membership:", err);
    throw err;
  }
};