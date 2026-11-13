import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://ai-interview-s9rr.onrender.com"
    : "http://localhost:3000",
  withCredentials: true,
});

export default api;
