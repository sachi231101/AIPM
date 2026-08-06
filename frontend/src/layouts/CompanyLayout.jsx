import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CompanySidebar from "../components/Sidebar/CompanySidebar";
import ProtectedLayout from "../components/ProtectedLayout/ProtectedLayout";
import { useAuth } from "../hooks/useAuth";

const mobileQuickNav = [
  { to: "/company/dashboard", label: "Dashboard" },
  { to: "/company/profile", label: "Company Profile" },
  { to: "/company/jobs", label: "Jobs" },
  { to: "/company/applications", label: "Applications" },
  { to: "/company/settings", label: "Settings" },
];

export default function CompanyLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/company/login");
  };

  return (
    <ProtectedLayout requiredRole="company">
      <div className="company-layout d-flex" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <CompanySidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, overflow: "hidden" }}>
          {/* Header */}
          <header className="navbar navbar-expand border-bottom bg-white px-3 px-md-4 py-2 flex-shrink-0 shadow-sm">
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-primary btn-sm d-md-none"
                onClick={() => setMobileOpen(true)}
                aria-label="Toggle navigation"
              >
                <i className="bi bi-list fs-5"></i>
              </button>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2.5 py-1.5 rounded-pill d-none d-sm-inline-block">
                  <i className="bi bi-buildings-fill me-1"></i> Recruiter Portal
                </span>
              </div>
            </div>

            <div className="ms-auto d-flex align-items-center gap-2 gap-sm-3">
              {/* Company Info Badge */}
              <div className="d-flex align-items-center gap-2 bg-light px-2.5 px-sm-3 py-1 rounded-pill border">
                <div
                  className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 28, height: 28, fontSize: "0.8rem" }}
                >
                  {(user?.name || user?.company_name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="lh-1 text-start">
                  <div className="fw-bold text-dark small text-truncate" style={{ maxWidth: 140 }}>{user?.name || user?.company_name || "Company Recruiter"}</div>
                  <div className="text-muted d-none d-sm-block" style={{ fontSize: "0.7rem" }}>HR Portal</div>
                </div>
              </div>

              {/* Quick Logout button */}
              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-2.5 px-sm-3"
                onClick={handleLogout}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right me-1"></i> <span className="d-none d-sm-inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Quick Mobile Horizontal Navigation Bar */}
          <div className="bg-white border-bottom px-2 py-1.5 d-flex align-items-center gap-1.5 overflow-x-auto d-md-none shadow-sm flex-shrink-0">
            {mobileQuickNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `btn btn-xs rounded-pill px-3 py-1 text-nowrap fw-semibold ${
                    isActive ? "btn-primary shadow-sm" : "btn-light text-dark border"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Main Body View */}
          <main className="flex-grow-1 p-3 p-md-4 overflow-y-auto bg-light">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
