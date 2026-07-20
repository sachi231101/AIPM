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
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import PlacementDrives from "./pages/PlacementDrives/PlacementDrives";
import JobDetails from "./pages/JobDetails/JobDetails";

// Student Pages
import StudentLogin from "./pages/Student/Login/Login";
import Register from "./pages/Student/Register/Register";
import ForgotPassword from "./pages/Student/ForgotPassword/ForgotPassword";
import StudentDashboard from "./pages/Student/Dashboard/Dashboard";
import Profile from "./pages/Student/Profile/Profile";
import AvailableJobs from "./pages/Student/AvailableJobs/AvailableJobs";
import AppliedJobs from "./pages/Student/AppliedJobs/AppliedJobs";
import ResumeBuilder from "./pages/Student/ResumeBuilder/ResumeBuilder";

// Company Pages
import SubmitJob from "./pages/Company/SubmitJob/SubmitJob";

// Admin Pages
import AdminLogin from "./pages/Admin/Login/Login";
import AdminDashboard from "./pages/Admin/Dashboard/Dashboard";
import Institutes from "./pages/Admin/Institutes/Institutes";
import Students from "./pages/Admin/Students/Students";
import Companies from "./pages/Admin/Companies/Companies";
import Jobs from "./pages/Admin/Jobs/Jobs";
import AdminJobDetails from "./pages/Admin/JobDetails/JobDetails";
import Applications from "./pages/Admin/Applications/Applications";
import EmailLogs from "./pages/Admin/EmailLogs/EmailLogs";
import AdminMessages from "./pages/Admin/Messages/Messages";
import AdminSettings from "./pages/Admin/Settings/Settings";

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
              <Route path="/student/resume-builder" element={<ResumeBuilder />} />
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
