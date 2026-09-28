const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token
        ? { Authorization: `Bearer ${options.token}` }
        : {})
    },
    ...options,
    body: options.body
      ? JSON.stringify(options.body)
      : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export const api = {
  // =========================
  // AUTH
  // =========================

  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body
    }),

  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body
    }),


  // =========================
  // DASHBOARD
  // =========================

  dashboard: (token, params) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value)
    ).toString();

    return request(
      `/analytics/dashboard${query ? `?${query}` : ""}`,
      { token }
    );
  },


  // =========================
  // OVERVIEW
  // =========================

  overview: (token) =>
    request("/analytics/overview", {
      token
    }),


  // =========================
  // UPDATE ORDER
  // =========================

  updateOrder: (token, id, body) =>
    request(`/orders/${id}`, {
      method: "PUT",
      token,
      body
    })
};