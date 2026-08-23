// src/api/studentTermRecords.js

import apiClient from "../lib/apiClient";
import StudentTermRecord from "../models/studentTermRecord";

// GET all or filtered student term records (Returns StudentTermRecord[])
export const getStudentTermRecords = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const url = queryString
      ? `/student-term-records/?${queryString}`
      : "/student-term-records/";

    const { data } = await apiClient.get(url);

    if (Array.isArray(data)) {
      return data.map((item) => StudentTermRecord.fromApiResponse(item));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch student term records:", err);
    throw err;
  }
};

// GET all student term records (convenience wrapper)
export const getAllStudentTermRecords = async () => {
  return getStudentTermRecords();
};

// GET student term records by person ID
export const getStudentTermRecordsByPersonId = async (personId) => {
  return getStudentTermRecords({ person_id: personId });
};

// GET student term records by term ID
export const getStudentTermRecordsByTermId = async (termId) => {
  return getStudentTermRecords({ term_id: termId });
};

// CREATE a new student term record (Returns created StudentTermRecord instance)
export const createStudentTermRecord = async (recordData) => {
  if (!recordData || typeof recordData !== "object") {
    throw new Error("Invalid student term record data provided");
  }
  if (!recordData.person_id || !recordData.term_id) {
    throw new Error("Missing required fields: person_id, term_id");
  }
  try {
    const { data } = await apiClient.post("/student-term-records/", recordData);
    return StudentTermRecord.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to create student term record:", err);
    throw err;
  }
};

// UPDATE an existing student term record (Returns updated StudentTermRecord instance)
export const updateStudentTermRecord = async (recordId, updates) => {
  try {
    const { data } = await apiClient.patch(
      `/student-term-records/${recordId}`,
      updates
    );
    return StudentTermRecord.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to update student term record:", err);
    throw err;
  }
};

// DELETE a student term record by ID (Returns success status)
export const deleteStudentTermRecord = async (recordId) => {
  try {
    await apiClient.delete(`/student-term-records/${recordId}`);
    return { status: "success" };
  } catch (err) {
    console.error("Failed to delete student term record:", err);
    throw err;
  }
};
