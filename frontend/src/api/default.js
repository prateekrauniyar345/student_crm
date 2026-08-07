import Default from "../models/default";
import apiClient from "../config/apiClient";


export const getDefaultData = async () => {
  try {
    const response = await apiClient.get("/");
    const data = response.data;
    return new Default(
        data.message,
        data.status,
        data.version,
        data.date,
        data.version_tag,
        data.docs_url
    );
  } catch (error) {
    console.error("Error fetching default data:", error);
    throw error;
  }
};