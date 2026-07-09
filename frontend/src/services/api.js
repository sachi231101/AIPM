import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("apms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("apms_token");
      localStorage.removeItem("apms_user");
      window.location.href = "/student/login";
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authService = {
  studentLogin: (data) => api.post("/student/login", data),
  studentRegister: (data) => api.post("/student/register", data),
  adminLogin: (data) => api.post("/admin/login", data),
  logout: () => api.post("/logout"),
};

// ─── JOBS ────────────────────────────────────────────────────────────────────
export const jobService = {
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  approve: (id) => api.patch(`/jobs/${id}/approve`),
  reject: (id) => api.patch(`/jobs/${id}/reject`),
  publish: (id) => api.patch(`/jobs/${id}/publish`),
  close: (id) => api.patch(`/jobs/${id}/close`),
  setEligibleInstitutes: (id, data) => api.post(`/jobs/${id}/institutes`, data),
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const studentService = {
  getAll: (params) => api.get("/students", { params }),
  getById: (id) => api.get(`/students/${id}`),
  updateProfile: (id, data) => api.put(`/students/${id}`, data),
  uploadResume: (id, formData) =>
    api.post(`/students/${id}/resume`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── APPLICATIONS ────────────────────────────────────────────────────────────
export const applicationService = {
  apply: (data) => api.post("/applications", data),
  getByJob: (jobId) => api.get(`/jobs/${jobId}/applications`),
  getByStudent: (studentId) => api.get(`/students/${studentId}/applications`),
  sendToCompany: (jobId) => api.post(`/jobs/${jobId}/send-applications`),
};

// ─── INSTITUTES ──────────────────────────────────────────────────────────────
export const instituteService = {
  getAll: () => api.get("/institutes"),
  create: (data) => api.post("/institutes", data),
  update: (id, data) => api.put(`/institutes/${id}`, data),
  delete: (id) => api.delete(`/institutes/${id}`),
};

// ─── COMPANIES ───────────────────────────────────────────────────────────────
export const companyService = {
  getAll: (params) => api.get("/companies", { params }),
  getById: (id) => api.get(`/companies/${id}`),
  submitJob: (data) => api.post("/company/submit-job", data),
};

// ─── EMAIL LOGS ──────────────────────────────────────────────────────────────
export const emailService = {
  getLogs: () => api.get("/email-logs"),
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export const settingsService = {
  get: () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
};

export default api;
