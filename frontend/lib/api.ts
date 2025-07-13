import { useAuth } from "../App";

export function useApi() {
  const { getToken } = useAuth();
  const token = getToken();

  const apiRequest = async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await globalThis.fetch(url, defaultOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `API request failed with status ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const get = <T>(url: string) => apiRequest<T>(url);
  const post = <T>(url: string, data: any) =>
    apiRequest<T>(url, { method: "POST", body: JSON.stringify(data) });
  const put = <T>(url: string, data: any) =>
    apiRequest<T>(url, { method: "PUT", body: JSON.stringify(data) });
  const del = <T>(url: string) => apiRequest<T>(url, { method: "DELETE" });

  // Mock functions for user management
  const registerUser = async (userData: any) => {
    // Mock implementation
    console.log("Mock register user:", userData);
    return Promise.resolve(userData);
  };

  const loginUser = async (username: string, password: string, role: any) => {
    // Mock implementation
    console.log("Mock login user:", { username, password, role });
    return Promise.resolve({ id: "1", username, role });
  };

  return {
    get,
    post,
    put,
    delete: del,
    registerUser,
    loginUser,
  };
}
