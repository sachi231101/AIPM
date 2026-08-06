import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000/api`;

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
    const url = err.config?.url || "";
    const isAuthRequest = url.includes("login") || url.includes("register") || url.includes("forgot-password") || url.includes("otp");
    
    console.log("[Axios Interceptor] URL:", url, "Status:", err.response?.status, "isAuthRequest:", isAuthRequest);
    
    if (err.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("apms_token");
      localStorage.removeItem("apms_user");
      localStorage.removeItem("apms_role");
      
      const isAdminPath = window.location.pathname.startsWith("/admin");
      window.location.href = isAdminPath ? "/admin/login" : "/student/login";
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authService = {
  studentLogin: (data) => api.post("/student/login", data),
  sendStudentOtp: (data) => api.post("/student/send-otp", data),
  verifyStudentOtp: (data) => api.post("/student/verify-otp", data),
  resendStudentOtp: (data) => api.post("/student/resend-otp", data),

  studentRegister: (data) => api.post("/student/register", data),
  sendRegisterOtp: (data) => api.post("/student/register/send-otp", data),
  verifyRegisterOtp: (data) => api.post("/student/register/verify-otp", data),
  studentForgotPassword: (data) => api.post("/student/forgot-password", data),
  adminLogin: (data) => api.post("/admin/login", data),
  logout: () => api.post("/logout"),
};

// ─── JOBS ────────────────────────────────────────────────────────────────────
export const jobService = {
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  adminGetAll: (params) => api.get("/admin/jobs", { params }),
  create: (data) => api.post("/admin/jobs", data),
  approve: (id) => api.put(`/admin/jobs/${id}/approve`),
  reject: (id) => api.put(`/admin/jobs/${id}/reject`),
  publish: (id, data) => api.put(`/admin/jobs/${id}/publish`, data),
  close: (id) => api.put(`/admin/jobs/${id}/close`),
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const studentService = {
  getAll: (params) => api.get("/admin/students", { params }),
  bulkAction: (data) => api.post("/admin/students/bulk-action", data),
  approve: (id) => api.put(`/admin/students/${id}/approve`),
  hold: (id) => api.put(`/admin/students/${id}/hold`),
  reject: (id) => api.put(`/admin/students/${id}/reject`),
  getProfile: (params) => api.get("/student/profile", { params }),
  updateProfile: (data) => api.put("/student/profile", data),
  uploadProfilePhoto: (formData) => api.post("/student/profile/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  uploadResume: (formData) => api.post("/student/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

// ─── STUDENT CAREER PROFILES ──────────────────────────────────────────────────
export const studentProfileService = {
  getAll: () => api.get("/student/profiles"),
  create: (data) => api.post("/student/profiles", data),
  getById: (id) => api.get(`/student/profiles/${id}`),
  update: (id, data) => api.put(`/student/profiles/${id}`, data),
  delete: (id) => api.delete(`/student/profiles/${id}`),
  duplicate: (id) => api.post(`/student/profiles/${id}/duplicate`),
  setDefault: (id) => api.post(`/student/profiles/${id}/set-default`),
};

// ─── RESUMES ──────────────────────────────────────────────────────────────────
export const resumeService = {
  getAll: (params) => api.get("/student/resumes", { params }),
  save: (data) => api.post("/student/resumes", data),
  delete: (key) => api.delete(`/student/resumes/${key}`),
};

// ─── APPLICATIONS ────────────────────────────────────────────────────────────
export const applicationService = {
  apply: (data) => api.post("/apply", data),
  getMyApplications: () => api.get("/student/applications"),
  getAllAdmin: (params) => api.get("/admin/applications", { params }),
  getByJob: (jobId) => api.get(`/admin/jobs/${jobId}/applications`),
  sendToCompany: (jobId) => api.post("/admin/send-to-company", { job_id: jobId }),
};

// ─── COMPANIES ───────────────────────────────────────────────────────────────
export const companyService = {
  getPublic: () => api.get("/companies"),
  getAll: (params) => api.get("/admin/companies", { params }),
  inviteCompany: (data) => api.post("/admin/companies/invite", data),
  register: (data) => api.post("/company/register", data),
  login: (data) => api.post("/company/login", data),
  getProfile: (params) => api.get("/company/profile", { params }),
  updateProfile: (data) => api.put("/company/profile", data),
  getJobs: (params) => api.get("/company/jobs", { params }),
  createJob: (data) => api.post("/company/jobs", data),
  updateJob: (id, data) => api.put(`/company/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/company/jobs/${id}`),
  getApplications: () => api.get("/company/applications"),
  updateApplicationStatus: (id, status) => api.put(`/company/applications/${id}/status`, { status }),
  changePassword: (data) => api.put("/company/change-password", data),
  forgotPassword: (data) => api.post("/company/forgot-password", data),
  submitJob: (formData) => api.post("/company/job-request", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
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
