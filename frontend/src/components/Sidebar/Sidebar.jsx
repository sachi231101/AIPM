import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const menuItems = [
  { to: "/admin/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { to: "/admin/institutes", icon: "bi-bank2", label: "Institutes" },
  { to: "/admin/students", icon: "bi-people-fill", label: "Students" },
  { to: "/admin/companies", icon: "bi-buildings-fill", label: "Companies" },
  { to: "/admin/jobs", icon: "bi-briefcase-fill", label: "Jobs" },
  { to: "/admin/applications", icon: "bi-file-earmark-check-fill", label: "Applications" },
  { to: "/admin/email-logs", icon: "bi-envelope-check-fill", label: "Email Logs" },
  { to: "/admin/contact-messages", icon: "bi-chat-dots-fill", label: "Messages" },
  { to: "/admin/settings", icon: "bi-gear-fill", label: "Settings" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <aside className={`apms-sidebar d-flex flex-column ${collapsed ? "collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand d-flex align-items-center justify-content-between px-3 py-3">
        {!collapsed && (
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-mortarboard-fill text-warning fs-5"></i>
            <span className="fw-bold text-white">APMS Admin</span>
          </div>
        )}
        <button className="btn btn-sm btn-link text-white p-0" onClick={onToggle} aria-label="Toggle sidebar">
          <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"} fs-5`}></i>
        </button>
      </div>

      <hr className="border-secondary my-0" />

      {/* Nav Items */}
      <nav className="flex-grow-1 py-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link d-flex align-items-center gap-3 px-3 py-2 text-decoration-none ${isActive ? "active" : ""}`
            }
            title={collapsed ? item.label : ""}
          >
            <i className={`bi ${item.icon} sidebar-icon`}></i>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <hr className="border-secondary my-0" />

      {/* Logout */}
      <div className="px-3 py-3">
        <button
          className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
