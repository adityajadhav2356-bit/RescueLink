const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  `http://${window.location.hostname}:5000`;

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

const api = {
  health: () => request("/api/health"),

  workers: {
    getAll: () => request("/api/workers"),

    getById: (id) => request(`/api/workers/${id}`),

    create: (data) =>
      request("/api/workers", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      request(`/api/workers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      request(`/api/workers/${id}`, {
        method: "DELETE",
      }),
  },

  alerts: {
    getActive: () => request("/api/alerts"),

    getAll: () => request("/api/alerts/all"),

    getById: (id) => request(`/api/alerts/${id}`),

    create: (data) =>
      request("/api/alerts", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    resolve: (id) =>
      request(`/api/alerts/${id}/resolve`, {
        method: "PATCH",
      }),
  },
};

export default api;