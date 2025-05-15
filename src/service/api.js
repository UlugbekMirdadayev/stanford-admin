import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // backend API manzili
});

// Token qo'shish uchun interceptor (agar kerak bo'lsa)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
