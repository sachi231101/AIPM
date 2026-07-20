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
  studentForgotPassword: (data) => api.post("/student/forgot-password", data),
  adminLogin: (data) => api.post("/admin/login", data),
  logout: () => api.post("/logout"),
};

// ─── JOBS ────────────────────────────────────────────────────────────────────
export const jobService = {
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  adminGetAll: (params) => api.get("/admin/jobs", { params }),
  approve: (id) => api.put(`/admin/jobs/${id}/approve`),
  reject: (id) => api.put(`/admin/jobs/${id}/reject`),
  publish: (id, data) => api.put(`/admin/jobs/${id}/publish`, data),
  close: (id) => api.put(`/admin/jobs/${id}/close`),
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const studentService = {
  getAll: (params) => api.get("/admin/students", { params }),
  getProfile: () => api.get("/student/profile"),
  updateProfile: (data) => api.put("/student/profile", data),
  uploadResume: (formData) => api.post("/student/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

// ─── APPLICATIONS ────────────────────────────────────────────────────────────
export const applicationService = {
  apply: (data) => api.post("/apply", data),
  getMyApplications: () => api.get("/student/applications"),
  getByJob: (jobId) => api.get(`/admin/jobs/${jobId}/applications`),
  sendToCompany: (jobId) => api.post("/admin/send-to-company", { job_id: jobId }),
};

// ─── INSTITUTES ──────────────────────────────────────────────────────────────
export const instituteService = {
  getAll: () => api.get("/institutes"),
  create: (data) => api.post("/admin/institutes", data),
  update: (id, data) => api.put(`/admin/institutes/${id}`, data),
  delete: (id) => api.delete(`/admin/institutes/${id}`),
};

// ─── COMPANIES ───────────────────────────────────────────────────────────────
export const companyService = {
  getAll: (params) => api.get("/admin/companies", { params }),
  submitJob: (data) => api.post("/company/job-request", data),
};

// ─── EMAIL LOGS ──────────────────────────────────────────────────────────────
export const emailService = {
  getLogs: () => api.get("/admin/email-logs"),
};

export const settingsService = {
  get: () => api.get("/admin/settings"),
  update: (data) => api.put("/admin/settings", data),
  uploadLogo: (formData) => api.post("/admin/settings/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
};

// ─── SUB-ADMINS ──────────────────────────────────────────────────────────────
export const subadminService = {
  list: () => api.get("/admin/subadmins"),
  create: (data) => api.post("/admin/subadmins", data),
  update: (id, data) => api.put(`/admin/subadmins/${id}`, data),
  delete: (id) => api.delete(`/admin/subadmins/${id}`),
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export const adminService = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  getMe: () => api.get("/admin/me"),
};

// ─── CONTACT MESSAGES ────────────────────────────────────────────────────────
export const contactService = {
  submit: (data) => api.post("/contact", data),
  getAll: () => api.get("/admin/contact-messages"),
  delete: (id) => api.delete(`/admin/contact-messages/${id}`),
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const notificationService = {
  getAll: () => api.get("/admin/notifications"),
  markAsRead: (id) => api.put(`/admin/notifications/${id}/read`),
  markAllAsRead: () => api.put("/admin/notifications/read-all"),
};

export default api;
