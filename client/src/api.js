import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("jt_token");

  // If hitting admin routes, prioritize admin token
  if (config.url.startsWith("/admin") && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

export default API;
