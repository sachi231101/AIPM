import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import CompanySidebar from "../components/Sidebar/CompanySidebar";
import ProtectedLayout from "../components/ProtectedLayout/ProtectedLayout";
import { useAuth } from "../hooks/useAuth";

export default function CompanyLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/company/login");
  };

  return (
    <ProtectedLayout requiredRole="company">
      <div className="company-layout d-flex" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <CompanySidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* Main Content Area */}
        <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, overflow: "hidden" }}>
          {/* Header */}
          <header className="navbar navbar-expand border-bottom bg-white px-4 py-2 flex-shrink-0 shadow-sm">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-light btn-sm d-md-none"
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Toggle navigation"
              >
                <i className="bi bi-list fs-5"></i>
              </button>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2.5 py-1.5 rounded-pill">
                  <i className="bi bi-buildings-fill me-1"></i> Recruiter Portal
                </span>
              </div>
            </div>

            <div className="ms-auto d-flex align-items-center gap-3">
              {/* Company Info Badge */}
              <div className="d-none d-sm-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
                <div
                  className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28, fontSize: "0.8rem" }}
                >
                  {(user?.name || user?.company_name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="lh-1 text-start">
                  <div className="fw-bold text-dark small">{user?.name || user?.company_name || "Company Recruiter"}</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>HR Portal</div>
                </div>
              </div>

              {/* Quick Logout button */}
              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                onClick={handleLogout}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </div>
          </header>

          {/* Main Body View */}
          <main className="flex-grow-1 p-4 overflow-y-auto bg-light">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
