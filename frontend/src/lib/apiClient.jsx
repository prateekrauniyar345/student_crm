import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1", // Use the API_PREFIX from the backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;