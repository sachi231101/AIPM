import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const menuItems = [
  { to: "/company/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/company/profile", icon: "bi-buildings-fill", label: "Company Profile" },
  { to: "/company/jobs", icon: "bi-briefcase-fill", label: "Jobs" },
  { to: "/company/applications", icon: "bi-file-earmark-check-fill", label: "Applications" },
  { to: "/company/settings", icon: "bi-gear-fill", label: "Settings" },
];

export default function CompanySidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/company/login");
  };

  return (
    <aside className={`apms-sidebar d-flex flex-column ${collapsed ? "collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand d-flex align-items-center justify-content-between px-3 py-3">
        {!collapsed && (
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
        <button className="btn btn-sm btn-link text-white p-0 ms-auto" onClick={onToggle} aria-label="Toggle sidebar">
          <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"} fs-5`}></i>
        </button>
      </div>

      <hr className="border-secondary my-0" />

      {/* Nav Items */}
      <nav className="flex-grow-1 py-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link d-flex align-items-center gap-3 px-3 py-2.5 text-decoration-none ${isActive ? "active" : ""}`
            }
            title={collapsed ? item.label : ""}
          >
            <i className={`bi ${item.icon} sidebar-icon fs-5`}></i>
            {!collapsed && <span className="sidebar-label fw-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <hr className="border-secondary my-0" />

      {/* User info & Logout */}
      <div className="px-3 py-3">
        {!collapsed && user && (
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
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
