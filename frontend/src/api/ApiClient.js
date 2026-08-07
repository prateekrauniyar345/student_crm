import { supabase } from "../lib/supabaseClient";

class ApiClient {
  static baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  static async request(endpoint, options = {}) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      throw new Error("You must be signed in.");
    }

    const response = await fetch(
      `${this.baseUrl}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => null);

      throw new Error(
        errorData?.detail ??
          `Request failed with status ${response.status}`
      );
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  static get(endpoint) {
    return this.request(endpoint);
  }

  static post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static patch(endpoint, body) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

export default ApiClient;
