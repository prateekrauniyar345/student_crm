// src/api/studentProfiles.js

import apiClient from "../lib/apiClient";
import StudentProfile from "../models/studentProfile";

// GET all or filtered student profiles (Returns StudentProfile[])
export const getStudentProfiles = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/student-profiles/?${queryString}` : "/student-profiles/";

    const { data } = await apiClient.get(url);

    if (Array.isArray(data)) {
      return data.map((item) => StudentProfile.fromApiResponse(item));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch student profiles:", err);
    throw err;
  }
};

// GET all student profiles (convenience wrapper)
export const getAllStudentProfiles = async () => {
  return getStudentProfiles();
};

// GET student profile by person ID
export const getStudentProfileByPersonId = async (personId) => {
  return getStudentProfiles({ person_id: personId });
};

// CREATE a new student profile (Returns created StudentProfile instance)
export const createStudentProfile = async (profileData) => {
  if (!profileData || typeof profileData !== "object") {
    throw new Error("Invalid student profile data provided");
  }
  if (!profileData.person_id || !profileData.student_number) {
    throw new Error("Missing required fields: person_id, student_number");
  }
  try {
    const { data } = await apiClient.post("/student-profiles/", profileData);
    return StudentProfile.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to create student profile:", err);
    throw err;
  }
};

// UPDATE an existing student profile (Returns updated StudentProfile instance)
// Note: person_id is the primary key for student_profiles
export const updateStudentProfile = async (personId, updates) => {
  try {
    const { data } = await apiClient.patch(`/student-profiles/${personId}`, updates);
    return StudentProfile.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to update student profile:", err);
    throw err;
  }
};

// DELETE a student profile by person ID (Returns success status)
export const deleteStudentProfile = async (personId) => {
  try {
    await apiClient.delete(`/student-profiles/${personId}`);
    return { status: "success" };
  } catch (err) {
    console.error("Failed to delete student profile:", err);
    throw err;
  }
};
