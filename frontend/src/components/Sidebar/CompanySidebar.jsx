import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const menuItems = [
  { to: "/company/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/company/profile", icon: "bi-buildings-fill", label: "Company Profile" },
  { to: "/company/jobs", icon: "bi-briefcase-fill", label: "Jobs" },
  { to: "/company/applications", icon: "bi-file-earmark-check-fill", label: "Applications" },
  { to: "/company/settings", icon: "bi-gear-fill", label: "Settings" },
];

export default function CompanySidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onCloseMobile?.();
    logout();
    navigate("/company/login");
  };

  const handleNavClick = () => {
    onCloseMobile?.();
  };

  return (
    <>
      {/* Translucent Backdrop on Mobile */}
      {mobileOpen && (
        <div className="sidebar-backdrop d-md-none" onClick={onCloseMobile}></div>
      )}

      <aside className={`apms-sidebar d-flex flex-column ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand d-flex align-items-center justify-content-between px-3 py-3">
          {(!collapsed || mobileOpen) && (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-buildings-fill text-warning fs-5"></i>
              <div>
                <div className="fw-bold text-white leading-tight">Company Portal</div>
                <div className="text-white-50 small" style={{ fontSize: "0.72rem" }}>
                  Aadya Placement Cell
                </div>
              </div>
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button className="btn btn-sm btn-link text-white p-0 ms-auto d-none d-md-block" onClick={onToggle} aria-label="Toggle sidebar">
            <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"} fs-5`}></i>
          </button>

          {/* Mobile Close Button */}
          <button className="btn btn-sm btn-link text-white p-0 ms-auto d-md-none" onClick={onCloseMobile} aria-label="Close sidebar">
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <hr className="border-secondary my-0" />

        {/* Nav Items */}
        <nav className="flex-grow-1 py-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `sidebar-link d-flex align-items-center gap-3 px-3 py-2.5 text-decoration-none ${isActive ? "active" : ""}`
              }
              title={collapsed && !mobileOpen ? item.label : ""}
            >
              <i className={`bi ${item.icon} sidebar-icon fs-5`}></i>
              {(!collapsed || mobileOpen) && <span className="sidebar-label fw-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <hr className="border-secondary my-0" />

        {/* User info & Logout */}
        <div className="px-3 py-3">
          {(!collapsed || mobileOpen) && user && (
            <div className="mb-2 px-1">
              <div className="fw-bold text-white small text-truncate">{user.name || user.company_name || "Company Recruiter"}</div>
              <div className="text-white-50 text-truncate" style={{ fontSize: "0.72rem" }}>{user.email || "hr@company.com"}</div>
            </div>
          )}
          <button
            className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            {(!collapsed || mobileOpen) && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
