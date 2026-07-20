import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

import { AuthProvider } from "./hooks/useAuth";
import Loading from "./components/Loading/Loading";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

// Layouts
const PublicLayout = lazy(() => import("./layouts/PublicLayout"));
const StudentLayout = lazy(() => import("./layouts/StudentLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

// Public Pages
const Home = lazy(() => import("./pages/Home/Home"));
const About = lazy(() => import("./pages/About/About"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const PlacementDrives = lazy(() => import("./pages/PlacementDrives/PlacementDrives"));
const JobDetails = lazy(() => import("./pages/JobDetails/JobDetails"));

// Student Pages
const StudentLogin = lazy(() => import("./pages/Student/Login/Login"));
const Register = lazy(() => import("./pages/Student/Register/Register"));
const ForgotPassword = lazy(() => import("./pages/Student/ForgotPassword/ForgotPassword"));
const StudentDashboard = lazy(() => import("./pages/Student/Dashboard/Dashboard"));
const Profile = lazy(() => import("./pages/Student/Profile/Profile"));
const AvailableJobs = lazy(() => import("./pages/Student/AvailableJobs/AvailableJobs"));
const AppliedJobs = lazy(() => import("./pages/Student/AppliedJobs/AppliedJobs"));

// Company Pages
const SubmitJob = lazy(() => import("./pages/Company/SubmitJob/SubmitJob"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/Admin/Login/Login"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard/Dashboard"));
const Institutes = lazy(() => import("./pages/Admin/Institutes/Institutes"));
const Students = lazy(() => import("./pages/Admin/Students/Students"));
const Companies = lazy(() => import("./pages/Admin/Companies/Companies"));
const Jobs = lazy(() => import("./pages/Admin/Jobs/Jobs"));
const AdminJobDetails = lazy(() => import("./pages/Admin/JobDetails/JobDetails"));
const Applications = lazy(() => import("./pages/Admin/Applications/Applications"));
const EmailLogs = lazy(() => import("./pages/Admin/EmailLogs/EmailLogs"));
const AdminMessages = lazy(() => import("./pages/Admin/Messages/Messages"));
const AdminSettings = lazy(() => import("./pages/Admin/Settings/Settings"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* ── PUBLIC ──────────────────────────────────────────────────── */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/placement-drives" element={<PlacementDrives />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/company/submit-job" element={<SubmitJob />} />
            </Route>

            {/* ── AUTH (no layout) ─────────────────────────────────────────── */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/register" element={<Register />} />
            <Route path="/student/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ── STUDENT ──────────────────────────────────────────────────── */}
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<Profile />} />
              <Route path="/student/jobs" element={<AvailableJobs />} />
              <Route path="/student/applied" element={<AppliedJobs />} />
            </Route>

            {/* ── ADMIN ────────────────────────────────────────────────────── */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/institutes" element={<Institutes />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/companies" element={<Companies />} />
              <Route path="/admin/jobs" element={<Jobs />} />
              <Route path="/admin/jobs/:id" element={<AdminJobDetails />} />
              <Route path="/admin/applications" element={<Applications />} />
              <Route path="/admin/email-logs" element={<EmailLogs />} />
              <Route path="/admin/contact-messages" element={<AdminMessages />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  );
}
