import Default from "../models/default";
import apiClient from "../config/apiClient";


export const getDefaultData = async () => {
  try {
    const response = await apiClient.get("/");
    const data = response.data;
    return new Default(data); // Create an instance of the Default model
  } catch (error) {
    console.error("Error fetching default data:", error);
    throw error;
  }
};