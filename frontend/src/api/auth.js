// src/api/auth.js
import apiClient from "../lib/apiClient";
import User from "../models/user";

export const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/me");
  if (!response.data) {
    throw new Error("No user data returned from server");
  }
  // Parse response using your User model
  return User.fromApiResponse(response.data);
};