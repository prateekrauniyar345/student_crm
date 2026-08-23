// src/api/people.js

import apiClient from "../lib/apiClient";
import People from "../models/people";

// GET all or filtered people (Returns People[])
export const getPeople = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/people/?${queryString}` : "/people/";

    const { data } = await apiClient.get(url);

    if (Array.isArray(data)) {
      return data.map((item) => People.fromApiResponse(item));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch people:", err);
    throw err;
  }
};

// GET all people (convenience wrapper)
export const getAllPeople = async () => {
  return getPeople();
};

// GET people by institution
export const getPeopleByInstitution = async (institutionId) => {
  return getPeople({ institution_id: institutionId });
};

// GET people by lifecycle stage
export const getPeopleByLifecycleStage = async (lifecycleStage) => {
  return getPeople({ lifecycle_stage: lifecycleStage });
};

// CREATE a new person (Returns created People instance)
export const createPerson = async (personData) => {
  if (!personData || typeof personData !== "object") {
    throw new Error("Invalid person data provided");
  }
  if (!personData.institution_id || !personData.first_name || !personData.last_name) {
    throw new Error("Missing required fields: institution_id, first_name, last_name");
  }
  try {
    const { data } = await apiClient.post("/people/", personData);
    return People.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to create person:", err);
    throw err;
  }
};

// UPDATE an existing person (Returns updated People instance)
export const updatePerson = async (personId, updates) => {
  try {
    const { data } = await apiClient.patch(`/people/${personId}`, updates);
    return People.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to update person:", err);
    throw err;
  }
};

// DELETE a person by ID (Returns success status)
export const deletePerson = async (personId) => {
  try {
    await apiClient.delete(`/people/${personId}`);
    return { status: "success" };
  } catch (err) {
    console.error("Failed to delete person:", err);
    throw err;
  }
};
