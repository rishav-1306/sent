const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export const apiFetch = async <T>(path: string, options: ApiOptions = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: options.skipAuth ? "omit" : "include",
  });

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload as T;
};

export { API_BASE_URL };


